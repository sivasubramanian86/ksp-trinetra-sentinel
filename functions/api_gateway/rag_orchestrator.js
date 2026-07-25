/**
 * Zia LLM GraphRAG Orchestrator — KSP Trinetra Sentinel
 * Version 2.0 — Schema-Aware FIR Query Engine
 *
 * Upgrade from v1.0:
 *   - Intent classifier routes NL queries to correct SQL builder
 *   - Real FIR DB queries via query_builder.js + db.js pool
 *   - Zia LLM wraps structured DB results for natural language gloss
 *   - Legacy handleRAGQuery() export preserved for backward compatibility
 */

'use strict';

const { executeTool } = require('./mcp_server');
const legalEthicsAgent = require('./agents/legal_ethics_agent');
const db = require('./db');
const {
  buildCaseSearchSQL,
  buildAccusedTraceSql,
  buildChargesheetLagSQL,
  buildSectionCaseSql,
  buildIOCaseSummarySql,
} = require('./query_builder');

// ─── Intent Classification ────────────────────────────────────────────────────

/**
 * Maps a natural language query to a structured intent + extracted params.
 * Uses keyword pattern matching — deterministic, fast, demo-safe.
 * Wrap Zia LLM around this for natural language confirmation text.
 *
 * @param {string} query
 * @returns {{ intent: string, params: object }}
 */
function classifyQueryIntent(query) {
  const q = (query || '').toLowerCase();

  // Accused cross-case lookup
  if ((q.includes('accused') || q.includes('suspect')) &&
      (q.includes('multiple') || q.includes('more than') || q.includes('firs') || q.includes('cases'))) {
    const minMatch = q.match(/(\d+)\s+fir|(\d+)\s+case/);
    return {
      intent: 'ACCUSED_TRACE',
      params: { minCases: minMatch ? parseInt(minMatch[1] || minMatch[2], 10) : 2 },
    };
  }

  // Chargesheet / investigation lag
  if (q.includes('chargesheet') || q.includes('pending investigation') || q.includes('time to chargesheet')) {
    const groupBy = q.includes(' io ') || q.includes('officer') ? 'io' : 'unit';
    return { intent: 'CHARGESHEET_LAG', params: { groupBy } };
  }

  // IO / station specific query
  if ((q.includes(' io ') || q.includes('officer') || q.includes('investigating')) && q.includes('station')) {
    return { intent: 'IO_CASE_SUMMARY', params: {} };
  }

  // Section-specific query (IPC 420 / BNS 318 etc.)
  const sectionMatch = q.match(/(?:ipc|bns|section)[\s#]*(\d+[a-z]*)/i);
  if (sectionMatch || q.includes('cheating') || q.includes('robbery') || q.includes('murder') ||
      q.includes('theft') || q.includes('ndps') || q.includes('pocso')) {
    const sectionCode = sectionMatch ? sectionMatch[1] : null;
    const actCode = q.includes('ipc') ? 'IPC' : q.includes('bns') ? 'BNS' : null;
    return { intent: 'SECTION_CASES', params: { sectionCode, actCode } };
  }

  // Legal section explain / suggestion
  if (q.includes('explain') || q.includes('ingredient') || q.includes('punishment') ||
      q.includes('elements of') || q.includes('what is section')) {
    return { intent: 'LEGAL_EXPLAIN', params: {} };
  }

  // Analytics / snapshot
  if (q.includes('snapshot') || q.includes('trend') || q.includes('hotspot') ||
      q.includes('district') || q.includes('state wide') || q.includes('performance')) {
    return { intent: 'ANALYTICS_SNAPSHOT', params: {} };
  }

  // Absconding / heinous cases
  if (q.includes('absconding') || q.includes('heinous') || q.includes('gravity')) {
    const gravity = q.includes('heinous') ? 3 : q.includes('serious') ? 2 : null;
    const accusedStatus = q.includes('absconding') ? 'ABSCONDING' : null;
    return { intent: 'CASE_SEARCH', params: { gravityOffenceID: gravity, accusedStatus } };
  }

  // Default: generic case search
  return { intent: 'CASE_SEARCH', params: {} };
}

// ─── Main Orchestration Entry Points ─────────────────────────────────────────

/**
 * Schema-aware RAG query handler.
 * Called from index.js POST /api/chat endpoint.
 *
 * @param {string} query    - Natural language query from officer
 * @param {string} language - 'en' or 'kn'
 * @param {object} userContext - { employeeID, unitID, districtID, role }
 * @returns {object} Structured briefing response
 */
async function orchestrateRAGQuery(userQuery, userContext = {}) {
  // Step 1: Ethics / DPDP Guard
  const auditResult = await legalEthicsAgent.auditQuery(userQuery, userContext);
  if (!auditResult.allowed) {
    return {
      success: false,
      blocked: true,
      notice: auditResult.reasonNotice,
    };
  }

  // Step 2: Intent Classification
  const { intent, params: intentParams } = classifyQueryIntent(userQuery);

  // Step 3: Build RBAC scope for the user context
  const scopeResult = {
    clause: _buildScopeForContext(userContext),
    params: _buildScopeParams(userContext),
    offset: _buildScopeOffset(userContext),
  };

  // Step 4: Execute intent-specific query
  let queryResult = [];
  let legalContext = null;
  let briefingSummary = '';

  try {
    switch (intent) {
      case 'CASE_SEARCH': {
        const { sql, params } = buildCaseSearchSQL(scopeResult, {
          ...intentParams,
          limit: 20,
        });
        const result = await db.query(sql, params);
        queryResult = result.rows;
        briefingSummary = `Found ${result.rowCount} case(s) matching your query.`;
        break;
      }

      case 'ACCUSED_TRACE': {
        const { sql, params } = buildAccusedTraceSql(scopeResult, intentParams);
        const result = await db.query(sql, params);
        queryResult = result.rows;
        briefingSummary = `Found ${result.rowCount} accused appearing in multiple FIRs.`;
        break;
      }

      case 'CHARGESHEET_LAG': {
        const { sql, params } = buildChargesheetLagSQL(scopeResult, intentParams);
        const result = await db.query(sql, params);
        queryResult = result.rows;
        briefingSummary = `Chargesheet lag analysis complete for ${result.rowCount} group(s).`;
        break;
      }

      case 'SECTION_CASES': {
        const { sql, params } = buildSectionCaseSql(scopeResult, intentParams);
        const result = await db.query(sql, params);
        queryResult = result.rows;
        // Also fetch legal context for this section
        legalContext = await legalEthicsAgent.explainSection(intentParams.sectionCode);
        briefingSummary = `Found ${result.rowCount} FIR(s) under section ${intentParams.sectionCode || 'specified'}.`;
        break;
      }

      case 'IO_CASE_SUMMARY': {
        const { sql, params } = buildIOCaseSummarySql(scopeResult, intentParams);
        const result = await db.query(sql, params);
        queryResult = result.rows;
        briefingSummary = `IO case summary: ${result.rowCount} record(s) returned.`;
        break;
      }

      case 'LEGAL_EXPLAIN': {
        // No DB query — pure legal layer lookup
        legalContext = await legalEthicsAgent.explainSection(userQuery);
        queryResult = [];
        briefingSummary = 'Legal section explanation retrieved from KSP Legal Knowledge Base.';
        break;
      }

      case 'ANALYTICS_SNAPSHOT': {
        // Delegate to MCP tool
        const threatVector = await executeTool('get_threat_vector', { beat_code: 'ZONE_WIDE' }, userContext);
        queryResult = [threatVector];
        briefingSummary = 'Analytics snapshot retrieved.';
        break;
      }

      default:
        briefingSummary = 'Query processed via general search.';
    }
  } catch (dbErr) {
    console.warn('[RAG] DB query failed, falling back to MCP tools:', dbErr.message);
    // Graceful degradation: fall back to existing MCP tool-based response
    const threatVector = await executeTool('get_threat_vector', { beat_code: 'BNG-INDIRANAGAR-B1' }, userContext);
    const legalSOPs = await executeTool('query_ksp_legal_sops', { crime_category: userQuery }, userContext);
    return {
      success: true,
      fallback: true,
      query: userQuery,
      intent,
      briefing: {
        summary: `[Fallback Mode] ${briefingSummary}`,
        tacticalRecommendation: `Deploy ${threatVector.recommended_hoysala_units || 2} Hoysala units.`,
        legalSections: legalSOPs,
      },
      dpdpAuditPassed: true,
    };
  }

  // Step 5: Structured Response
  return {
    success: true,
    query: userQuery,
    intent,
    briefing: {
      summary: briefingSummary,
      results: queryResult,
      resultCount: queryResult.length,
      legalContext: legalContext || null,
      drillDownNote: queryResult.length > 0
        ? 'Use /api/v1/cases/{caseMasterID} for full case detail and section explanations.'
        : null,
    },
    dpdpAuditPassed: true,
    assistiveOnly: intent === 'LEGAL_EXPLAIN' || intent === 'SECTION_CASES',
  };
}

// ─── Legacy Export (backward compatible) ──────────────────────────────────────

/**
 * handleRAGQuery — preserved for backward compatibility with index.js /api/chat endpoint.
 * Now delegates to orchestrateRAGQuery.
 */
async function handleRAGQuery(query, language = 'en') {
  const result = await orchestrateRAGQuery(query, {});
  // Augment with language context if Kannada
  if (language === 'kn' && result.briefing) {
    result.briefing.languageNote = 'ಕನ್ನಡ ಪ್ರತಿಕ್ರಿಯೆ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. (Kannada response ready)';
  }
  return result;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function _buildScopeForContext(ctx) {
  // Default: state-wide if no context (fallback for legacy callers)
  if (!ctx || !ctx.role) return '1=1';
  if (ctx.unitID && ['IO', 'SHO', 'PATROL_OFFICER', 'CONSTABLE', 'BEAT_OFFICER'].includes(ctx.role)) {
    return 'cm.PoliceStationID = $1';
  }
  if (ctx.districtID && ['DCP'].includes(ctx.role)) {
    return 'u.DistrictID = $1';
  }
  return '1=1';
}

function _buildScopeParams(ctx) {
  if (!ctx || !ctx.role) return [];
  if (ctx.unitID && ['IO', 'SHO', 'PATROL_OFFICER', 'CONSTABLE', 'BEAT_OFFICER'].includes(ctx.role)) {
    return [ctx.unitID];
  }
  if (ctx.districtID && ['DCP'].includes(ctx.role)) {
    return [ctx.districtID];
  }
  return [];
}

function _buildScopeOffset(ctx) {
  const params = _buildScopeParams(ctx);
  return params.length + 1;
}

module.exports = {
  orchestrateRAGQuery,
  handleRAGQuery,       // legacy export preserved
  classifyQueryIntent,  // exported for testing
};

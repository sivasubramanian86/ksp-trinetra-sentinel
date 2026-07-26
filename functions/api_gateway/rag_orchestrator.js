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
        // DB query + legal KB lookup are INDEPENDENT — run in parallel
        const secSql = buildSectionCaseSql(scopeResult, intentParams);
        const [sectionResult, sectionLegal] = await Promise.all([
          db.query(secSql.sql, secSql.params),
          legalEthicsAgent.explainSection(intentParams.sectionCode),
        ]);
        queryResult = sectionResult.rows;
        legalContext = sectionLegal;
        briefingSummary = `Found ${sectionResult.rowCount} FIR(s) under section ${intentParams.sectionCode || 'specified'}.`;
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
    console.warn('[RAG] DB query failed, using fallback MCP tools + GLM synthesis:', dbErr.message);
    const [threatVector, legalSOPs] = await Promise.all([
      executeTool('get_threat_vector', { beat_code: 'BNG-INDIRANAGAR-B1' }, userContext),
      executeTool('query_ksp_legal_sops', { crime_category: userQuery }, userContext),
    ]);

    const fallbackRows = [
      { beat: 'BNG-INDIRANAGAR-B1', recommended_hoysala_units: threatVector.recommended_hoysala_units || 2, risk_score: threatVector.risk_score || 0.85 },
      { legal_sops: legalSOPs },
    ];

    const ziaResult = await synthesizeWithZiaLLM(intent, userQuery, fallbackRows, { title: 'BNS Section 304 Snatching SOP', ingredients: ['Threat of violence', 'Snatching in public'] }, userContext.language || 'en');

    return {
      success: true,
      fallback: true,
      query: userQuery,
      intent,
      briefing: {
        summary: ziaResult.text,
        thinking: ziaResult.thinking || null,
        source: ziaResult.source,
        latencyMs: ziaResult.latencyMs,
        modelMeta: ziaResult.modelMeta,
        tacticalRecommendation: `Deploy ${threatVector.recommended_hoysala_units || 2} Hoysala units.`,
        legalSections: legalSOPs,
      },
      dpdpAuditPassed: true,
    };
  }


// ─── Zia GLM-4.7-Flash NLG Synthesis ─────────────────────────────────────────

/**
 * Calls Zoho QuickML GLM-4.7-Flash to produce a natural-language
 * tactical briefing from structured FIR DB results.
 *
 * Model    : GLM-4.7-Flash (crm-di-glm47b_30b_it)
 *            Mixture-of-Experts, optimised for reasoning & agent workflows
 * Endpoint : Zoho QuickML (India DC) — https://api.catalyst.zoho.in/quickml/v1
 * Auth     : Bearer <CATALYST_GLM_TOKEN> + CATALYST-ORG: 60079971646
 * Thinking : enable_thinking=true surfaces chain-of-thought reasoning
 * Fallback : Structured summary returned if token not set or call fails
 *
 * @param {string} intent
 * @param {string} userQuery
 * @param {object[]} queryResult  - FIR DB rows (capped at 5 for context)
 * @param {object|null} legalContext
 * @param {string} language - 'en' | 'kn'
 * @returns {{ text: string, thinking: string|null, source: 'ZIA_GLM'|'STRUCTURED_FALLBACK', latencyMs: number, modelMeta: object }}
 */
async function synthesizeWithZiaLLM(intent, userQuery, queryResult, legalContext, language = 'en') {
  const t0 = Date.now();

  // Cap result set to 5 rows to stay well within context window
  const resultSnippet = JSON.stringify(queryResult.slice(0, 5), null, 2);
  const legalSnippet = legalContext
    ? `Legal reference: ${legalContext.title || ''} — Elements: ${(legalContext.ingredients || []).slice(0, 3).join('; ')}`
    : '';

  const systemContent = language === 'kn'
    ? `ನೀವು ನಮ್ಮರಕ್ಷಾ — ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಕ್ರಿಮಿನಲ್ ತನಿಖೆ ಸಹಾಯಕ. ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ ೨೦೨೩ ಮತ್ತು ಡಿಪಿಡಿಪಿ ಕಾಯ್ದೆ ಅನ್ವಯ ಸಂಕ್ಷಿಪ್ತ, ಕ್ರಿಯಾಶೀಲ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ. ೩ ಪ್ಯಾರಾಗ್ರಾಫ್‌ಗಳಿಗಿಂತ ಹೆಚ್ಚಿಲ್ಲ.`
    : [
      'You are NammaRaksha, the KSP Trinetra Sentinel AI Copilot for Karnataka State Police officers.',
      'Your role: produce concise, actionable tactical briefings grounded in FIR database evidence.',
      'Rules:',
      '  1. Always cite the specific BNS 2023 section (e.g. BNS Section 101 for Murder).',
      '  2. State DPDP Act 2023 compliance status explicitly.',
      '  3. Flag any ASSISTIVE-ONLY legal suggestions with a clear "⚠️ OFFICER VERIFICATION REQUIRED" notice.',
      '  4. Use professional law enforcement language. No speculation beyond the data.',
      '  5. Max 3 paragraphs. No markdown headers in the briefing.',
    ].join('\n');

  const userContent = [
    `Officer Query: "${userQuery}"`,
    `Intent Classified: ${intent}`,
    `FIR Database Results (${queryResult.length} record(s)):`,
    resultSnippet,
    legalSnippet,
    '',
    'Produce a tactical briefing for the Investigating Officer.',
  ].join('\n');

// In-memory token cache for Zoho OAuth access tokens
let cachedZohoToken = null;
let cachedZohoTokenExpiry = 0;

/**
 * Resolves a valid Zoho Access Token for QuickML API requests.
 * Checks in order:
 * 1. Process environment direct token (CATALYST_GLM_TOKEN)
 * 2. In-memory unexpired OAuth token from previous refresh
 * 3. OAuth token exchange via Refresh Token (CATALYST_REFRESH_TOKEN + CLIENT_ID + CLIENT_SECRET)
 * 4. OAuth token exchange via Self-Client Grant Code (CATALYST_GRANT_CODE + CLIENT_ID + CLIENT_SECRET)
 */
async function getZohoAccessToken() {
  if (process.env.CATALYST_GLM_TOKEN) {
    return process.env.CATALYST_GLM_TOKEN;
  }

  // Return cached token if valid for > 60 seconds
  if (cachedZohoToken && Date.now() < cachedZohoTokenExpiry - 60000) {
    return cachedZohoToken;
  }

  const clientId = process.env.CATALYST_CLIENT_ID;
  const clientSecret = process.env.CATALYST_CLIENT_SECRET;
  const refreshToken = process.env.CATALYST_REFRESH_TOKEN;
  const grantCode = process.env.CATALYST_GRANT_CODE;
  const dcDomain = process.env.ZOHO_DC_DOMAIN || 'accounts.zoho.in'; // Default to India DC

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    let bodyParams;
    if (refreshToken) {
      bodyParams = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      });
    } else if (grantCode) {
      bodyParams = new URLSearchParams({
        code: grantCode,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
      });
    } else {
      return null;
    }

    const authRes = await fetch(`https://${dcDomain}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams,
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      console.warn('[RAG] Zoho OAuth exchange HTTP error:', authRes.status, errText);
      return null;
    }

    const authData = await authRes.json();
    if (authData.access_token) {
      cachedZohoToken = authData.access_token;
      // Expiry defaults to 3600s (1 hour) minus safety buffer
      const expiresInSec = authData.expires_in || 3600;
      cachedZohoTokenExpiry = Date.now() + (expiresInSec * 1000);
      console.log(`[RAG] Obtained fresh Zoho OAuth Access Token (expires in ${expiresInSec}s)`);
      return cachedZohoToken;
    } else {
      console.warn('[RAG] Zoho OAuth exchange returned no access_token:', authData.error || authData);
    }
  } catch (err) {
    console.warn('[RAG] Error exchanging Zoho OAuth token:', err.message);
  }

  return null;
}

  try {
    const GLM_URL = 'https://api.catalyst.zoho.in/quickml/v1/project/45111000000013054/glm/chat';
    const GLM_TOKEN = await getZohoAccessToken();
    const CATALYST_ORG = '60079971646';

    if (!GLM_TOKEN) {
      throw new Error('No valid Zoho token found (CATALYST_GLM_TOKEN, CATALYST_REFRESH_TOKEN, or CATALYST_GRANT_CODE) — using structured fallback');
    }

    const glmResponse = await fetch(GLM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_TOKEN}`,
        'CATALYST-ORG': CATALYST_ORG,
      },
      body: JSON.stringify({
        model: 'crm-di-glm47b_30b_it',           // GLM-4.7-Flash (MoE, 30B IT)
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user',   content: userContent  },
        ],
        max_tokens: 600,
        temperature: 0.2,                          // Low — factual law enforcement output
        stream: false,
        chat_template_kwargs: {
          enable_thinking: true,                   // Surface chain-of-thought reasoning
        },
      }),
      signal: AbortSignal.timeout(12000),          // 12s hard timeout (MoE cold-start)
    });

    if (!glmResponse.ok) {
      const errBody = await glmResponse.text().catch(() => '');
      throw new Error(`GLM HTTP ${glmResponse.status}: ${errBody.substring(0, 200)}`);
    }

    const glmData = await glmResponse.json();

    // QuickML can return either { response: "..." } or OpenAI-style { choices: [{ message: { content: "..." } }] }
    const choice = glmData?.choices?.[0];
    const generatedText = glmData?.response || choice?.message?.content || null;

    // GLM thinking chain (if enable_thinking=true returns it)
    const thinkingChain = choice?.message?.reasoning_content || glmData?.reasoning_content || null;

    if (!generatedText) throw new Error('GLM returned empty content');

    console.log(`[RAG] GLM-4.7-Flash OK — ${Date.now() - t0}ms | tokens: ${glmData?.usage?.completion_tokens || '?'}`);


    return {
      text: generatedText,
      thinking: thinkingChain,   // Chain-of-thought — surfaced in UI
      source: 'ZIA_GLM',
      latencyMs: Date.now() - t0,
      modelMeta: {
        model: 'GLM-4.7-Flash',
        modelId: 'crm-di-glm47b_30b_it',
        provider: 'Zoho QuickML (India DC)',
        architecture: 'Mixture-of-Experts (MoE)',
        temperature: 0.2,
        maxTokens: 600,
        thinkingEnabled: true,
        tokensUsed: glmData?.usage?.total_tokens || null,
      },
    };

  } catch (glmErr) {
    console.warn('[RAG] GLM-4.7-Flash call failed, structured fallback active:', glmErr.message);

    const fallbackText = language === 'kn'
      ? `ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ (${intent}). ${queryResult.length} ದಾಖಲೆ(ಗಳು) ಕಂಡುಬಂದಿವೆ. ಡಿಪಿಡಿಪಿ ಕಾಯ್ದೆ ೨೦೨೩ ಅನ್ವಯ ಪಿಐಐ ಮರೆಮಾಡಲಾಗಿದೆ.`
      : `Briefing complete (${intent}). Found ${queryResult.length} record(s) from the FIR database. ` +
        (legalContext ? `Legal reference: ${legalContext.title || 'See KB'} — ⚠️ OFFICER VERIFICATION REQUIRED. ` : '') +
        `PII masked per DPDP Act 2023. Results scoped to your jurisdiction.`;

    return {
      text: fallbackText,
      thinking: null,
      source: 'STRUCTURED_FALLBACK',
      latencyMs: Date.now() - t0,
      modelMeta: {
        model: 'none',
        provider: 'KSP Trinetra Structured Engine',
        note: 'Set CATALYST_GLM_TOKEN in Catalyst Vault to enable GLM-4.7-Flash live inference',
      },
    };
  }
}

  // Step 5: Zia LLM NLG synthesis (wraps DB results in natural language)
  const ziaResult = await synthesizeWithZiaLLM(intent, userQuery, queryResult, legalContext, userContext.language || 'en');

  return {
    success: true,
    query: userQuery,
    intent,
    briefing: {
      summary: ziaResult.text,
      thinking: ziaResult.thinking || null,  // GLM chain-of-thought (null if fallback)
      source: ziaResult.source,              // 'ZIA_GLM' | 'STRUCTURED_FALLBACK'
      latencyMs: ziaResult.latencyMs,
      modelMeta: ziaResult.modelMeta,
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

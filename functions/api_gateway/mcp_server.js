/**
 * Zoho Model Context Protocol (MCP) Tools Server
 * KSP Trinetra Sentinel - Catalyst Gateway Layer
 */

const hotspotAgent = require('./agents/hotspot_agent');
const graphAgent = require('./agents/graph_agent');
const multimodalAgent = require('./agents/multimodal_agent');
const legalEthicsAgent = require('./agents/legal_ethics_agent');

const MCP_TOOLS = [
  {
    name: 'get_threat_vector',
    description: 'Queries spatio-temporal risk forecast score (0.0 - 1.0) and recommended Hoysala patrol units for a given police beat.',
    inputSchema: {
      type: 'object',
      properties: {
        beat_code: { type: 'string', description: 'KSP Police Beat Identifier e.g. BNG-INDIRANAGAR-B1' },
        target_time: { type: 'string', description: 'ISO-8601 timestamp' },
      },
      required: ['beat_code'],
    },
  },
  {
    name: 'trace_syndicate_network',
    description: 'Queries NetworkX Graph ML engine to return connected multi-hop entity subgraph (Vehicles, IMEIs, Mule Accounts, Suspects).',
    inputSchema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string', description: 'Vehicle Tag, IMEI, UPI ID, or Suspect ID' },
        entity_type: { type: 'string', enum: ['VEHICLE', 'UPI', 'PHONE', 'SUSPECT'] },
        hops: { type: 'integer', default: 3 },
      },
      required: ['entity_id'],
    },
  },
  {
    name: 'analyze_multimodal_evidence',
    description: 'Processes CCTV ANPR images, voice dispatch audio notes, and video frames.',
    inputSchema: {
      type: 'object',
      properties: {
        media_type: { type: 'string', enum: ['IMAGE', 'AUDIO', 'VIDEO'] },
        filename: { type: 'string' },
      },
      required: ['media_type'],
    },
  },
  {
    name: 'query_ksp_legal_sops',
    description: 'Queries Bharatiya Nyaya Sanhita (BNS 2023) legal codes and KSP Standard Operating Procedures.',
    inputSchema: {
      type: 'object',
      properties: {
        crime_category: { type: 'string' },
        keywords: { type: 'array', items: { type: 'string' } },
      },
      required: ['crime_category'],
    },
  },
  // ── New MCP Tools (Phase 4) ──────────────────────────────────────────────────
  {
    name: 'query_fir_database',
    description: 'Schema-aware query of the KSP FIR database using RBAC-scoped SQL. Supports gravity, section (IPC/BNS dual), accused status, date range, and unit filters.',
    inputSchema: {
      type: 'object',
      properties: {
        intent: { type: 'string', enum: ['CASE_SEARCH', 'ACCUSED_TRACE', 'SECTION_CASES', 'IO_CASE_SUMMARY', 'CHARGESHEET_LAG'] },
        gravity_offence_id: { type: 'integer', description: '1=Minor, 2=Serious, 3=Heinous' },
        section_code: { type: 'string', description: 'IPC or BNS section number e.g. 420, 318' },
        act_code: { type: 'string', enum: ['IPC', 'BNS', 'NDPS', 'POCSO'] },
        accused_status: { type: 'string', enum: ['ABSCONDING', 'ARRESTED', 'SURRENDERED'] },
        from_date: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        to_date: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        min_cases: { type: 'integer', description: 'For ACCUSED_TRACE: minimum number of FIRs' },
        limit: { type: 'integer', default: 20 },
      },
      required: ['intent'],
    },
  },
  {
    name: 'explain_legal_section',
    description: 'Returns full explanation of a BNS or IPC section: title, elements, ingredient checklist, max punishment, IPC↔BNS cross-reference, and key case law. All responses are labeled ASSISTIVE ONLY.',
    inputSchema: {
      type: 'object',
      properties: {
        section_ref: { type: 'string', description: 'Section reference, e.g. IPC 420, BNS 318, 302' },
      },
      required: ['section_ref'],
    },
  },
  {
    name: 'get_case_detail',
    description: 'Returns full FIR case detail including accused, victims, act/sections, arrests, and chargesheet milestone for a given CaseMasterID.',
    inputSchema: {
      type: 'object',
      properties: {
        case_master_id: { type: 'integer', description: 'CaseMaster.CaseMasterID' },
        crime_no: { type: 'string', description: 'Alternative: FIR crime number' },
      },
    },
  },
  {
    name: 'trace_accused_across_cases',
    description: 'Finds accused persons appearing across multiple FIRs in the officer\'s jurisdiction. Returns accused name, PersonID, case count, and crime numbers.',
    inputSchema: {
      type: 'object',
      properties: {
        min_cases: { type: 'integer', default: 2, description: 'Minimum number of FIRs the accused must appear in' },
        district_id: { type: 'integer' },
      },
    },
  },
];

async function executeTool(toolName, args, userContext) {
  switch (toolName) {
    case 'get_threat_vector':
      return await hotspotAgent.getForecast(args);
    case 'trace_syndicate_network':
      return await graphAgent.traceSyndicate({ seed_identifier: args.entity_id, max_hops: args.hops || 3 });
    case 'analyze_multimodal_evidence':
      return await multimodalAgent.processMedia({ type: args.media_type ? args.media_type.toLowerCase() : 'image' });
    case 'query_ksp_legal_sops':
      return await legalEthicsAgent.retrieveBNSSections(args.crime_category);
    // ── New Tools (Phase 4) ──────────────────────────────────────────────────
    case 'explain_legal_section':
      return await legalEthicsAgent.explainSection(args.section_ref);
    case 'trace_accused_across_cases': {
      const { buildAccusedTraceSql } = require('./query_builder');
      const db = require('./db');
      const scope = { clause: '1=1', params: [], offset: 1 };
      const { sql, params } = buildAccusedTraceSql(scope, { minCases: args.min_cases || 2, districtID: args.district_id });
      try {
        const result = await db.query(sql, params);
        return { success: true, count: result.rowCount, accused: result.rows };
      } catch (e) {
        return { success: false, error: e.message, accused: [] };
      }
    }
    case 'query_fir_database': {
      const { orchestrateRAGQuery } = require('./rag_orchestrator');
      return await orchestrateRAGQuery(args.intent || 'CASE_SEARCH', userContext || {});
    }
    case 'get_case_detail': {
      const db = require('./db');
      const idClause = args.case_master_id ? `cm.CaseMasterID = $1` : `cm.CrimeNo = $1`;
      const idParam = args.case_master_id || args.crime_no;
      try {
        const result = await db.query(
          `SELECT cm.*, go.GravityOffenceName, csm.CaseStatusName, u.UnitName AS police_station
           FROM CaseMaster cm
             LEFT JOIN GravityOffence   go  ON cm.GravityOffenceID = go.GravityOffenceID
             LEFT JOIN CaseStatusMaster csm ON cm.CaseStatusID     = csm.CaseStatusID
             LEFT JOIN Unit             u   ON cm.PoliceStationID  = u.UnitID
           WHERE ${idClause} LIMIT 1`,
          [idParam]
        );
        return { success: true, case: result.rows[0] || null };
      } catch (e) {
        return { success: false, error: e.message, case: null };
      }
    }
    default:
      throw new Error(`UNKNOWN_MCP_TOOL: Tool '${toolName}' is not registered on Trinetra MCP Server.`);
  }
}

module.exports = {
  MCP_TOOLS,
  executeTool,
};

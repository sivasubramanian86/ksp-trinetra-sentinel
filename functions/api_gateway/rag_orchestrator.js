/**
 * Zia LLM GraphRAG Orchestrator
 * KSP Trinetra Sentinel - API Gateway Layer
 */

const { executeTool } = require('./mcp_server');
const legalEthicsAgent = require('./agents/legal_ethics_agent');

async function orchestrateRAGQuery(userQuery, userContext) {
  // Step 1: Ethics Guard
  const auditResult = await legalEthicsAgent.auditQuery(userQuery, userContext);
  if (!auditResult.allowed) {
    return {
      success: false,
      blocked: true,
      notice: auditResult.reasonNotice,
    };
  }

  // Step 2: Intent-based tool execution
  const threatVector = await executeTool('get_threat_vector', { beat_code: 'BNG-INDIRANAGAR-B1' }, userContext);
  const legalSOPs = await executeTool('query_ksp_legal_sops', { crime_category: userQuery }, userContext);

  // Step 3: Structured Police Briefing Synthesis
  return {
    success: true,
    query: userQuery,
    intent: 'PATROL_OPTIMIZATION_AND_LEGAL_CITATIONS',
    briefing: {
      summary: `Analysis for '${userQuery}' completed. Indiranagar Beat risk is predicted at ${(threatVector.predicted_risk_score * 100).toFixed(0)}%.`,
      tacticalRecommendation: `Deploy ${threatVector.recommended_hoysala_units || 2} Hoysala patrol units. Activate ANPR checkpoint.`,
      legalSections: legalSOPs,
    },
    dpdpAuditPassed: true,
  };
}

module.exports = {
  orchestrateRAGQuery,
};

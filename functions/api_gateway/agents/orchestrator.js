/**
 * Trinetra Central Orchestrator Agent
 * KSP Trinetra Sentinel - Zoho Catalyst API Gateway
 * Coordinates sub-agents for Multi-Agent, Multi-Lingual, and Multi-Modal Operations.
 */

const hotspotAgent = require('./hotspot_agent');
const graphAgent = require('./graph_agent');
const multimodalAgent = require('./multimodal_agent');
const multilingualAgent = require('./multilingual_agent');
const legalEthicsAgent = require('./legal_ethics_agent');

class TrinetraOrchestrator {
  constructor() {
    this.agentName = 'TrinetraCentralOrchestrator';
  }

  /**
   * Process incoming NammaRaksha Copilot requests
   * 
   * Execution model: PARALLEL fan-out via Promise.all()
   * Independent sub-agents (hotspot, graph, multimodal, legal) are dispatched
   * simultaneously and joined when all complete.
   * Total latency = max(agent latencies), not sum.
   */
  async processRequest(payload, userContext) {
    const { query, language = 'en', media = null, beat_code = null, seed_identifier = null } = payload;

    // Step 1: Multilingual NLU & Translation check (must complete before dispatch)
    const normalizedInput = await multilingualAgent.parseInput(query, language);

    // Step 2: Ethics & DPDP Guardrail Audit (must complete before any data access)
    const ethicsAudit = await legalEthicsAgent.auditQuery(normalizedInput.text, userContext);
    if (!ethicsAudit.allowed) {
      return multilingualAgent.formatResponse(ethicsAudit.reasonNotice, language);
    }

    const q = normalizedInput.text.toLowerCase();

    // Step 3: PARALLEL fan-out — dispatch all eligible sub-agents simultaneously
    // Each entry is a [key, Promise] pair; null entries are filtered before resolution.
    const parallelTasks = await Promise.all([
      // Multimodal agent — only if media payload present
      media
        ? multimodalAgent.processMedia(media).then(r => ['multimodal', r])
        : Promise.resolve(null),

      // Hotspot agent — if beat_code provided or query mentions risk/hotspot
      (beat_code || q.includes('risk') || q.includes('hotspot'))
        ? hotspotAgent.getForecast({ beat_code: beat_code || 'BNG-INDIRANAGAR-B1', target_time: payload.target_time })
            .then(r => ['hotspot', r])
        : Promise.resolve(null),

      // Graph/syndicate agent — if seed_identifier provided or query mentions syndicate/trace
      (seed_identifier || q.includes('syndicate') || q.includes('trace'))
        ? graphAgent.traceSyndicate({ seed_identifier: seed_identifier || 'KA-01-EQ-1234' })
            .then(r => ['graph', r])
        : Promise.resolve(null),

      // Legal & SOP retrieval — always runs in parallel (stateless KB lookup)
      legalEthicsAgent.retrieveBNSSections(normalizedInput.text)
        .then(r => ['legal', r]),
    ]);

    // Collect only resolved (non-null) results into subAgentResults
    const subAgentResults = {};
    for (const result of parallelTasks) {
      if (result) {
        const [key, value] = result;
        subAgentResults[key] = value;
      }
    }

    const legalContext = subAgentResults.legal || [];
    delete subAgentResults.legal; // legal goes into legalCitations, not subAgentResults

    // Step 4: Synthesize Tactical Briefing
    const rawBriefing = {
      title: language === 'kn' ? 'ನಮ್ಮರಕ್ಷಾ ಕಾಪ್-ಪೈಲಟ್ ವಿವರಣೆ' : 'NammaRaksha Tactical Police Briefing',
      queryProcessed: normalizedInput.text,
      language,
      subAgentResults,
      legalCitations: legalContext,
      timestamp: new Date().toISOString(),
      dpdpCompliant: true,
      parallelExecution: true, // flag for observability
    };

    return multilingualAgent.formatResponse(rawBriefing, language);
  }
}

module.exports = new TrinetraOrchestrator();

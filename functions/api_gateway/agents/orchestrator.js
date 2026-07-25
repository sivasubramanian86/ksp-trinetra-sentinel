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
   */
  async processRequest(payload, userContext) {
    const { query, language = 'en', media = null, beat_code = null, seed_identifier = null } = payload;

    // Step 1: Multilingual NLU & Translation check
    const normalizedInput = await multilingualAgent.parseInput(query, language);

    // Step 2: Ethics & DPDP Guardrail Audit
    const ethicsAudit = await legalEthicsAgent.auditQuery(normalizedInput.text, userContext);
    if (!ethicsAudit.allowed) {
      return multilingualAgent.formatResponse(ethicsAudit.reasonNotice, language);
    }

    const subAgentResults = {};

    // Step 3: Dispatch to specialized sub-agents based on context/intent
    if (media) {
      subAgentResults.multimodal = await multimodalAgent.processMedia(media);
    }

    if (beat_code || normalizedInput.text.toLowerCase().includes('risk') || normalizedInput.text.toLowerCase().includes('hotspot')) {
      subAgentResults.hotspot = await hotspotAgent.getForecast({ beat_code: beat_code || 'BNG-INDIRANAGAR-B1', target_time: payload.target_time });
    }

    if (seed_identifier || normalizedInput.text.toLowerCase().includes('syndicate') || normalizedInput.text.toLowerCase().includes('trace')) {
      subAgentResults.graph = await graphAgent.traceSyndicate({ seed_identifier: seed_identifier || 'KA-01-EQ-1234' });
    }

    // Step 4: Legal & SOP Retrieval (BNS 2023)
    const legalContext = await legalEthicsAgent.retrieveBNSSections(normalizedInput.text);

    // Step 5: Synthesize Tactical Briefing
    const rawBriefing = {
      title: language === 'kn' ? 'ನಮ್ಮರಕ್ಷಾ ಕಾಪ್-ಪೈಲಟ್ ವಿವರಣೆ' : 'NammaRaksha Tactical Police Briefing',
      queryProcessed: normalizedInput.text,
      language,
      subAgentResults,
      legalCitations: legalContext,
      timestamp: new Date().toISOString(),
      dpdpCompliant: true,
    };

    return multilingualAgent.formatResponse(rawBriefing, language);
  }
}

module.exports = new TrinetraOrchestrator();

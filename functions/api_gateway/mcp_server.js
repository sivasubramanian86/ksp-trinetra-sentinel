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
    default:
      throw new Error(`UNKNOWN_MCP_TOOL: Tool '${toolName}' is not registered on Trinetra MCP Server.`);
  }
}

module.exports = {
  MCP_TOOLS,
  executeTool,
};

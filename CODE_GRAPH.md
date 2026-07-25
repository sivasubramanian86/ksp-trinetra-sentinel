# CODE_GRAPH.md - Trinetra Token Saver Graph Index

This graph maps key module entry points and data flows across the monorepo to maintain minimal context overhead.

```mermaid
graph TD
    ClientUI[client/src/app/page.tsx] -->|Fetch Hotspots| GatewayForecast[functions/api_gateway/api/hotspots.js]
    ClientUI -->|Fetch Entity Graph| GatewayGraph[functions/api_gateway/api/graph.js]
    ClientUI -->|Copilot Query| GatewayChat[functions/api_gateway/api/chat.js]
    
    GatewayForecast -->|Validate RBAC| AuthMiddleware[functions/api_gateway/auth.js]
    GatewayForecast -->|Query Spatial Data| DBPool[functions/api_gateway/db.js]
    GatewayForecast -->|HTTP Proxy /predict| PythonHotspot[backend/python-services/api/main.py]
    
    GatewayGraph -->|HTTP Proxy /graph| PythonGraph[backend/python-services/api/main.py]
    
    GatewayChat -->|Execute MCP Tools| MCPServer[functions/api_gateway/mcp_server.js]
    MCPServer -->|Orchestrate Context| RAGOrchestrator[functions/api_gateway/rag_orchestrator.js]
    RAGOrchestrator -->|Enforce Ethics| EthicsGuard[functions/api_gateway/ethics_guard.js]
    
    PythonHotspot -->|Scrub PII| Scrubber[backend/python-services/core/dpdp_scrubber.py]
    PythonHotspot -->|Predict Beat Risk| STForecaster[backend/python-services/models/st_forecaster.py]
    PythonGraph -->|Trace Subgraph| GraphEngine[backend/python-services/models/graph_engine.py]
```

## Symbol Mapping

| Component | Key File | Exported Symbols |
|---|---|---|
| Frontend Shell | `client/src/app/page.tsx` | `Home` |
| GeoMap Component | `client/src/components/map/GeoMap.tsx` | `GeoMap` |
| Mind Palace Graph | `client/src/components/graph/MindPalaceGraph.tsx` | `MindPalaceGraph` |
| Tactical Panel | `client/src/components/advisory/TacticalPanel.tsx` | `TacticalPanel` |
| Copilot Sidebar | `client/src/components/chat/CopilotSidebar.tsx` | `CopilotSidebar` |
| DB Pool | `functions/api_gateway/db.js` | `query`, `pool` |
| Auth Middleware | `functions/api_gateway/auth.js` | `authenticate`, `requireRole`, `maskPII` |
| MCP Tools Server | `functions/api_gateway/mcp_server.js` | `tools`, `executeTool` |
| RAG Orchestrator | `functions/api_gateway/rag_orchestrator.js` | `orchestrateRAGQuery` |
| Ethics Guard | `functions/api_gateway/ethics_guard.js` | `auditPrompt`, `auditResponse` |
| PII Scrubber | `backend/python-services/core/dpdp_scrubber.py` | `PIIScrubber` |
| ST Forecaster | `backend/python-services/models/st_forecaster.py` | `predict_hotspots` |
| Graph Engine | `backend/python-services/models/graph_engine.py` | `trace_syndicate` |

# REF_INDEX.md - File Reference Index

File reference lookup map for KSP Trinetra Sentinel.

## Core Directories & File Paths

- `client/`
  - `src/app/page.tsx` - Main Command Center dashboard route with theme toggle
  - `src/components/layout/Navbar.tsx` - Header bar, role badge & theme switcher
  - `src/components/map/GeoMap.tsx` - Leaflet GIS map with time scrubber
  - `src/components/graph/MindPalaceGraph.tsx` - React Flow syndicate graph
  - `src/components/advisory/TacticalPanel.tsx` - Tactical cards & intervention toggle
  - `src/components/chat/NammaRakshaCopilot.tsx` - Copilot Markdown chat panel
  - `src/components/forensics/ForensicLabModal.tsx` - Forensic Triage Lab UI modal
  - `next.config.mjs` - Static export setup (`output: 'export'`)
  - `tailwind.config.ts` - Tailwind CSS configuration (`darkMode: 'class'`)
- `functions/api_gateway/`
  - `package.json` - Node.js API gateway manifest
  - `index.js` - Main Catalyst function entry handler (CORS & OWASP Security Headers)
  - `secrets_vault.js` - Zoho Catalyst Vault / Secret Manager integration module
  - `db.js` - PostgreSQL connection pool
  - `auth.js` - RBAC authorization & PII scrubber middleware
  - `mcp_server.js` - Model Context Protocol tool declarations
  - `rag_orchestrator.js` - Zia GraphRAG orchestrator logic
  - `ethics_guard.js` - DPDP compliance & bias detection
- `backend/python-services/`
  - `requirements.txt` - Python dependencies
  - `api/main.py` - FastAPI application entrypoint with security middleware
  - `core/secrets_vault.py` - Python Catalyst Secret Manager vault reader
  - `core/dpdp_scrubber.py` - Regex & hashing PII scrubber
  - `models/st_forecaster.py` - XGBoost spatio-temporal hotspot model
  - `models/graph_engine.py` - NetworkX multi-hop syndicate graph model
  - `forensics/` - Task 06 Multi-Agent Forensic Triage Engine
- `skills/`
  - `forensic_dissection/SKILL.md` - Forensic dissection engine skill
  - `st_gnn_forecasting/SKILL.md` - ST-GNN forecasting skill
  - `syndicate_graph_ml/SKILL.md` - NetworkX graph ML skill
  - `mcp_zia_graphrag/SKILL.md` - MCP & Zia GraphRAG skill
- `scripts/`
  - `run_local.ps1` / `run_local.sh` - Local launchers with automatic port cleanup (8000, 3001, 3000)
  - `test_zia_agents.py` / `test_zia_agents.ps1` / `test_zia_agents.js` - Zia LLM test suites
  - `deploy_catalyst.ps1` / `deploy_catalyst.sh` - Zoho Catalyst cloud deploy scripts
- `db/`
  - `schema/` - SQL schemas (`01_incidents.sql` through `07_forensic_leads.sql`)
  - `seeds/seed_data.py` - Synthetic incident & entity data generator
- `docs/`
  - `backend-apis.md` - API specs
  - `tools-mcp.md` - MCP tool schema specs
  - `zoho-llm-zia-testing-guide.md` - Zia LLM testing and integration guide
  - `security-and-compliance.md` - Secret Manager Vault, CORS & DPDP compliance specs

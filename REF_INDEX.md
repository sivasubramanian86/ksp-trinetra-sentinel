# REF_INDEX.md — KSP Trinetra Sentinel File Reference Index

> **Version**: 2.0 (Production-Grade FIR Schema Edition)
> **Legend**: ✅ = Implemented | 🔧 = Planned | 📄 = Reference/Legal

---

## Core Directories & File Paths

### client/ — Next.js 14 Command Center UI

| File | Purpose | Status |
|---|---|---|
| `src/app/page.tsx` | Main dashboard route, module selector, theme state | ✅ |
| `src/app/globals.css` | Design tokens, glassmorphism utilities, dark/light CSS vars | ✅ |
| `src/components/layout/Navbar.tsx` | Header, role badge, theme switcher, language toggle | ✅ |
| `src/components/map/GeoMap.tsx` | Leaflet GIS map, time scrubber, heatmap polygons | ✅ |
| `src/components/graph/MindPalaceGraph.tsx` | React Flow syndicate graph, node-click telemetry | ✅ |
| `src/components/advisory/TacticalPanel.tsx` | Tactical cards, BNS pills, what-if toggle | ✅ |
| `src/components/chat/NammaRakshaCopilot.tsx` | Copilot Markdown chat, voice input, PDF export | ✅ |
| `src/components/forensics/ForensicLabModal.tsx` | Forensic triage drag-drop zone | ✅ |
| `src/components/dashboard/DGSnapshot.tsx` | Senior officer state-wide snapshot | 🔧 |
| `src/components/cases/CaseDrillDown.tsx` | FIR detail modal (accused, victims, sections, timeline) | 🔧 |
| `src/components/analytics/VictimJourney.tsx` | Case milestone swimlane, bottleneck highlights | 🔧 |
| `next.config.mjs` | Static export config (`output: 'export'`) | ✅ |
| `tailwind.config.ts` | Tailwind dark mode class config | ✅ |

### functions/api_gateway/ — Zoho Catalyst Serverless API Gateway

| File | Purpose | Status |
|---|---|---|
| `index.js` | Express entry, CORS, security headers, route mounting | ✅🔧 |
| `auth.js` | RBAC middleware, PII masking, Catalyst JWT auth, unit scoping | ✅🔧 |
| `rbac_policy.js` | Declarative role → endpoint → permission policy table | 🔧 |
| `db.js` | PostgreSQL connection pool (`DATABASE_URL`) | ✅ |
| `secrets_vault.js` | Zoho Catalyst Vault / Secret Manager integration | ✅ |
| `ethics_guard.js` | DPDP compliance, bias detection, ethics audit logging | ✅🔧 |
| `audit_logger.js` | Tamper-evident AuditLog writer (Datastore + Postgres) | 🔧 |
| `mcp_server.js` | MCP tool declarations + dispatcher | ✅🔧 |
| `rag_orchestrator.js` | Zia GraphRAG orchestrator, intent classifier, schema-aware query | ✅🔧 |
| `query_builder.js` | Parameterized SQL builder for FIR schema queries | 🔧 |
| `api/cases.js` | FIR CRUD + search endpoints | 🔧 |
| `api/analytics.js` | Snapshot, chargesheet lag, arrest performance endpoints | 🔧 |
| `api/operations.js` | Patrol operation plan CRUD | 🔧 |
| `agents/hotspot_agent.js` | ST-GNN hotspot forecast | ✅ |
| `agents/graph_agent.js` | NetworkX syndicate trace | ✅ |
| `agents/multimodal_agent.js` | Zia OCR, barcode, ANPR | ✅ |
| `agents/legal_ethics_agent.js` | BNS/IPC legal lookup, section explain, ethics guard | ✅🔧 |
| `agents/multilingual_agent.js` | Kannada/English translation | ✅ |
| `agents/orchestrator.js` | Central agent dispatcher | ✅ |

### backend/python-services/ — FastAPI Python ML Engine

| File | Purpose | Status |
|---|---|---|
| `requirements.txt` | Python dependencies | ✅ |
| `api/main.py` | FastAPI app entry, CORS, security middleware | ✅ |
| `api/fir_analytics.py` | FIR-schema analytics (chargesheet lag, victim journey, accused network) | 🔧 |
| `core/secrets_vault.py` | Catalyst Vault secret reader | ✅ |
| `core/dpdp_scrubber.py` | Regex + SHA-256 PII scrubber | ✅ |
| `models/st_forecaster.py` | XGBoost ST-GNN hotspot predictor | ✅ |
| `models/graph_engine.py` | NetworkX multi-hop syndicate graph | ✅ |
| `forensics/orchestrator.py` | Forensic triage supervisor (Task 06) | ✅ |
| `forensics/agents/pathology_agent.py` | Autopsy/toxicology analysis | ✅ |
| `forensics/agents/digital_agent.py` | CDR/PCAP/deepfake analysis | ✅ |
| `forensics/agents/trace_agent.py` | Ballistics/DNA/physical evidence | ✅ |
| `forensics/agents/timeline_agent.py` | Event timeline synthesizer | ✅ |
| `forensics/schemas/forensic_output.py` | Pydantic output schemas | ✅ |

### db/ — PostgreSQL + PostGIS Schemas

| File | Purpose | Status |
|---|---|---|
| `schema/01_incidents.sql` | Spatial incidents table (PostGIS) | ✅ |
| `schema/02_entities.sql` | Vehicles, IMEIs, suspects, mule accounts | ✅ |
| `schema/03_links.sql` | Syndicate graph edges | ✅ |
| `schema/04_grid.sql` | Beat/grid spatial grid | ✅ |
| `schema/05_risk.sql` | Risk score snapshots | ✅ |
| `schema/06_multimodal_media.sql` | Evidence media records | ✅ |
| `schema/07_forensic_leads.sql` | Forensic triage findings | ✅ |
| `schema/08_ksp_fir_schema.sql` | **FIR ER Schema** — CaseMaster, Accused, Victim, etc. | ✅🔧 |
| `schema/09_auxiliary_tables.sql` | AuditLog, OperationPlan, DashboardPreset, LegalKnowledgeBase | 🔧 |
| `seeds/seed_data.py` | Synthetic incident + entity data generator | ✅🔧 |
| `seeds/legal_knowledge_base.json` | IPC→BNS mapping corpus (60+ offences) | 🔧 |

### docs/ — Specifications & Architecture

| File | Purpose | Status |
|---|---|---|
| `KSP_DATATHON_2026_PRESENTATION_DECK.md` | 42-slide master presentation | ✅ |
| `security-and-compliance.md` | Vault, CORS, DPDP compliance specs | ✅ |
| `tools-mcp.md` | MCP tool schema specs | ✅ |
| `zoho-llm-zia-testing-guide.md` | Zia LLM testing guide | ✅ |
| `architecture.md` | Full production architecture spec | 🔧 |
| `rbac.md` | Role → endpoint → PII mask matrix | 🔧 |
| `legal-layer.md` | IPC→BNS mapping strategy, ingredient checklists | 🔧 |
| `ten-year-roadmap.md` | Decade survivability assumptions | 🔧 |

### scripts/ — Automation

| File | Purpose | Status |
|---|---|---|
| `run_local.ps1` / `run_local.sh` | Local launcher with port cleanup | ✅ |
| `deploy_catalyst.ps1` / `deploy_catalyst.sh` | Catalyst cloud deploy | ✅ |
| `test_zia_agents.py` / `.ps1` / `.js` | Zia agent integration tests | ✅ |
| `copy_images_to_client.py` | Static image asset copier | ✅ |

### skills/ — Antigravity Skills (Project-Level)

| File | Purpose | Status |
|---|---|---|
| `forensic_dissection/SKILL.md` | Task 06 forensic dissection engine | ✅ |
| `st_gnn_forecasting/SKILL.md` | ST-GNN spatial forecasting | ✅ |
| `syndicate_graph_ml/SKILL.md` | NetworkX syndicate graph ML | ✅ |
| `mcp_zia_graphrag/SKILL.md` | MCP + Zia GraphRAG integration | ✅ |

---

## Legal Reference Sources (IPC→BNS Mapping)

| Reference | Description | Source |
|---|---|---|
| `Bharatiya Nyaya Sanhita (BNS) 2023` | Replacement for IPC, enacted 2023 | Ministry of Law & Justice |
| `IPC 420 → BNS 318` | Cheating + dishonest inducement | BNS Chapter XVII |
| `IPC 302 → BNS 101` | Murder | BNS Chapter VI |
| `IPC 376 → BNS 63` | Rape / sexual assault | BNS Chapter V |
| `IPC 379/380 → BNS 303` | Theft | BNS Chapter XVII |
| `NDPS Act 1985` | Narcotics — unchanged, parallel Act | Central Act |
| `POCSO Act 2012` | Child protection — unchanged | Central Act |
| `IT Act 2000 / DPDP Act 2023` | Cyber crimes + data protection | Central Acts |
| `CrPC → BNSS 2023` | Procedure code (Bharatiya Nagarik Suraksha Sanhita) | Ministry of Home Affairs |
| `KSP SOPs` | Karnataka State Police Standing Orders | KSP Internal |

# Implementation Plan: KSP Trinetra Sentinel (Multi-Agent, Multi-Lingual, Multi-Modal & Forensic Triage)

KSP Trinetra Sentinel is a multi-layer city brain for the Karnataka State Police (KSP Datathon 2026). It is built as a **decoupled multi-agent system** with **multi-lingual support (Kannada & English)**, **multi-modal capabilities (Image, Audio, Video)**, the **NammaRaksha Law Enforcement Copilot UI**, and an autonomous **Forensic Triage Engine (TASK 06)**.

---

## Completed Phases & Checklist

### Phase 1: Scaffold Multi-Agent Workspace & Catalyst Core
- [x] Monorepo setup, `.gitignore`, `package.json`, `README.md`, `CODE_GRAPH.md`, `REF_INDEX.md`, `catalyst.json`.
- [x] PostgreSQL connection pool (`functions/api_gateway/db.js`) & RBAC middleware (`functions/api_gateway/auth.js`).
- [x] Central Orchestrator & base sub-agent architecture.

### Phase 2: PostgreSQL Schema & Python ML Engine
- [x] PostGIS SQL Schemas (`db/schema/01_incidents.sql` through `06_multimodal_media.sql`).
- [x] Synthetic data seeder (`db/seeds/seed_data.py`).
- [x] Python dependencies & DPDP PII Scrubber (`core/dpdp_scrubber.py`).
- [x] ST-GNN Forecaster (`models/st_forecaster.py`) & NetworkX Graph Engine (`models/graph_engine.py`).

### Phase 3: Catalyst Backend APIs & Multi-Agent Gateway
- [x] Gateway endpoints in `functions/api_gateway/index.js` (`POST /api/chat`, `POST /api/hotspots/forecast`, `POST /api/graph/story`, `GET /api/advisories`).

### Phase 4: Next.js Command Center UI & NammaRaksha Copilot
- [x] Dark-Mode Command Center layout with **Kannada (ಕನ್ನಡ) ⇄ English Language Toggle**.
- [x] **Threat Vectors Time Machine** map view (`src/components/map/GeoMap.tsx`).
- [x] **Sherlock Mind Palace** graph view (`src/components/graph/MindPalaceGraph.tsx`).
- [x] **What-If Tactical Advisory Panel** (`src/components/advisory/TacticalPanel.tsx`).
- [x] **NammaRaksha Copilot UI** (`src/components/chat/NammaRakshaCopilot.tsx`).

### Phase 5: Zoho MCP Tool Contracts & Zia GraphRAG Integration
- [x] MCP Server Definitions in `functions/api_gateway/mcp_server.js`.
- [x] Zia LLM GraphRAG Orchestrator & Ethics Guardrail.

### Phase 6: Production Deployment Readiness
- [x] Configured `catalyst.json` mapping `client/out` and `functions/api_gateway`.

### Phase 7: TASK 06 Forensic Triage Engine & Sub-Agents
- [x] `[CODE EDIT]` Pydantic data schemas in `backend/python-services/forensics/schemas/forensic_output.py`.
- [x] `[CODE EDIT]` Standalone skills in `backend/python-services/forensics/skills/` (`pdf_parser.py`, `pcap_analyzer.py`).
- [x] `[CODE EDIT]` Application skill definition `skills/forensic_dissection/SKILL.md`.
- [x] `[CODE EDIT]` Specialized Forensic Subagents in `backend/python-services/forensics/agents/`: `pathology_agent.py`, `digital_agent.py`, `trace_agent.py`, `timeline_agent.py`.
- [x] `[CODE EDIT]` Supervisor Orchestrator in `backend/python-services/forensics/orchestrator.py`.
- [x] `[CODE EDIT]` PostgreSQL schema `db/schema/07_forensic_leads.sql`.
- [x] `[CODE EDIT]` FastAPI endpoint `POST /api/v1/forensics/dissect` & Gateway proxy `POST /api/forensics/dissect`.
- [x] `[CODE EDIT]` Next.js UI component `client/src/components/forensics/ForensicLabModal.tsx`.
- [x] `[TERMINAL]` Pytest suite executed (`python -m pytest tests/test_forensics.py` - 4/4 PASSED).
- [x] `[TERMINAL]` Verified Next.js static build (`npm run build --prefix client`).

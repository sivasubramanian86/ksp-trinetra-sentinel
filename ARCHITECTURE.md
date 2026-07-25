# Technical Architecture Specification - KSP Trinetra Sentinel 👁️🛡️

> **Karnataka State Police Datathon 2026**

This document provides a deep technical architectural breakdown of **KSP Trinetra Sentinel**.

---

## 1. System Layers & Monorepo Structure

```text
ksp-trinetra-sentinel/
├── client/                     # Next.js 14 App Router Command Center UI
│   ├── src/app/                # Main layout, dark/light theme state, page routing
│   ├── src/components/         # Component Modules (Map, Spectre Matrix, Tactical, Copilot, IoT, Public)
│   └── tailwind.config.ts      # Tailwind CSS styling with darkMode: 'class'
├── functions/api_gateway/      # Zoho Catalyst Serverless API Gateway
│   ├── index.js                # Express app entry, security headers, CORS, gateway endpoints
│   ├── secrets_vault.js        # Zoho Catalyst Vault / Secret Manager integration module
│   ├── auth.js                 # RBAC authorization middleware & PII masking
│   ├── mcp_server.js           # Model Context Protocol (MCP) server & tool schemas
│   ├── rag_orchestrator.js     # Zia GraphRAG orchestrator & BNS 2023 legal synthesis
│   └── ethics_guard.js         # Constitutional & DPDP Act ethics interceptor
├── backend/python-services/    # FastAPI Python ML Microservices Engine
│   ├── api/main.py             # FastAPI entrypoint & CORS middleware
│   ├── core/dpdp_scrubber.py   # Regex & SHA-256 PII scrubber
│   ├── core/secrets_vault.py   # Python Catalyst Vault secret reader
│   ├── models/st_forecaster.py # XGBoost / ST-GNN spatio-temporal hotspot predictor
│   ├── models/graph_engine.py  # NetworkX multi-hop syndicate graph engine
│   └── forensics/              # Multi-Agent Forensic Triage Engine
│       ├── agents/             # Pathology, Digital, Trace, Timeline sub-agents
│       ├── schemas/            # Pydantic structured output models
│       └── orchestrator.py     # Async parallel dispatcher
├── db/                         # PostgreSQL + PostGIS Schemas & Data Generators
│   ├── schema/                 # 01_incidents.sql through 07_forensic_leads.sql
│   └── seeds/seed_data.py      # Synthetic police incident data generator
├── skills/                     # Workspace Discovery Skills
│   ├── forensic_dissection/    # Forensic report dissection skill
│   ├── st_gnn_forecasting/     # Spatio-temporal risk forecasting skill
│   ├── syndicate_graph_ml/     # Syndicate graph ML skill
│   └── mcp_zia_graphrag/       # MCP Zia GraphRAG legal lookup skill
├── scripts/                    # Launch & Deployment Automation
│   ├── run_local.ps1 / .sh     # Automated process cleanup & local launcher
│   ├── test_zia_agents.py      # Python integration test suite
│   └── deploy_catalyst.ps1     # Zoho Catalyst cloud deploy script
└── docs/                       # Specifications & Security Guidelines
```

---

## 2. Multi-Agent Orchestration Flow

```text
[Officer / User Prompt]
          │
          ▼
┌──────────────────────────────────────────────┐
│  DPDP Ethics Interceptor (ethics_guard.js)   │
└──────────────────────┬───────────────────────┘
                       │ (Passed)
                       ▼
┌──────────────────────────────────────────────┐
│  Zia GraphRAG Orchestrator (rag_orchestrator) │
└──────────────────────┬───────────────────────┘
                       │ Tool Dispatch
           ┌───────────┴───────────┐
           ▼                       ▼
┌──────────────────────┐ ┌──────────────────────┐
│ ST-GNN Predictor     │ │ NetworkX Syndicate   │
│ (Hotspot Sub-Agent)  │ │ Graph Sub-Agent      │
└──────────┬───────────┘ └──────────┬───────────┘
           │                       │
           └───────────┬───────────┘
                       ▼
┌──────────────────────────────────────────────┐
│   Bharatiya Nyaya Sanhita (BNS 2023) Legal   │
│   SOP Context Injection                      │
└──────────────────────┬───────────────────────┘
                       ▼
┌──────────────────────────────────────────────┐
│  Tactical Police Briefing Generation         │
└──────────────────────────────────────────────┘
```

---

## 3. Data Schemas & Models

### A. PostGIS SQL Database Engine
- `01_incidents.sql`: Spatial incident table (`geom Geometry(Point, 4324)`).
- `02_entities.sql`: Vehicles, IMEIs, Suspects, Mule Accounts.
- `03_syndicate_edges.sql`: Multi-hop relationships (`DRIVEN_BY`, `TRANSFERS_TO`).
- `07_forensic_leads.sql`: Forensic triage findings & timeline contradictions.

### B. Forensic Pydantic Output Schemas
- `ForensicEvidenceItem`: `evidence_id`, `source_report_type`, `confidence_score`, `raw_snippet`.
- `PathologyFinding`: Extends evidence item (`estimated_time_of_death_window`, `weapon_class_inferred`, `toxicology_flags`).
- `DigitalForensicFinding`: Extends evidence item (`suspect_ips`, `imei_imsi_clusters`, `deepfake_probability`).
- `TraceBallisticsFinding`: Extends evidence item (`striation_match_signature`, `dna_locus_profile`, `spatter_origin_angle`).
- `EarlyLeadSynthesis`: `case_id`, `contradictions_found`, `recommended_immediate_actions`.

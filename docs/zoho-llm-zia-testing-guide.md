# Testing & Using Zoho Zia LLM Agents & MCP Integration

KSP Trinetra Sentinel integrates with **Zoho Zia LLM** using Zoho's **Model Context Protocol (MCP)** standards and a serverless API Gateway architecture.

---

## 🏛️ How Zoho Zia LLM Integration Works

```text
                                +-----------------------------------+
                                | Zoho Zia LLM / External AI Model  |
                                +-----------------+-----------------+
                                                  | MCP Tool Invocations
                                                  v
                                +-----------------------------------+
                                | Catalyst API Gateway MCP Server   |
                                | (functions/api_gateway/mcp_server)|
                                +---+-------------+-------------+---+
                                    |             |             |
                                    v             v             v
                              +-----------+ +-----------+ +-----------+
                              | Hotspot   | | Graph     | | Legal BNS |
                              | Sub-Agent | | Sub-Agent | | Sub-Agent |
                              +-----------+ +-----------+ +-----------+
```

### 1. Model Context Protocol (MCP) Server ([`mcp_server.js`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/functions/api_gateway/mcp_server.js))
Zia LLM interacts with our backend by inspecting our registered MCP tools:
- **`get_threat_vector`**: Returns ST-GNN beat risk score and recommended Hoysala patrol units.
- **`trace_syndicate_network`**: Returns NetworkX multi-hop entity subgraphs (Vehicles, IMEIs, Mule Accounts, Suspects).
- **`analyze_multimodal_evidence`**: Processes CCTV ANPR images, voice dispatch audio notes, and video frames.
- **`query_ksp_legal_sops`**: Searches Bharatiya Nyaya Sanhita (BNS 2023) legal sections.

### 2. Zia GraphRAG Orchestrator ([`rag_orchestrator.js`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/functions/api_gateway/rag_orchestrator.js))
When an officer submits a natural language question (e.g. *"Show me two-wheeler theft patterns in Indiranagar tonight and suggest Hoysala deployments with relevant BNS sections"*):
1. **Intent Analysis & Tool Dispatch**: The orchestrator triggers `get_threat_vector` + `query_ksp_legal_sops`.
2. **Context Injection**: Graph metrics and BNS legal text are injected into the LLM system prompt.
3. **Tactical Briefing Generation**: Generates structured, explainable police briefings with explicit legal citations.

### 3. Ethics & DPDP Guardrail Interceptor ([`ethics_guard.js`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/functions/api_gateway/ethics_guard.js))
Before any Zia prompt/output is returned, the Ethics Guard scans for algorithmic profiling (caste, religion, demographic traits). If detected, the request is intercepted with a DPDP Act / Article 15 violation notice.

---

## 🧪 How to Test Zia LLM Agents Locally

### Method 1: Automated Node.js MCP & Agent Test Suite
Run the built-in automated test suite:

```bash
node functions/api_gateway/tests/test_mcp_tools.js
```

---

### Method 2: Testing via Windows PowerShell (Invoke-RestMethod & curl.exe)

#### 1. PowerShell `Invoke-RestMethod` (Recommended for Windows)
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-user-role"  = "COMMISSIONER"
}
$body = @{
    query    = "Suggest patrol deployments for Indiranagar two-wheeler thefts tonight"
    language = "en"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/chat" -Method Post -Headers $headers -Body $body
```

#### 2. Windows PowerShell using Native `curl.exe`
```powershell
curl.exe -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -H "x-user-role: COMMISSIONER" -d "{\"query\": \"Suggest patrol deployments for Indiranagar two-wheeler thefts tonight\", \"language\": \"en\"}"
```

#### 3. Test Forensic Dissection via PowerShell `Invoke-RestMethod`
```powershell
$body = @{ case_id = "CASE-2026-IND-88" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/forensics/dissect" -Method Post -Headers @{ "Content-Type" = "application/json" } -Body $body
```

---

### Method 3: Testing via Linux/macOS Bash cURL

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "x-user-role: COMMISSIONER" \
  -d '{"query": "Suggest patrol deployments for Indiranagar two-wheeler thefts tonight", "language": "en"}'
```

---

## 🚀 Wiring Zia LLM in Zoho Catalyst Console

1. In **Zoho Catalyst Console** -> Navigate to **Zia LLM / Agents / MCP Settings**.
2. Register your deployed Catalyst Function URL (`https://<catalyst-domain>/server/api_gateway/api/chat`).
3. Import the tool JSON schemas from [`docs/tools-mcp.md`](file:///d:/Siva/Books/CAREER/HACKATHON/ksp-trinetra-sentinel/docs/tools-mcp.md).

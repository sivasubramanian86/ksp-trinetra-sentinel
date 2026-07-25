# Model Context Protocol (MCP) Tool Specifications

KSP Trinetra Sentinel exposes standardized tool interfaces for Zoho Zia LLM and external agentic orchestrators.

---

## Registered MCP Tools

### 1. `get_threat_vector`
- **Description**: Retrieves spatio-temporal risk forecast score (0.0 - 1.0) and recommended Hoysala patrol units for a designated police beat.
- **Input Schema**:
  ```json
  {
    "beat_code": "BNG-INDIRANAGAR-B1",
    "target_time": "2026-07-25T22:00:00Z"
  }
  ```
- **Output Response**:
  ```json
  {
    "beat_code": "BNG-INDIRANAGAR-B1",
    "predicted_risk_score": 0.78,
    "risk_level": "HIGH_GUARDED",
    "recommended_hoysala_units": 2
  }
  ```

---

### 2. `trace_syndicate_network`
- **Description**: Queries NetworkX Graph ML engine to return connected multi-hop entity subgraph (Vehicles, IMEIs, Mule Accounts, Suspects).
- **Input Schema**:
  ```json
  {
    "entity_id": "KA-01-EQ-1234",
    "entity_type": "VEHICLE",
    "hops": 3
  }
  ```
- **Output Response**:
  ```json
  {
    "seed_identifier": "KA-01-EQ-1234",
    "syndicate_risk_score": 0.89,
    "total_nodes": 5,
    "total_edges": 4,
    "nodes": [...],
    "edges": [...]
  }
  ```

---

### 3. `analyze_multimodal_evidence`
- **Description**: Processes CCTV ANPR images, voice dispatch audio notes, and video frames.
- **Input Schema**:
  ```json
  {
    "media_type": "IMAGE"
  }
  ```

---

### 4. `query_ksp_legal_sops`
- **Description**: Performs vector/keyword lookup against Bharatiya Nyaya Sanhita (BNS 2023) legal codes and KSP Standard Operating Procedures.
- **Input Schema**:
  ```json
  {
    "crime_category": "Chain Snatching"
  }
  ```

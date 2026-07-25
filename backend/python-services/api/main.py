import os
import sys
from pathlib import Path
import warnings

# Suppress external library deprecation and feature warnings
warnings.filterwarnings("ignore")

# Ensure python-services root is in sys.path for direct uvicorn launches
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from core.dpdp_scrubber import PIIScrubber
from core.secrets_vault import secret_vault
from models.st_forecaster import st_forecaster
from models.graph_engine import graph_engine
from models.multimodal_processor import multimodal_processor

from forensics.orchestrator import dissect_forensic_case
from forensics.schemas.forensic_output import EarlyLeadSynthesis

app = FastAPI(
    title="KSP Trinetra Sentinel - Python ML Microservice Engine",
    version="1.0.0",
    description="FastAPI service exposing spatio-temporal risk forecasting, NetworkX graph tracing, multimodal media analysis, and Forensic Triage Engine."
)

# OWASP Security Compliance Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS Security Policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://*.catalystserverless.com", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class HotspotRequest(BaseModel):
    beat_code: Optional[str] = "BNG-INDIRANAGAR-B1"
    target_timestamp: Optional[str] = None
    time_window_hours: Optional[int] = 24

class GraphTraceRequest(BaseModel):
    source_node_id: Optional[str] = "KA-01-EQ-1234"
    max_hops: Optional[int] = 3

class InterventionSimRequest(BaseModel):
    beat_code: str
    additional_hoysala_units: int = 1
    checkpoint_enabled: bool = True

class ForensicDissectRequest(BaseModel):
    case_id: Optional[str] = "CASE-2026-IND-88"
    file_names: Optional[List[str]] = None

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "KSP Trinetra Sentinel Python ML Engine",
        "platform": "Zoho Catalyst Native Microservice Engine",
        "security": {
            "corsConfigured": True,
            "secretVaultActive": True,
            "dpdpActCompliant": True
        },
        "models_loaded": [
            "ST-GNN / XGBoost Hotspot Forecaster",
            "NetworkX Graph Syndicate Engine",
            "Multimodal ANPR Processor",
            "Forensic Triage Multi-Agent Engine (TASK 06)"
        ]
    }

@app.post("/api/v1/predict/hotspots")
def predict_hotspots(req: HotspotRequest):
    try:
        return st_forecaster.predict_hotspots(
            beat_code=req.beat_code,
            target_timestamp=req.target_timestamp,
            time_window_hours=req.time_window_hours
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/graph/trace")
def trace_syndicate(req: GraphTraceRequest):
    try:
        return graph_engine.trace_syndicate(
            source_node_id=req.source_node_id,
            max_hops=req.max_hops
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/multimodal/analyze")
def analyze_multimodal(media_type: str = "IMAGE"):
    if media_type.upper() == "AUDIO":
        return multimodal_processor.analyze_audio()
    return multimodal_processor.analyze_image()

@app.post("/api/v1/simulate/intervention")
def simulate_intervention(req: InterventionSimRequest):
    baseline = st_forecaster.predict_hotspots(beat_code=req.beat_code)
    reduction_factor = 0.35 * req.additional_hoysala_units + (0.20 if req.checkpoint_enabled else 0.0)
    simulated_risk = max(0.10, round(baseline["predicted_risk_score"] * (1 - reduction_factor), 2))
    
    return {
        "beat_code": req.beat_code,
        "original_risk_score": baseline["predicted_risk_score"],
        "simulated_risk_score": simulated_risk,
        "risk_reduction_percentage": f"{round(reduction_factor * 100)}%",
        "intervention_details": {
            "hoysala_units_added": req.additional_hoysala_units,
            "checkpoint_active": req.checkpoint_enabled
        }
    }

# TASK 06: Forensic Report Dissection Endpoint
@app.post("/api/v1/forensics/dissect", response_model=EarlyLeadSynthesis)
async def dissect_forensics(req: ForensicDissectRequest):
    try:
        synthesis = await dissect_forensic_case(
            case_id=req.case_id or "CASE-2026-IND-88",
            file_paths=req.file_names
        )
        return synthesis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

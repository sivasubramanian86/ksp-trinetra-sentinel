from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ForensicEvidenceItem(BaseModel):
    evidence_id: str = Field(..., description="Unique evidence tracking identifier")
    source_report_type: str = Field(..., description="Type of source report e.g. AUTOPSY, CDR, BALLISTICS")
    timestamp_extracted: Optional[str] = Field(None, description="ISO-8601 timestamp extracted from evidence")
    confidence_score: float = Field(default=0.90, ge=0.0, le=1.0)
    raw_snippet: str = Field(..., description="Raw text snippet extracted from report")

class PathologyFinding(ForensicEvidenceItem):
    estimated_time_of_death_window: Dict[str, str] = Field(
        default_factory=lambda: {"start": "2026-07-25T20:00:00Z", "end": "2026-07-25T22:30:00Z"},
        description="Estimated window of death based on rigor mortis / lividity"
    )
    weapon_class_inferred: str = Field(
        default="Blunt Force Instrument / Heavy Caliber",
        description="Inferred weapon category from wound dimensions"
    )
    toxicology_flags: List[str] = Field(
        default_factory=list,
        description="Sedatives, toxins, or foreign compounds identified"
    )

class DigitalForensicFinding(ForensicEvidenceItem):
    suspect_ips: List[str] = Field(default_factory=list, description="Extracted suspicious IP addresses")
    imei_imsi_clusters: List[str] = Field(default_factory=list, description="IMEI / IMSI device identifiers")
    encrypted_payload_flags: List[str] = Field(default_factory=list, description="Detected VPN, TOR, or encrypted flows")
    synthetic_media_probability: float = Field(default=0.0, ge=0.0, le=1.0, description="Deepfake or GAN audio/video probability")

class TraceBallisticsFinding(ForensicEvidenceItem):
    striation_match_signature: Optional[str] = Field(None, description="Rifling lands and grooves matching signature")
    dna_locus_profile: Optional[str] = Field(None, description="STR DNA locus profile string")
    spatter_origin_angle: Optional[float] = Field(None, description="Calculated bloodstain spatter angle of impact in degrees")

class EarlyLeadSynthesis(BaseModel):
    case_id: str = Field(..., description="Target forensic case ID")
    primary_suspect_profiles: List[Dict[str, Any]] = Field(default_factory=list, description="Ranked suspect profiles")
    linked_historical_firs: List[str] = Field(default_factory=list, description="Connected historical FIR case numbers")
    contradictions_found: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Discrepancies between forensic evidence and FIR statements"
    )
    recommended_immediate_actions: List[str] = Field(
        default_factory=list,
        description="Recommended tactical lead actions"
    )
    pathology_summary: Optional[PathologyFinding] = None
    digital_summary: Optional[DigitalForensicFinding] = None
    trace_summary: Optional[TraceBallisticsFinding] = None
    timestamp_generated: str = Field(..., description="ISO-8601 timestamp of lead synthesis")

import pytest
import asyncio
from forensics.schemas.forensic_output import (
    PathologyFinding, DigitalForensicFinding, TraceBallisticsFinding, EarlyLeadSynthesis
)
from forensics.agents.pathology_agent import pathology_agent
from forensics.agents.digital_agent import digital_agent
from forensics.agents.trace_agent import trace_agent
from forensics.agents.timeline_agent import timeline_agent
from forensics.orchestrator import dissect_forensic_case

def test_pydantic_forensic_schemas():
    path_finding = PathologyFinding(
        evidence_id="EVD-PATH-0001",
        source_report_type="AUTOPSY",
        raw_snippet="Sample autopsy snippet",
        estimated_time_of_death_window={"start": "2026-07-24T19:30:00Z", "end": "2026-07-24T21:00:00Z"},
        weapon_class_inferred="Blunt Force Metal",
        toxicology_flags=["Diazepam"]
    )
    assert path_finding.confidence_score == 0.90
    assert "Diazepam" in path_finding.toxicology_flags

def test_subagents_execution():
    p_res = pathology_agent.analyze(filename="sample_autopsy.pdf")
    assert p_res.source_report_type == "POST_MORTEM_AUTOPSY"

    d_res = digital_agent.analyze(filename="sample_pcap.pcap")
    assert len(d_res.suspect_ips) > 0

    t_res = trace_agent.analyze(filename="sample_ballistics.txt")
    assert t_res.striation_match_signature is not None

def test_timeline_synthesis():
    p_res = pathology_agent.analyze()
    d_res = digital_agent.analyze()
    t_res = trace_agent.analyze()

    lead_synthesis = timeline_agent.synthesize_leads(
        case_id="TEST-CASE-101",
        pathology=p_res,
        digital=d_res,
        trace=t_res
    )
    assert lead_synthesis.case_id == "TEST-CASE-101"
    assert len(lead_synthesis.contradictions_found) > 0
    assert len(lead_synthesis.recommended_immediate_actions) > 0

def test_orchestrator_async():
    synthesis = asyncio.run(dissect_forensic_case("ASYNC-CASE-202"))
    assert synthesis.case_id == "ASYNC-CASE-202"
    assert synthesis.pathology_summary is not None

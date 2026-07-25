import asyncio
from typing import List, Optional
from forensics.agents.pathology_agent import pathology_agent
from forensics.agents.digital_agent import digital_agent
from forensics.agents.trace_agent import trace_agent
from forensics.agents.timeline_agent import timeline_agent
from forensics.schemas.forensic_output import EarlyLeadSynthesis

async def process_pathology_async(filename: str):
    return pathology_agent.analyze(filename=filename)

async def process_digital_async(filename: str):
    return digital_agent.analyze(filename=filename)

async def process_trace_async(filename: str):
    return trace_agent.analyze(filename=filename)

async def dissect_forensic_case(case_id: str, file_paths: Optional[List[str]] = None) -> EarlyLeadSynthesis:
    if not file_paths:
        file_paths = ["autopsy_report.pdf", "network_trace.pcap", "ballistics_lab.txt"]

    # Dispatch to subagents in parallel using asyncio.gather
    pathology_res, digital_res, trace_res = await asyncio.gather(
        process_pathology_async(file_paths[0] if len(file_paths) > 0 else "autopsy.pdf"),
        process_digital_async(file_paths[1] if len(file_paths) > 1 else "network.pcap"),
        process_trace_async(file_paths[2] if len(file_paths) > 2 else "ballistics.txt"),
    )

    # Pass outputs to Master Synthesizer Timeline Agent
    lead_synthesis = timeline_agent.synthesize_leads(
        case_id=case_id,
        pathology=pathology_res,
        digital=digital_res,
        trace=trace_res,
    )

    return lead_synthesis

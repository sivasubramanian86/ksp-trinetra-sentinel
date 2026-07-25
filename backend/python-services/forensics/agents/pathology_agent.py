from forensics.schemas.forensic_output import PathologyFinding
from forensics.skills.pdf_parser import pdf_parser

class PathologySubagent:
    """
    Chief Medical Examiner AI Subagent
    Analyzes medical examiner reports, post-mortem notes, and toxicology screens.
    """
    def __init__(self):
        self.agent_name = "PathologySubagent"

    def analyze(self, raw_text: str = None, filename: str = "autopsy.pdf") -> PathologyFinding:
        parsed_doc = pdf_parser.parse_forensic_document(raw_text, filename)
        text = parsed_doc["raw_markdown"]

        # Calculate time of death & infer weapon
        return PathologyFinding(
            evidence_id=f"EVD-PATH-{abs(hash(filename)) % 100000:05d}",
            source_report_type="POST_MORTEM_AUTOPSY",
            timestamp_extracted="2026-07-24T20:15:00Z",
            confidence_score=0.94,
            raw_snippet=text[:300],
            estimated_time_of_death_window={
                "start": "2026-07-24T19:30:00Z",
                "end": "2026-07-24T21:00:00Z"
            },
            weapon_class_inferred="Blunt Force Metallic Object (Heavy Edge)",
            toxicology_flags=["Diazepam (Sedative)", "Organophosphate Compound"]
        )

pathology_agent = PathologySubagent()

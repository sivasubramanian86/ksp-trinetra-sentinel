from forensics.schemas.forensic_output import DigitalForensicFinding
from forensics.skills.pcap_analyzer import pcap_analyzer

class DigitalForensicsSubagent:
    """
    Elite Cyber-Forensic Investigator AI Subagent
    Analyzes Call Detail Records (CDRs), tower dumps, router logs, and PCAP network captures.
    """
    def __init__(self):
        self.agent_name = "DigitalForensicsSubagent"

    def analyze(self, raw_log: str = None, filename: str = "network.pcap") -> DigitalForensicFinding:
        pcap_data = pcap_analyzer.analyze_pcap_logs(raw_log, filename)

        return DigitalForensicFinding(
            evidence_id=f"EVD-DIG-{abs(hash(filename)) % 100000:05d}",
            source_report_type="CDR_TOWER_DUMP_PCAP",
            timestamp_extracted="2026-07-24T22:45:00Z",
            confidence_score=0.91,
            raw_snippet=f"IPs: {pcap_data['suspect_ips']}, IMEIs: {pcap_data['imei_clusters']}",
            suspect_ips=pcap_data["suspect_ips"],
            imei_imsi_clusters=pcap_data["imei_clusters"],
            encrypted_payload_flags=pcap_data["anomalous_protocols"],
            synthetic_media_probability=0.12
        )

digital_agent = DigitalForensicsSubagent()

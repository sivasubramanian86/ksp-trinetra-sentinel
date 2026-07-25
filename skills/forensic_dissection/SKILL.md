---
name: forensic-dissection-engine
description: Multi-agent forensic report triage engine parsing autopsy reports, toxicology, ballistics, CDRs, and PCAPs to synthesize early leads.
---

# Forensic Report Dissection & Early Lead Generation Skill

This skill provides multi-agent forensic triage capabilities for KSP Trinetra Sentinel.

## Subagent Architecture

1. **Pathology Subagent**: Autopsy, rigor mortis, time-of-death calculation, and weapon inference.
2. **Digital Forensics Subagent**: CDR tower dump triangulation, PCAP network flow analysis, and deepfake detection.
3. **Trace & Ballistics Subagent**: Rifling striation matching, partial DNA locus matching, and blood spatter geometry.
4. **Timeline Synthesizer Subagent**: Constructing event graphs and detecting statement vs. physical evidence contradictions.

## Standalone Utility Skills

- `backend/python-services/forensics/skills/pdf_parser.py`: Scanned lab PDF OCR & markdown parser.
- `backend/python-services/forensics/skills/pcap_analyzer.py`: PCAP network traffic & log flow analyzer.

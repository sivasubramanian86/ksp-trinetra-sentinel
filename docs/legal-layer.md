# KSP Trinetra Sentinel — Legal Intelligence Layer

## Overview

The Legal Intelligence Layer provides **ASSISTIVE-ONLY** guidance for Investigating Officers on:
1. IPC → BNS 2023 section cross-references
2. Section element / ingredient checklists
3. Narrative-based candidate section suggestions
4. Key case law references per offence

> **CRITICAL DISCLAIMER**: All legal suggestions from Trinetra are **ASSISTIVE ONLY**.
> Officers must independently verify all elements before invoking any section.
> The system does not constitute legal advice and is not a substitute for prosecutorial review.

## Architecture

```
Officer Query / Case Narrative
        │
        ▼
[classifyQueryIntent()] ─── Intent = LEGAL_EXPLAIN or SECTION_CASES
        │
        ▼
[legal_ethics_agent.js → explainSection() or suggestSections()]
        │
        ▼
[legal_knowledge_base.json] ─── 65-entry IPC↔BNS corpus (in-memory index)
        │
        ▼
Structured response with:
  - Legacy IPC ref + BNS ref
  - Offence title, category, gravity class
  - Bail status, cognizability
  - Max / min punishment
  - Elements (statutory requirements)
  - Ingredient checklist (IO action items)
  - Key case law
  - ASSISTIVE_ONLY label (mandatory)
```

## IPC → BNS Mapping — Key Offences

| IPC Section | BNS Section | Offence Title | Gravity |
|---|---|---|---|
| 302 | 101 | Murder | Heinous |
| 304 | 105 | Culpable Homicide Not Amounting to Murder | Heinous |
| 307 | 109 | Attempt to Murder | Heinous |
| 376 | 63  | Rape / Sexual Assault | Heinous |
| 354 | 74  | Assault to Outrage Modesty | Serious |
| 379 | 303 | Theft | Minor |
| 380 | 305 | Theft in Dwelling House | Serious |
| 392 | 309 | Robbery | Heinous |
| 395 | 310 | Dacoity | Heinous |
| 397 | 311 | Robbery/Dacoity with Deadly Weapon | Heinous |
| 406 | 316 | Criminal Breach of Trust | Serious |
| 420 | 318 | Cheating | Serious |
| 498A | 85  | Cruelty by Husband (DV) | Serious |
| 304B | 80  | Dowry Death | Heinous |
| 120B | 61  | Criminal Conspiracy | Serious |
| 34  | 3   | Common Intention | — |
| 304A | 106 | Causing Death by Negligence (Hit & Run: 5 yr) | Serious |
| 465 | 336A | Forgery | Serious |
| 468 | 336C | Forgery for Cheating | Serious |
| IT Act 66C | IT Act 66C | Identity Theft | Cyber Crime |
| NDPS 21 | NDPS 21 | Drug Possession/Sale | Special Law |
| POCSO 4 | POCSO 4 | Penetrative Sexual Assault on Child | Special Law |

## Ingredient Checklist Model

Each entry in `legal_knowledge_base.json` includes an `ingredient_checklist` array:
```json
[
  { "item": "Victim is a human being", "required": true },
  { "item": "Death of victim established (medical / forensic)", "required": true },
  { "item": "Accused caused the act leading to death", "required": true },
  { "item": "Mens rea: intent to kill or cause grievous injury", "required": true },
  { "item": "No exception applies (grave provocation, right of private defence, etc.)", "required": true }
]
```

Officers see a checkbox checklist in the Copilot panel. The system does not auto-fill checkboxes.

## DPDP Act 2023 Compliance

- No profiling by religion, caste, ethnicity, or community
- Ethics guard (`auditQuery()`) blocks any query containing profiling terms
- All blocked queries logged with `ETHICS_BLOCK` action type
- Legal suggestion calls logged with `assistive_only = 1` flag in audit_log

## Legal Layer API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| MCP `explain_legal_section` | Tool | Full section explanation (KB lookup) |
| MCP `query_ksp_legal_sops` | Tool | BNS SOPs for a crime category |
| `legal_ethics_agent.suggestSections(narrative)` | JS fn | Keyword-matched candidate sections |
| `/api/v1/fir/analytics/victim-journey` | POST | Case milestone timeline |

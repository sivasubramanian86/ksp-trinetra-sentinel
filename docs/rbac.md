# KSP Trinetra Sentinel — RBAC Policy Reference

> Source of truth: `functions/api_gateway/rbac_policy.js`

## Role → Clearance Level → Case Scope Matrix

| Role | Clearance | Case Scope | PII Mask Tier | Analytics | Legal Layer |
|---|---|---|---|---|---|
| `CONSTABLE` / `BEAT_OFFICER` | 1 | Own Unit | FULL_REDACT (0) | No | No |
| `IO` / `PATROL_OFFICER` | 2 | Own Unit | PARTIAL (1) | Unit only | Yes |
| `SHO` / `STATION_HOUSE_OFFICER` | 3 | Own Unit | STANDARD (2) | Unit only | Yes |
| `DCP` | 4 | District | STANDARD (2) | District | Yes |
| `IGP` / `ADGP` | 5 | Zone | STANDARD (2) | Zone | Yes |
| `DGP` / `COMMISSIONER` / `HQ_ANALYST` / `ANALYST` | 6 | State-wide | UNMASKED (3) | State-wide | Yes |

## PII Mask Tiers

| Tier | Label | Name | Phone | Aadhaar | Address | BriefFacts |
|---|---|---|---|---|---|---|
| 0 | `FULL_REDACT` | `[IDENTITY PROTECTED]` | `XXXXXXXXXX` | `XXXX-XXXX-XXXX` | `[ADDRESS PROTECTED]` | `[CASE NARRATIVE RESTRICTED]` |
| 1 | `PARTIAL` | Initials only (`K***`) | Last 4 masked | Fully masked | `[ADDRESS RESTRICTED]` | Visible |
| 2 | `STANDARD` | Full name | Fully masked | Fully masked | Visible | Visible |
| 3 | `UNMASKED` | Full name | Full | Full | Full | Full |

## SQL Scope Clauses

| Case Scope | SQL WHERE Clause |
|---|---|
| `OWN_CASES_ONLY` | `cm.PolicePersonID = $1` |
| `OWN_UNIT` | `cm.PoliceStationID = $1` |
| `DISTRICT` | `u.DistrictID = $1` |
| `ZONE` | `u.DistrictID = $1` (MVP; zone hierarchy traversal in v2) |
| `STATE_WIDE` | `1=1` (no restriction) |

## Endpoint Allow-List (Key Endpoints)

| Endpoint | Minimum Role |
|---|---|
| `GET /api/v1/cases` | `CONSTABLE` |
| `GET /api/v1/cases/:id` | `IO` |
| `GET /api/v1/cases/search` | `IO` |
| `GET /api/v1/analytics/snapshot` | `SHO` |
| `GET /api/v1/analytics/chargesheet-lag` | `SHO` |
| `GET /api/v1/analytics/arrest-performance` | `SHO` |
| `GET /api/v1/analytics/victim-journey/:id` | `IO` |
| `POST /api/v1/operations/plan` | `SHO` |
| `PATCH /api/v1/operations/plans/:id/status` | `DCP` |
| `POST /api/chat` (Copilot) | `IO` |
| `GET /api/hotspots/forecast` | `PATROL_OFFICER` |
| `POST /api/graph/story` | `DCP` |

## Audit Actions Logged

| Action | Trigger |
|---|---|
| `CASE_VIEW` | `GET /api/v1/cases/:id` |
| `CASE_SEARCH` | `GET /api/v1/cases` and `/cases/search` |
| `ANALYTICS_VIEW` | `GET /api/v1/analytics/*` |
| `COPILOT_QUERY` | `POST /api/chat` |
| `LEGAL_EXPLAIN` | MCP `explain_legal_section` |
| `SECTION_SUGGEST` | `suggestSections()` called |
| `OPERATION_CREATE` | `POST /api/v1/operations/plan` |
| `ETHICS_BLOCK` | Ethics guard blocks constitutional violation |

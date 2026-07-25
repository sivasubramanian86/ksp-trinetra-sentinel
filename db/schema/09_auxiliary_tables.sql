-- KSP Trinetra Sentinel — Auxiliary / Non-Intrusive Production Tables
-- Schema Version: 1.0
-- Purpose: AuditLog, OperationPlan, DashboardPreset, LegalKnowledgeBase
-- SAFE TO RUN: All tables are additive; no existing tables are altered.

-- 1. AuditLog — tamper-evident access log for every case/PII data access
--    Dual-written from Node.js (Catalyst Datastore + Postgres)
CREATE TABLE IF NOT EXISTS audit_log (
    audit_id          SERIAL PRIMARY KEY,
    employee_id       INT NOT NULL,                 -- EmployeeID from Employee table
    unit_id           INT NOT NULL,                 -- UnitID from Unit table
    action_type       VARCHAR(50) NOT NULL,         -- CASE_VIEW, CASE_SEARCH, ANALYTICS_VIEW,
                                                    -- COPILOT_QUERY, LEGAL_EXPLAIN, SECTION_SUGGEST
    resource_type     VARCHAR(50),                  -- CaseMaster, Accused, Analytics, LegalSection
    resource_id       VARCHAR(100),                 -- CaseMasterID, SectionCode, etc.
    query_text        TEXT,                         -- NL query text (copilot queries only)
    ip_address        INET,
    user_agent        VARCHAR(255),
    response_status   INT,                          -- HTTP status code
    pii_masked        BIT DEFAULT 0,               -- Whether PII masking was applied
    dpdp_compliant    BIT DEFAULT 1,               -- DPDP Act compliance flag
    assistive_only    BIT DEFAULT 0,               -- Legal suggestion: assistive-only label
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditlog_employee ON audit_log (employee_id);
CREATE INDEX IF NOT EXISTS idx_auditlog_case     ON audit_log (resource_id) WHERE resource_type = 'CaseMaster';
CREATE INDEX IF NOT EXISTS idx_auditlog_ts       ON audit_log (created_at);
CREATE INDEX IF NOT EXISTS idx_auditlog_unit     ON audit_log (unit_id);

-- 2. OperationPlan — structured patrol and intervention operation plans
CREATE TABLE IF NOT EXISTS operation_plan (
    plan_id             SERIAL PRIMARY KEY,
    plan_name           VARCHAR(200) NOT NULL,
    plan_type           VARCHAR(50) DEFAULT 'PATROL',  -- PATROL, RAID, CHECKPOINT, SPECIAL_DRIVE
    status              VARCHAR(30) DEFAULT 'DRAFT',   -- DRAFT, APPROVED, ACTIVE, COMPLETED, CANCELLED
    responsible_unit_id INT NOT NULL,                  -- FK: Unit.UnitID
    created_by_id       INT NOT NULL,                  -- FK: Employee.EmployeeID
    approved_by_id      INT,                           -- FK: Employee.EmployeeID (SHO+)
    linked_case_id      INT,                           -- FK: CaseMaster.CaseMasterID (optional)
    district_id         INT,                           -- FK: District.DistrictID
    hotspot_grid_ref    VARCHAR(100),                  -- beat_code or grid cell reference
    patrol_routes       JSONB DEFAULT '[]'::jsonb,     -- [{route, timing, officers}]
    resource_allocation JSONB DEFAULT '{}'::jsonb,     -- {vehicles: N, officers: [...], shifts: [...]}
    operation_date      DATE NOT NULL,
    shift_start_time    TIME,
    shift_end_time      TIME,
    briefing_notes      TEXT,
    outcome_notes       TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opplan_unit   ON operation_plan (responsible_unit_id);
CREATE INDEX IF NOT EXISTS idx_opplan_date   ON operation_plan (operation_date);
CREATE INDEX IF NOT EXISTS idx_opplan_status ON operation_plan (status);

-- 3. DashboardPreset — saved filter/view presets per officer
CREATE TABLE IF NOT EXISTS dashboard_preset (
    preset_id     SERIAL PRIMARY KEY,
    employee_id   INT NOT NULL,            -- FK: Employee.EmployeeID
    preset_name   VARCHAR(100) NOT NULL,
    module        VARCHAR(50) NOT NULL,    -- DG_SNAPSHOT, CASE_SEARCH, VICTIM_JOURNEY, etc.
    filters       JSONB DEFAULT '{}'::jsonb,
    is_default    BIT DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, preset_name)
);

CREATE INDEX IF NOT EXISTS idx_preset_employee ON dashboard_preset (employee_id);

-- 4. LegalKnowledgeBase — IPC <-> BNS section mapping corpus
--    This table is the seed store for the legal intelligence RAG layer.
--    Populated from db/seeds/legal_knowledge_base.json
CREATE TABLE IF NOT EXISTS legal_knowledge_base (
    kb_id              SERIAL PRIMARY KEY,
    legacy_act_code    VARCHAR(20),          -- 'IPC', 'CrPC', etc.
    legacy_section     VARCHAR(30),          -- e.g. '420', '302', '376'
    bns_act_code       VARCHAR(20),          -- 'BNS', 'BNSS', etc.
    bns_section        VARCHAR(30),          -- e.g. '318', '101', '63'
    offence_title      VARCHAR(200) NOT NULL,
    offence_category   VARCHAR(100),         -- Theft, Cheating, Murder, etc.
    gravity_class      INT REFERENCES GravityOffence(GravityOffenceID),
    elements           JSONB DEFAULT '[]'::jsonb,    -- ["Element 1", "Element 2", ...]
    max_punishment     VARCHAR(200),
    min_punishment     VARCHAR(200),
    bail_status        VARCHAR(20),          -- Bailable, Non-Bailable
    cognizable         BIT DEFAULT 1,
    key_case_law       TEXT,
    ingredient_checklist JSONB DEFAULT '[]'::jsonb,  -- [{"item": "...", "required": true}]
    assistive_note     TEXT DEFAULT 'This suggestion is ASSISTIVE ONLY. Officer must verify all elements.',
    active             BIT DEFAULT 1,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lkb_legacy   ON legal_knowledge_base (legacy_act_code, legacy_section);
CREATE INDEX IF NOT EXISTS idx_lkb_bns      ON legal_knowledge_base (bns_act_code, bns_section);
CREATE INDEX IF NOT EXISTS idx_lkb_category ON legal_knowledge_base (offence_category);

-- 5. CaseConnectionGraph — links between cases via common accused/vehicle/account
--    Feeds the Mind Palace graph view
CREATE TABLE IF NOT EXISTS case_connection (
    connection_id    SERIAL PRIMARY KEY,
    case_a_id        INT REFERENCES CaseMaster(CaseMasterID),
    case_b_id        INT REFERENCES CaseMaster(CaseMasterID),
    connection_type  VARCHAR(50) NOT NULL,  -- COMMON_ACCUSED, COMMON_VEHICLE, COMMON_ACCOUNT
    connection_ref   VARCHAR(200),          -- PersonID, vehicle_tag, UPI_ID
    strength_score   DECIMAL(4,3) DEFAULT 0.5,  -- 0.0 to 1.0
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (case_a_id, case_b_id, connection_type, connection_ref)
);

CREATE INDEX IF NOT EXISTS idx_case_conn_a ON case_connection (case_a_id);
CREATE INDEX IF NOT EXISTS idx_case_conn_b ON case_connection (case_b_id);

-- Forensic Early Lead Synthesis Table (TASK 06)
CREATE TABLE IF NOT EXISTS forensic_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(64) NOT NULL,
    suspect_profiles JSONB DEFAULT '[]'::jsonb,
    contradictions_found JSONB DEFAULT '[]'::jsonb,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    full_synthesis JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forensic_case ON forensic_leads (case_id);

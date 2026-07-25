-- Entities Table (Person, Vehicle, Device, Mule Account)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_code VARCHAR(64) UNIQUE NOT NULL,
    entity_type VARCHAR(32) NOT NULL, -- PERSON, VEHICLE, DEVICE, ACCOUNT
    display_label VARCHAR(128) NOT NULL,
    risk_score FLOAT DEFAULT 0.0,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities (entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_code ON entities (entity_code);

-- Incident Entity Links (Graph Relationship Store)
CREATE TABLE IF NOT EXISTS incident_entity_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES crime_incidents(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL, -- SUSPECT, VICTIM, VEHICLE_USED, DEVICE_USED, MULE_ACCOUNT
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_links_incident ON incident_entity_links (incident_id);
CREATE INDEX IF NOT EXISTS idx_links_entity ON incident_entity_links (entity_id);

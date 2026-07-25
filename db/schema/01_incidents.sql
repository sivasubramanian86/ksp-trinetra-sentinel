-- PostgreSQL + PostGIS Schema for Crime Incidents
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS crime_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_number VARCHAR(64) UNIQUE NOT NULL,
    incident_type VARCHAR(64) NOT NULL,
    crime_layer VARCHAR(64) DEFAULT 'STREET_CRIME',
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location GEOMETRY(Point, 4326) NOT NULL,
    station_code VARCHAR(32) NOT NULL,
    beat_id VARCHAR(64) NOT NULL,
    division VARCHAR(64) NOT NULL,
    narrative_kannada TEXT,
    narrative_english TEXT,
    attributes JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_incidents_location ON crime_incidents USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_incidents_beat ON crime_incidents (beat_id);
CREATE INDEX IF NOT EXISTS idx_incidents_occurred ON crime_incidents (occurred_at);

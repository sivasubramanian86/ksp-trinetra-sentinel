-- Multimodal Media Evidence Records (CCTV, Voice Dispatch Notes, Video)
CREATE TABLE IF NOT EXISTS multimodal_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES crime_incidents(id) ON DELETE SET NULL,
    media_type VARCHAR(32) NOT NULL, -- IMAGE, AUDIO, VIDEO
    file_path VARCHAR(256) NOT NULL,
    transcription_kannada TEXT,
    transcription_english TEXT,
    extracted_features JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_type ON multimodal_media (media_type);

-- Grid Risk Scores Table (Spatio-Temporal Model Output Storage)
CREATE TABLE IF NOT EXISTS grid_risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grid_id UUID REFERENCES grid_cells(id) ON DELETE CASCADE,
    beat_id VARCHAR(64) NOT NULL,
    time_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    time_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    crime_layer VARCHAR(64) DEFAULT 'STREET_CRIME',
    risk_score FLOAT NOT NULL,
    explanation JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risk_beat ON grid_risk_scores (beat_id);
CREATE INDEX IF NOT EXISTS idx_risk_window ON grid_risk_scores (time_window_start, time_window_end);

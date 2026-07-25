-- Grid Cells Table (Police Beat Polygons)
CREATE TABLE IF NOT EXISTS grid_cells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grid_code VARCHAR(64) UNIQUE NOT NULL,
    beat_id VARCHAR(64) NOT NULL,
    division VARCHAR(64) NOT NULL,
    police_station VARCHAR(128) NOT NULL,
    grid_polygon GEOMETRY(Polygon, 4326) NOT NULL,
    attributes JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_grid_polygon ON grid_cells USING GIST (grid_polygon);
CREATE INDEX IF NOT EXISTS idx_grid_beat ON grid_cells (beat_id);

ALTER TABLE presets
ADD COLUMN agent BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN workspace_id UUID REFERENCES collections(id) ON DELETE CASCADE;

CREATE INDEX presets_collection_id_idx ON presets(workspace_id);

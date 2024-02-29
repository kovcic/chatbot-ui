ALTER TABLE presets
ADD COLUMN similarity_top_k INT,
ADD COLUMN doc_agent_model TEXT CHECK (char_length(model) <= 1000),
ADD COLUMN doc_agent_temperature REAL,
ADD COLUMN doc_agent_similarity_top_k INT;

ALTER TABLE presets
ADD COLUMN doc_agent_prompt TEXT CHECK (char_length(doc_agent_prompt) <= 100000);

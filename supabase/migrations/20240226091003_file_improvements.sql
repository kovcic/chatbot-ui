CREATE TYPE file_processing_state AS ENUM ('IN_PROGRESS', 'ERROR', 'SUCCESS');

ALTER TABLE files
ADD COLUMN run_status file_processing_state;

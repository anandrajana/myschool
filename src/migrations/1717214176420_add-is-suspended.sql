-- Up Migration

ALTER TABLE student
ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;

-- Down Migration
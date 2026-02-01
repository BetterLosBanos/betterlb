-- Add mayor_id and vice_mayor_id foreign keys to terms table
-- Migration: 002_add_mayor_fk.sql

-- Add new columns
ALTER TABLE terms ADD COLUMN mayor_id TEXT;
ALTER TABLE terms ADD COLUMN vice_mayor_id TEXT;

-- Update sb_9: Mayor CAESAR P. PEREZ (perez-caesar-p), Vice Mayor PROCOPIO A. ALIPON (alipon-procopio-a)
UPDATE terms SET mayor_id = 'perez-caesar-p', vice_mayor_id = 'alipon-procopio-a' WHERE id = 'sb_9';

-- Update sb_10: Mayor CAESAR P. PEREZ (perez-caesar-p), Vice Mayor ANTONIO L. KALAW (kalaw-antonio-l)
UPDATE terms SET mayor_id = 'perez-caesar-p', vice_mayor_id = 'kalaw-antonio-l' WHERE id = 'sb_10';

-- Update sb_11: Mayor ANTHONY F. GENUINO (genuino-anthony-f), Vice Mayor JOSEPHINE S. EVANGELISTA (evangelista-josephine-s)
UPDATE terms SET mayor_id = 'genuino-anthony-f', vice_mayor_id = 'evangelista-josephine-s' WHERE id = 'sb_11';

-- Update sb_12: Mayor NIEL ANDREW N. NOCON (nocon-niel-andrew-n), Vice Mayor MARLO PJ A. ALIPON (alipon-marlo-pj-a)
UPDATE terms SET mayor_id = 'nocon-niel-andrew-n', vice_mayor_id = 'alipon-marlo-pj-a' WHERE id = 'sb_12';

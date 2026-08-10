ALTER TABLE goals ADD COLUMN organisation_managed BOOLEAN DEFAULT FALSE;

UPDATE goals
SET organisation_managed = TRUE
WHERE user_id IN (SELECT id FROM users WHERE UPPER(role) = 'ORG_ADMIN');

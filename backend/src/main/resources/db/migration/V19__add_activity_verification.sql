ALTER TABLE activity_logs ADD COLUMN verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE activity_logs ADD COLUMN verified_by BIGINT;
ALTER TABLE activity_logs ADD COLUMN verified_at TIMESTAMP NULL;

UPDATE activity_logs SET verification_status = 'PENDING' WHERE verification_status IS NULL OR verification_status = '';

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS verified_by BIGINT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

UPDATE activity_logs SET verification_status = 'PENDING' WHERE verification_status IS NULL OR verification_status = '';

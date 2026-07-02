-- 1. Prevent duplicate emission rules
ALTER TABLE emission_factors ADD CONSTRAINT uq_activity_unit_date UNIQUE (activity_type, unit, effective_date);

-- 2. Speed up Milestone 2 analytics aggregation queries
CREATE INDEX idx_activity_logs_user_date ON activity_logs (user_id, log_date);

-- 3. Close the loop on organization administrative tracking integrity
ALTER TABLE organisations ADD CONSTRAINT fk_org_admin FOREIGN KEY (admin_user_id) REFERENCES users(id);

-- 4. Restrict columns to valid operational system states
ALTER TABLE users ADD CONSTRAINT chk_role CHECK (role IN ('USER', 'ADMIN', 'ORG_ADMIN'));
ALTER TABLE goals ADD CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'ACHIEVED', 'MISSED'));
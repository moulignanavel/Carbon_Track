CREATE TABLE role_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    changed_user_id BIGINT NOT NULL,
    old_role VARCHAR(20) NOT NULL,
    new_role VARCHAR(20) NOT NULL,
    changed_by_user_id BIGINT NOT NULL,
    organisation_id BIGINT,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role_audit_changed_user FOREIGN KEY (changed_user_id) REFERENCES users(id),
    CONSTRAINT fk_role_audit_changed_by FOREIGN KEY (changed_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_role_audit_organisation FOREIGN KEY (organisation_id) REFERENCES organisations(id)
);

CREATE INDEX idx_role_audit_changed_user ON role_audit_logs(changed_user_id);
CREATE INDEX idx_role_audit_changed_at ON role_audit_logs(changed_at);

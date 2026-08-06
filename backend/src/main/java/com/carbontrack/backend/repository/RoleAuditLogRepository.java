package com.carbontrack.backend.repository;

import com.carbontrack.backend.entity.RoleAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleAuditLogRepository extends JpaRepository<RoleAuditLog, Long> {
}

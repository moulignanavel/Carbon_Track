package com.carbontrack.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_audit_logs")
public class RoleAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "changed_user_id", nullable = false)
    private Long changedUserId;
    @Column(name = "old_role", nullable = false, length = 20)
    private String oldRole;
    @Column(name = "new_role", nullable = false, length = 20)
    private String newRole;
    @Column(name = "changed_by_user_id", nullable = false)
    private Long changedByUserId;
    @Column(name = "organisation_id")
    private Long organisationId;
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    public Long getId() { return id; }
    public Long getChangedUserId() { return changedUserId; }
    public void setChangedUserId(Long value) { this.changedUserId = value; }
    public String getOldRole() { return oldRole; }
    public void setOldRole(String value) { this.oldRole = value; }
    public String getNewRole() { return newRole; }
    public void setNewRole(String value) { this.newRole = value; }
    public Long getChangedByUserId() { return changedByUserId; }
    public void setChangedByUserId(Long value) { this.changedByUserId = value; }
    public Long getOrganisationId() { return organisationId; }
    public void setOrganisationId(Long value) { this.organisationId = value; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime value) { this.changedAt = value; }
}

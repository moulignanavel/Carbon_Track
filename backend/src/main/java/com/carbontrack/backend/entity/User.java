package com.carbontrack.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @PrePersist
    void applyDefaults() {
        if (fullName == null || fullName.isBlank()) fullName = username;
        if (status == null || status.isBlank()) status = "ACTIVE";
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;
    // Kept nullable at the ORM schema-update layer so existing development
    // databases can add this column. V14 enforces NOT NULL in production and
    // applyDefaults() always supplies a value for new records.
    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String role;
    @Column(length = 20)
    private String status = "ACTIVE";
    @Column(name = "job_title", length = 100)
    private String jobTitle;
    @Column(length = 100)
    private String department;
    @Column(length = 50)
    private String phone;

    @ManyToOne
    @JoinColumn(name = "org_id")
    private Organisation organisation;

    @Column(name = "sustainability_preferences", columnDefinition = "JSON")
    private String sustainabilityPreferences;

    @Lob
    @Column(name = "avatar_url", columnDefinition = "LONGTEXT")
    private String avatarUrl;

    // Explicit Getters and Setters to resolve compiler failures
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Organisation getOrganisation() { return organisation; }
    public void setOrganisation(Organisation organisation) { this.organisation = organisation; }

    public String getSustainabilityPreferences() { return sustainabilityPreferences; }
    public void setSustainabilityPreferences(String sustainabilityPreferences) { this.sustainabilityPreferences = sustainabilityPreferences; }

    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean isAnonymous) { this.isAnonymous = isAnonymous; }

    @Column(name = "anonymous_name", length = 50)
    private String anonymousName;

    public String getAnonymousName() { return anonymousName; }
    public void setAnonymousName(String anonymousName) { this.anonymousName = anonymousName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}

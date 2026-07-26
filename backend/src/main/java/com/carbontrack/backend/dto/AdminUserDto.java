package com.carbontrack.backend.dto;

public class AdminUserDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private long totalLogs;
    private double totalEmissionsKg;
    private String joinedDate;

    public AdminUserDto() {}

    public AdminUserDto(Long id, String username, String email, String role, long totalLogs, double totalEmissionsKg, String joinedDate) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.totalLogs = totalLogs;
        this.totalEmissionsKg = totalEmissionsKg;
        this.joinedDate = joinedDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getTotalLogs() {
        return totalLogs;
    }

    public void setTotalLogs(long totalLogs) {
        this.totalLogs = totalLogs;
    }

    public double getTotalEmissionsKg() {
        return totalEmissionsKg;
    }

    public void setTotalEmissionsKg(double totalEmissionsKg) {
        this.totalEmissionsKg = totalEmissionsKg;
    }

    public String getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(String joinedDate) {
        this.joinedDate = joinedDate;
    }
}

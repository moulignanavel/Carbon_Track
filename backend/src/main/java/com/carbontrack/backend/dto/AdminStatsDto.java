package com.carbontrack.backend.dto;

public class AdminStatsDto {
    private long totalUsers;
    private long totalActivityLogs;
    private double totalEmissionsKg;
    private long totalAdmins;

    private java.util.Map<String, Double> categoryBreakdown;

    public AdminStatsDto() {}

    public AdminStatsDto(long totalUsers, long totalActivityLogs, double totalEmissionsKg, long totalAdmins, java.util.Map<String, Double> categoryBreakdown) {
        this.totalUsers = totalUsers;
        this.totalActivityLogs = totalActivityLogs;
        this.totalEmissionsKg = totalEmissionsKg;
        this.totalAdmins = totalAdmins;
        this.categoryBreakdown = categoryBreakdown;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalActivityLogs() {
        return totalActivityLogs;
    }

    public void setTotalActivityLogs(long totalActivityLogs) {
        this.totalActivityLogs = totalActivityLogs;
    }

    public double getTotalEmissionsKg() {
        return totalEmissionsKg;
    }

    public void setTotalEmissionsKg(double totalEmissionsKg) {
        this.totalEmissionsKg = totalEmissionsKg;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public java.util.Map<String, Double> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(java.util.Map<String, Double> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }
}

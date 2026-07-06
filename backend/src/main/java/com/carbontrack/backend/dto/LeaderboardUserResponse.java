package com.carbontrack.backend.dto;

import java.util.List;

public class LeaderboardUserResponse {
    private Long userId;
    private String username;
    private Integer rank;
    private Double totalCO2Saved;
    private Double totalEmissionsSaved;
    private Integer activityCount;
    private List<String> badges;
    private String badge;

    public LeaderboardUserResponse() {}

    public LeaderboardUserResponse(Long userId, String username, Integer rank, Double totalCO2Saved, Double totalEmissionsSaved, Integer activityCount, List<String> badges, String badge) {
        this.userId = userId;
        this.username = username;
        this.rank = rank;
        this.totalCO2Saved = totalCO2Saved;
        this.totalEmissionsSaved = totalEmissionsSaved;
        this.activityCount = activityCount;
        this.badges = badges;
        this.badge = badge;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public Double getTotalCO2Saved() { return totalCO2Saved; }
    public void setTotalCO2Saved(Double totalCO2Saved) { this.totalCO2Saved = totalCO2Saved; }

    public Double getTotalEmissionsSaved() { return totalEmissionsSaved; }
    public void setTotalEmissionsSaved(Double totalEmissionsSaved) { this.totalEmissionsSaved = totalEmissionsSaved; }

    public Integer getActivityCount() { return activityCount; }
    public void setActivityCount(Integer activityCount) { this.activityCount = activityCount; }

    public List<String> getBadges() { return badges; }
    public void setBadges(List<String> badges) { this.badges = badges; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
}

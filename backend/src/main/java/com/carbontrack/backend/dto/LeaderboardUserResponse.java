package com.carbontrack.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private Integer footprintScore;
    private String categoryStrength;
    private String habitTip;
    private Boolean currentUser;
    private Long organisationId;
    private Boolean isAnonymous;
    private String anonymousName;

    public LeaderboardUserResponse() {}

    public LeaderboardUserResponse(Long userId, String username, Integer rank, Double totalCO2Saved,
                                   Double totalEmissionsSaved, Integer activityCount, List<String> badges,
                                   String badge, Integer footprintScore, String categoryStrength,
                                   String habitTip, Boolean currentUser, Long organisationId) {
        this(userId, username, rank, totalCO2Saved, totalEmissionsSaved, activityCount, badges, badge, footprintScore, categoryStrength, habitTip, currentUser, organisationId, false, null);
    }

    public LeaderboardUserResponse(Long userId, String username, Integer rank, Double totalCO2Saved,
                                   Double totalEmissionsSaved, Integer activityCount, List<String> badges,
                                   String badge, Integer footprintScore, String categoryStrength,
                                   String habitTip, Boolean currentUser, Long organisationId,
                                   Boolean isAnonymous, String anonymousName) {
        this.userId = userId;
        this.username = username;
        this.rank = rank;
        this.totalCO2Saved = totalCO2Saved;
        this.totalEmissionsSaved = totalEmissionsSaved;
        this.activityCount = activityCount;
        this.badges = badges;
        this.badge = badge;
        this.footprintScore = footprintScore;
        this.categoryStrength = categoryStrength;
        this.habitTip = habitTip;
        this.currentUser = currentUser;
        this.organisationId = organisationId;
        this.isAnonymous = isAnonymous;
        this.anonymousName = anonymousName;
    }

    public Long getOrganisationId() { return organisationId; }
    public void setOrganisationId(Long organisationId) { this.organisationId = organisationId; }

    @JsonIgnore
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

    public Integer getFootprintScore() { return footprintScore; }
    public void setFootprintScore(Integer footprintScore) { this.footprintScore = footprintScore; }

    public String getCategoryStrength() { return categoryStrength; }
    public void setCategoryStrength(String categoryStrength) { this.categoryStrength = categoryStrength; }

    public String getHabitTip() { return habitTip; }
    public void setHabitTip(String habitTip) { this.habitTip = habitTip; }

    public Boolean getCurrentUser() { return currentUser; }
    public void setCurrentUser(Boolean currentUser) { this.currentUser = currentUser; }

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean isAnonymous) { this.isAnonymous = isAnonymous; }

    public String getAnonymousName() { return anonymousName; }
    public void setAnonymousName(String anonymousName) { this.anonymousName = anonymousName; }
}

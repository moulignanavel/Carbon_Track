package com.carbontrack.backend.dto;

import java.util.List;

public class LeaderboardResponse {
    private List<LeaderboardUserResponse> topThree;
    private List<LeaderboardUserResponse> all;
    private LeaderboardUserResponse currentUser;
    private Long timestamp;

    // Dynamic community overview stats
    private long totalCommunityMembers;
    private double totalCO2Saved;
    private long activitiesLoggedToday;
    private long activeChallenges;

    // Dynamic feeds and analytics
    private List<RecentAchievementDto> recentAchievements;
    private List<DailyTrendDto> dailyTrends;

    public LeaderboardResponse() {}

    public LeaderboardResponse(List<LeaderboardUserResponse> topThree,
                               List<LeaderboardUserResponse> all,
                               LeaderboardUserResponse currentUser,
                               Long timestamp,
                               long totalCommunityMembers,
                               double totalCO2Saved,
                               long activitiesLoggedToday,
                               long activeChallenges,
                               List<RecentAchievementDto> recentAchievements,
                               List<DailyTrendDto> dailyTrends) {
        this.topThree = topThree;
        this.all = all;
        this.currentUser = currentUser;
        this.timestamp = timestamp;
        this.totalCommunityMembers = totalCommunityMembers;
        this.totalCO2Saved = totalCO2Saved;
        this.activitiesLoggedToday = activitiesLoggedToday;
        this.activeChallenges = activeChallenges;
        this.recentAchievements = recentAchievements;
        this.dailyTrends = dailyTrends;
    }

    public List<LeaderboardUserResponse> getTopThree() { return topThree; }
    public void setTopThree(List<LeaderboardUserResponse> topThree) { this.topThree = topThree; }

    public List<LeaderboardUserResponse> getAll() { return all; }
    public void setAll(List<LeaderboardUserResponse> all) { this.all = all; }

    public LeaderboardUserResponse getCurrentUser() { return currentUser; }
    public void setCurrentUser(LeaderboardUserResponse currentUser) { this.currentUser = currentUser; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }

    public long getTotalCommunityMembers() { return totalCommunityMembers; }
    public void setTotalCommunityMembers(long totalCommunityMembers) { this.totalCommunityMembers = totalCommunityMembers; }

    public double getTotalCO2Saved() { return totalCO2Saved; }
    public void setTotalCO2Saved(double totalCO2Saved) { this.totalCO2Saved = totalCO2Saved; }

    public long getActivitiesLoggedToday() { return activitiesLoggedToday; }
    public void setActivitiesLoggedToday(long activitiesLoggedToday) { this.activitiesLoggedToday = activitiesLoggedToday; }

    public long getActiveChallenges() { return activeChallenges; }
    public void setActiveChallenges(long activeChallenges) { this.activeChallenges = activeChallenges; }

    public List<RecentAchievementDto> getRecentAchievements() { return recentAchievements; }
    public void setRecentAchievements(List<RecentAchievementDto> recentAchievements) { this.recentAchievements = recentAchievements; }

    public List<DailyTrendDto> getDailyTrends() { return dailyTrends; }
    public void setDailyTrends(List<DailyTrendDto> dailyTrends) { this.dailyTrends = dailyTrends; }
}

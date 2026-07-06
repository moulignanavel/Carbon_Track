package com.carbontrack.backend.dto;

import java.util.List;

public class LeaderboardResponse {
    private List<LeaderboardUserResponse> topThree;
    private List<LeaderboardUserResponse> all;
    private LeaderboardUserResponse currentUser;
    private Long timestamp;

    public LeaderboardResponse() {}

    public LeaderboardResponse(List<LeaderboardUserResponse> topThree, List<LeaderboardUserResponse> all, LeaderboardUserResponse currentUser, Long timestamp) {
        this.topThree = topThree;
        this.all = all;
        this.currentUser = currentUser;
        this.timestamp = timestamp;
    }

    public List<LeaderboardUserResponse> getTopThree() { return topThree; }
    public void setTopThree(List<LeaderboardUserResponse> topThree) { this.topThree = topThree; }

    public List<LeaderboardUserResponse> getAll() { return all; }
    public void setAll(List<LeaderboardUserResponse> all) { this.all = all; }

    public LeaderboardUserResponse getCurrentUser() { return currentUser; }
    public void setCurrentUser(LeaderboardUserResponse currentUser) { this.currentUser = currentUser; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
}

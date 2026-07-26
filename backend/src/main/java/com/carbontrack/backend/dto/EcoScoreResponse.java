package com.carbontrack.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class EcoScoreResponse {

    private int score; // 300 to 850
    private String rating; // "Excellent", "Good", "Fair", "Needs Action"
    private String color; // hex color string
    private int percentile; // e.g. 85 for top 15%
    private ScoreBreakdown breakdown;
    private List<String> tips = new ArrayList<>();

    public static class ScoreBreakdown {
        private int emissionScore; // max 350
        private int streakScore;   // max 250
        private int goalScore;     // max 250

        public ScoreBreakdown() {}

        public ScoreBreakdown(int emissionScore, int streakScore, int goalScore) {
            this.emissionScore = emissionScore;
            this.streakScore = streakScore;
            this.goalScore = goalScore;
        }

        public int getEmissionScore() { return emissionScore; }
        public void setEmissionScore(int emissionScore) { this.emissionScore = emissionScore; }

        public int getStreakScore() { return streakScore; }
        public void setStreakScore(int streakScore) { this.streakScore = streakScore; }

        public int getGoalScore() { return goalScore; }
        public void setGoalScore(int goalScore) { this.goalScore = goalScore; }
    }

    public EcoScoreResponse() {}

    public EcoScoreResponse(int score, String rating, String color, int percentile, ScoreBreakdown breakdown, List<String> tips) {
        this.score = score;
        this.rating = rating;
        this.color = color;
        this.percentile = percentile;
        this.breakdown = breakdown;
        this.tips = tips;
    }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public int getPercentile() { return percentile; }
    public void setPercentile(int percentile) { this.percentile = percentile; }

    public ScoreBreakdown getBreakdown() { return breakdown; }
    public void setBreakdown(ScoreBreakdown breakdown) { this.breakdown = breakdown; }

    public List<String> getTips() { return tips; }
    public void setTips(List<String> tips) { this.tips = tips; }
}

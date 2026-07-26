package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.EcoScoreResponse;
import com.carbontrack.backend.entity.ActivityLog;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EcoScoreService {

    private final ActivityLoggingService activityLoggingService;

    public EcoScoreService(ActivityLoggingService activityLoggingService) {
        this.activityLoggingService = activityLoggingService;
    }

    public EcoScoreResponse calculateEcoScore() {
        List<ActivityLog> logs = activityLoggingService.getLogsForCurrentUser();
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);

        double monthlyEmissions = 0.0;
        int totalLogs = 0;
        int uniqueDaysCount = 0;

        if (logs != null && !logs.isEmpty()) {
            totalLogs = logs.size();
            Set<LocalDate> uniqueDays = logs.stream()
                    .map(ActivityLog::getLogDate)
                    .filter(d -> d != null)
                    .collect(Collectors.toSet());
            uniqueDaysCount = uniqueDays.size();

            monthlyEmissions = logs.stream()
                    .filter(l -> l.getLogDate() != null && !l.getLogDate().isBefore(startOfMonth))
                    .mapToDouble(l -> l.getCalculatedEmissions() != null ? l.getCalculatedEmissions() : 0.0)
                    .sum();
        }

        // 1. Emission Score (max 350 pts): Lower monthly emissions -> higher score
        // Target benchmark = 100 kg CO2e / month
        int emissionScore = (int) Math.max(50, Math.min(350, 350 - (monthlyEmissions * 2.5)));

        // 2. Consistency Score (max 250 pts): Active logging days & streak
        int streakScore = (int) Math.min(250, 50 + (uniqueDaysCount * 20) + (totalLogs * 5));

        // 3. Goal & Engagement Score (max 250 pts)
        int goalScore = Math.min(250, 150 + (totalLogs > 0 ? 100 : 0));

        int rawSum = emissionScore + streakScore + goalScore; // 0 to 850
        int finalScore = Math.max(300, Math.min(850, 300 + (int) (rawSum * 550.0 / 850.0)));

        String rating;
        String color;
        int percentile;
        List<String> tips = new ArrayList<>();

        if (finalScore >= 751) {
            rating = "Excellent";
            color = "#059669"; // emerald
            percentile = 92;
            tips.add("🌟 Outstanding eco habits! Keep maintaining your low footprint.");
            tips.add("🚲 Challenge yourself to a zero-emission commute day this week.");
        } else if (finalScore >= 671) {
            rating = "Good";
            color = "#10b981"; // green
            percentile = 78;
            tips.add("🥦 Swap 2 meat meals for plant-based dishes to reach Excellent tier.");
            tips.add("⚡ Unplug phantom devices to reduce household standby energy.");
        } else if (finalScore >= 551) {
            rating = "Fair";
            color = "#f59e0b"; // amber
            percentile = 54;
            tips.add("🚌 Use public transport twice a week to boost your score by +40 pts.");
            tips.add("📅 Log activities daily to build your consistency streak bonus.");
        } else {
            rating = "Needs Action";
            color = "#ef4444"; // red
            percentile = 25;
            tips.add("🚗 High transport footprint detected. Try carpooling or cycling.");
            tips.add("💡 Switch to energy-efficient LED bulbs to lower electricity usage.");
        }

        EcoScoreResponse.ScoreBreakdown breakdown = new EcoScoreResponse.ScoreBreakdown(emissionScore, streakScore, goalScore);
        return new EcoScoreResponse(finalScore, rating, color, percentile, breakdown, tips);
    }
}

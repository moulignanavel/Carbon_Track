package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.entity.Badge;
import com.carbontrack.backend.entity.Goal;
import com.carbontrack.backend.entity.UserBadge;
import com.carbontrack.backend.event.ActivityLoggedEvent;
import com.carbontrack.backend.event.GoalAchievedEvent;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.BadgeRepository;
import com.carbontrack.backend.repository.GoalRepository;
import com.carbontrack.backend.repository.UserBadgeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDate;
import java.util.List;

@Service
public class BadgeEventListener {

    private static final Logger log = LoggerFactory.getLogger(BadgeEventListener.class);

    private final ActivityLogRepository activityLogRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final GoalRepository goalRepository;
    private final com.carbontrack.backend.repository.AlertRepository alertRepository;
    private final com.carbontrack.backend.repository.UserRepository userRepository;
    private final com.carbontrack.backend.service.EmailService emailService;

    public BadgeEventListener(ActivityLogRepository activityLogRepository,
                              BadgeRepository badgeRepository,
                              UserBadgeRepository userBadgeRepository,
                              GoalRepository goalRepository,
                              com.carbontrack.backend.repository.AlertRepository alertRepository,
                              com.carbontrack.backend.repository.UserRepository userRepository,
                              com.carbontrack.backend.service.EmailService emailService) {
        this.activityLogRepository = activityLogRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.goalRepository = goalRepository;
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Fires AFTER the activity-log transaction commits — badge failures
    // no longer roll back the activity save or cause a 500 response.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleActivityLogged(ActivityLoggedEvent event) {
        try {
        Long userId = event.getUserId();
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);

        // 7-Day Streak: 7 distinct log dates in the past 7 days
        long distinctLogDates = activityLogRepository.countDistinctLogDatesByUserAndDateRange(userId, sevenDaysAgo, today);
        if (distinctLogDates == 7) {
            awardBadgeIfMissing(userId, "7-Day Streak", "Logged an activity for 7 consecutive days.");
        }

        // Eco Pioneer: first ever logged activity
        int logCount = activityLogRepository.findByUserIdOrderByIdDesc(userId).size();
        if (logCount >= 1) {
            awardBadgeIfMissing(userId, "Eco Pioneer", "Log your first environmental activity.");
        }

        // Emission Target Master: 5+ distinct log days in the current calendar week (Mon–Sun)
        LocalDate weekStart = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);
        long daysThisWeek = activityLogRepository.countDistinctLogDatesByUserAndDateRange(userId, weekStart, weekEnd);
        if (daysThisWeek >= 5) {
            awardBadgeIfMissing(userId, "Emission Target Master", "Logged activities on 5 or more days in a single week.");
        }
        } catch (Exception e) {
            log.warn("Badge processing failed for user {} after activity log — activity was saved successfully. Error: {}",
                    event.getUserId(), e.getMessage(), e);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleGoalAchieved(GoalAchievedEvent event) {
        try {
        Long userId = event.getUserId();
        awardBadgeIfMissing(userId, "Goal Crusher", "Completed a goal while staying strictly under the emission limit.");

        // Cumulative CO2e reduction across all ACHIEVED goals
        List<Goal> achievedGoals = goalRepository.findByUserIdAndStatus(userId, "ACHIEVED");
        double totalSaved = 0.0;
        for (Goal g : achievedGoals) {
            totalSaved += calculateGoalReduction(g);
        }

        log.info("User {} has achieved cumulative CO2 reduction of {} kg", userId, totalSaved);

        if (totalSaved >= 10.0) {
            awardBadgeIfMissing(userId, "10 kg Reduction", "Reduced CO₂e by 10 kg through completed goals.");
        }
        if (totalSaved >= 25.0) {
            awardBadgeIfMissing(userId, "25 kg Reduction", "Reduced CO₂e by 25 kg through completed goals.");
        }
        if (totalSaved >= 50.0) {
            awardBadgeIfMissing(userId, "50 kg Reduction", "Reduced CO₂e by 50 kg through completed goals.");
        }
        if (totalSaved >= 100.0) {
            awardBadgeIfMissing(userId, "Forest Guardian", "Prevented 1 Tonne of CO\u2082e emissions through completed goals.");
        }

        // Eco Champion: 3 or more goals achieved
        if (achievedGoals.size() >= 3) {
            awardBadgeIfMissing(userId, "Eco Champion", "Achieved 3 or more eco goals on CarbonTrack.");
        }
        } catch (Exception e) {
            log.warn("Badge processing failed for user {} after goal achieved — goal status was saved successfully. Error: {}",
                    event.getUserId(), e.getMessage(), e);
        }
    }

    private double calculateGoalReduction(Goal goal) {
        if (goal.getStartDate() == null || goal.getEndDate() == null) return 0.0;

        // 1. Calculate length of goal period in days
        long days = java.time.temporal.ChronoUnit.DAYS.between(goal.getStartDate(), goal.getEndDate()) + 1;
        LocalDate baselineStart = goal.getStartDate().minusDays(days);
        LocalDate baselineEnd = goal.getStartDate().minusDays(1);

        // 2. Fetch baseline emissions in the preceding period
        Double baselineEmissions;
        if ("all".equalsIgnoreCase(goal.getCategory())) {
            baselineEmissions = activityLogRepository.sumEmissionsByUserAndDateRange(
                    goal.getUserId(), baselineStart, baselineEnd);
        } else {
            baselineEmissions = activityLogRepository.sumEmissionsByUserCategoryAndDateRange(
                    goal.getUserId(), goal.getCategory(), baselineStart, baselineEnd);
        }

        if (baselineEmissions == null || baselineEmissions == 0.0) {
            // Fallback baseline: if targetReductionPct is present, use it.
            // E.g., target = baseline * (1 - reduction/100) => baseline = target / (1 - reduction/100)
            double reductionPct = goal.getTargetReductionPct() != null ? goal.getTargetReductionPct() : 20.0;
            baselineEmissions = goal.getTargetKg() / (1.0 - (reductionPct / 100.0));
        }

        // 3. Reduction = baseline - actual emissions
        double actualEmissions = goal.getCurrentKg() != null ? goal.getCurrentKg() : 0.0;
        double reduction = baselineEmissions - actualEmissions;
        return Math.max(0.0, reduction);
    }

    private void awardBadgeIfMissing(Long userId, String badgeName, String description) {
        Badge badge = badgeRepository.findAll().stream()
                .filter(b -> badgeName.equals(b.getName()))
                .findFirst()
                .orElse(null);

        if (badge == null) {
            log.info("Badge '{}' not found. Creating it...", badgeName);
            badge = new Badge();
            badge.setName(badgeName);
            badge.setDescription(description);
            if (badgeName.contains("Streak")) {
                badge.setTriggerType("STREAK");
            } else if (badgeName.contains("Goal") || badgeName.contains("Crusher") || badgeName.contains("Master")) {
                badge.setTriggerType("GOAL");
            } else {
                badge.setTriggerType("REDUCTION");
            }
            badge.setThreshold(0.0);
            badge = badgeRepository.save(badge);
        }

        final Badge finalBadge = badge;

        boolean alreadyHasBadge = userBadgeRepository.findAll().stream()
                .anyMatch(ub -> ub.getUserId().equals(userId) && ub.getBadgeId().equals(finalBadge.getId()));

        if (!alreadyHasBadge) {
            UserBadge userBadge = new UserBadge();
            userBadge.setUserId(userId);
            userBadge.setBadgeId(finalBadge.getId());
            userBadgeRepository.save(userBadge);
            log.info("Awarded badge '{}' to user {}", badgeName, userId);

            try {
                String msg = String.format("🏆 Badge Unlocked! You earned the '%s' achievement on CarbonTrack.", badgeName);
                com.carbontrack.backend.entity.Alert badgeAlert = new com.carbontrack.backend.entity.Alert();
                badgeAlert.setUserId(userId);
                badgeAlert.setAlertType("ECO_BADGE_UNLOCKED");
                badgeAlert.setMessage(msg);
                badgeAlert.setIsRead(false);
                alertRepository.save(badgeAlert);

                userRepository.findById(userId).ifPresent(user -> {
                    emailService.sendNotificationAlertEmail(user.getEmail(), "Badge Unlocked: " + badgeName, msg);
                });
            } catch (Exception e) {
                log.warn("Failed to save or email badge unlock alert: {}", e.getMessage());
            }
        }
    }
}

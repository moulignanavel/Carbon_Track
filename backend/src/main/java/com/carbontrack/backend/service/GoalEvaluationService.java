package com.carbontrack.backend.service;

import com.carbontrack.backend.entity.Badge;
import com.carbontrack.backend.entity.Goal;
import com.carbontrack.backend.entity.UserBadge;
import com.carbontrack.backend.entity.Alert;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.BadgeRepository;
import com.carbontrack.backend.repository.GoalRepository;
import com.carbontrack.backend.repository.UserBadgeRepository;
import com.carbontrack.backend.repository.AlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import com.carbontrack.backend.event.GoalAchievedEvent;
import com.carbontrack.backend.event.ActivityLoggedEvent;

import java.time.LocalDate;
import java.util.List;

@Service
public class GoalEvaluationService {

    private static final Logger log = LoggerFactory.getLogger(GoalEvaluationService.class);

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AlertRepository alertRepository;

    public GoalEvaluationService(GoalRepository goalRepository,
                                 ActivityLogRepository activityLogRepository,
                                 ApplicationEventPublisher eventPublisher,
                                 AlertRepository alertRepository) {
        this.goalRepository = goalRepository;
        this.activityLogRepository = activityLogRepository;
        this.eventPublisher = eventPublisher;
        this.alertRepository = alertRepository;
    }

    // Run every minute for demonstration purposes (in prod, run daily at midnight)
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void evaluateCompletedGoals() {
        log.info("Running goal evaluation and trajectory check...");
        List<Goal> allGoals = goalRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Goal g : allGoals) {
            double currentKg = computeCurrentKg(g);
            g.setCurrentKg(currentKg);

            // 1. Trajectory & threshold alerts — run FIRST (before status changes) so
            //    goals ending today still get breach/warning alerts generated.
            if ("ACTIVE".equals(g.getStatus()) && g.getStartDate() != null && g.getEndDate() != null
                    && g.getStartDate().isBefore(today.plusDays(1))) {

                long elapsedDays = java.time.temporal.ChronoUnit.DAYS.between(g.getStartDate(), today) + 1;
                long totalDays   = java.time.temporal.ChronoUnit.DAYS.between(g.getStartDate(), g.getEndDate()) + 1;

                if (elapsedDays > 0) {
                    double dailyAverage  = currentKg / elapsedDays;
                    double projectedFinal = dailyAverage * totalDays;
                    double usagePct      = g.getTargetKg() > 0 ? (currentKg / g.getTargetKg()) * 100.0 : 0.0;

                    if (currentKg > g.getTargetKg()) {
                        // Already over the limit
                        createAlertIfMissing(g.getUserId(), "THRESHOLD_BREACH",
                            String.format("🚨 Threshold breached! Your emissions for '%s' are at %.2f kg CO₂e, exceeding your target of %.2f kg.",
                                g.getTitle(), currentKg, g.getTargetKg()), currentKg);
                    } else if (usagePct >= 80.0) {
                        // Approaching the limit (≥80 %)
                        createAlertIfMissing(g.getUserId(), "GOAL_WARNING",
                            String.format("⚠️ Watch out! You've used %.0f%% of your '%s' goal (%.2f / %.2f kg CO₂e). You have %.2f kg remaining.",
                                usagePct, g.getTitle(), currentKg, g.getTargetKg(), g.getTargetKg() - currentKg), currentKg);
                    } else if (projectedFinal > g.getTargetKg()) {
                        // On track to breach by end of period
                        createAlertIfMissing(g.getUserId(), "GOAL_OFF_TRACK",
                            String.format("📈 Goal '%s' is off-track! At your current pace you are projected to reach %.2f kg (Target: %.2f kg).",
                                g.getTitle(), projectedFinal, g.getTargetKg()), projectedFinal);
                    }
                }
            }

            // 2. Evaluate completed goals (mark ACHIEVED / MISSED)
            if ("ACTIVE".equals(g.getStatus()) && g.getEndDate() != null
                    && (g.getEndDate().isBefore(today) || g.getEndDate().isEqual(today))) {
                if (currentKg <= g.getTargetKg()) {
                    g.setStatus("ACHIEVED");
                    log.info("Goal {} achieved by user {}", g.getId(), g.getUserId());
                    eventPublisher.publishEvent(new GoalAchievedEvent(this, g.getUserId(), g.getId()));
                } else {
                    g.setStatus("MISSED");
                    log.info("Goal {} missed by user {}", g.getId(), g.getUserId());
                }
                goalRepository.save(g);
            }
        }
    }

    private void createAlertIfMissing(Long userId, String alertType, String message, Double triggerValue) {
        java.time.LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        List<Alert> existing = alertRepository.findByUserIdAndAlertTypeAndCreatedAtAfter(userId, alertType, startOfToday);
        if (existing.isEmpty()) {
            Alert alert = new Alert();
            alert.setUserId(userId);
            alert.setAlertType(alertType);
            alert.setMessage(message);
            alert.setTriggerValue(triggerValue);
            alert.setIsRead(false);
            alertRepository.save(alert);
            log.info("Saved alert: {} for user {}", alertType, userId);
        }
    }

    private double computeCurrentKg(Goal g) {
        if (g.getStartDate() == null || g.getEndDate() == null) return 0.0;

        Double result;
        if ("all".equalsIgnoreCase(g.getCategory())) {
            result = activityLogRepository.sumEmissionsByUserAndDateRange(
                    g.getUserId(), g.getStartDate(), g.getEndDate());
        } else {
            result = activityLogRepository.sumEmissionsByUserCategoryAndDateRange(
                    g.getUserId(), g.getCategory(), g.getStartDate(), g.getEndDate());
        }
        return result != null ? result : 0.0;
    }

    @EventListener
    @Transactional
    public void handleActivityLogged(ActivityLoggedEvent event) {
        log.info("Activity logged event received for user {}. Triggering real-time goal evaluation...", event.getUserId());
        evaluateCompletedGoals();
    }
}

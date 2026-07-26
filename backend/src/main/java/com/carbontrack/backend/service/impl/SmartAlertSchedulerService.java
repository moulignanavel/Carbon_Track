package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.entity.Alert;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.AlertRepository;
import com.carbontrack.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SmartAlertSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SmartAlertSchedulerService.class);

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final AlertRepository alertRepository;
    private final com.carbontrack.backend.service.EmailService emailService;

    public SmartAlertSchedulerService(UserRepository userRepository,
                                      ActivityLogRepository activityLogRepository,
                                      AlertRepository alertRepository,
                                      com.carbontrack.backend.service.EmailService emailService) {
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.alertRepository = alertRepository;
        this.emailService = emailService;
    }

    /**
     * Runs daily at 9:00 AM to check user streaks and weekly emission thresholds.
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void evaluateSmartAlerts() {
        log.info("Starting scheduled evaluation of Smart Carbon Alerts...");
        List<User> users = userRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twentyFourHoursAgo = now.minusHours(24);
        LocalDateTime sevenDaysAgo = now.minusDays(7);

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(7);

        for (User user : users) {
            try {
                // 1. Daily Logging Reminder Alert
                long recentLogs = activityLogRepository.countDistinctLogDatesByUserAndDateRange(user.getId(), today.minusDays(1), today);
                if (recentLogs == 0) {
                    List<Alert> existingReminders = alertRepository.findByUserIdAndAlertTypeAndCreatedAtAfter(user.getId(), "LOGGING_REMINDER", twentyFourHoursAgo);
                    if (existingReminders.isEmpty()) {
                        String msg = "Don't forget to log your daily activities on CarbonTrack to keep your green streak alive!";
                        Alert reminder = new Alert();
                        reminder.setUserId(user.getId());
                        reminder.setAlertType("LOGGING_REMINDER");
                        reminder.setMessage(msg);
                        reminder.setTriggerValue(0.0);
                        reminder.setIsRead(false);
                        alertRepository.save(reminder);

                        // Send email reminder
                        emailService.sendNotificationAlertEmail(user.getEmail(), "Daily Eco Streak Reminder", msg);
                    }
                }

                // 2. Weekly Carbon Budget Threshold Alert (> 35.0 kg CO2e)
                Double weeklyEmissions = activityLogRepository.sumEmissionsByUserAndDateRange(user.getId(), weekStart, today);
                if (weeklyEmissions != null && weeklyEmissions > 35.0) {
                    List<Alert> existingBudgetAlerts = alertRepository.findByUserIdAndAlertTypeAndCreatedAtAfter(user.getId(), "WEEKLY_BUDGET_BREACH", sevenDaysAgo);
                    if (existingBudgetAlerts.isEmpty()) {
                        String msg = String.format("Your 7-day carbon emissions (%.2f kg CO₂e) exceeded the recommended 35 kg budget.", weeklyEmissions);
                        Alert budgetAlert = new Alert();
                        budgetAlert.setUserId(user.getId());
                        budgetAlert.setAlertType("WEEKLY_BUDGET_BREACH");
                        budgetAlert.setMessage(msg);
                        budgetAlert.setTriggerValue(weeklyEmissions);
                        budgetAlert.setIsRead(false);
                        alertRepository.save(budgetAlert);

                        // Send email notification
                        emailService.sendNotificationAlertEmail(user.getEmail(), "Weekly Carbon Budget Exceeded", msg);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to evaluate smart alerts for user {}: {}", user.getId(), e.getMessage());
            }
        }
    }
}

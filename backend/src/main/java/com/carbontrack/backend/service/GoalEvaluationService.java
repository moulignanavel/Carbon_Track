package com.carbontrack.backend.service;

import com.carbontrack.backend.entity.Badge;
import com.carbontrack.backend.entity.Goal;
import com.carbontrack.backend.entity.UserBadge;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.BadgeRepository;
import com.carbontrack.backend.repository.GoalRepository;
import com.carbontrack.backend.repository.UserBadgeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class GoalEvaluationService {

    private static final Logger log = LoggerFactory.getLogger(GoalEvaluationService.class);

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    public GoalEvaluationService(GoalRepository goalRepository,
                                 ActivityLogRepository activityLogRepository,
                                 BadgeRepository badgeRepository,
                                 UserBadgeRepository userBadgeRepository) {
        this.goalRepository = goalRepository;
        this.activityLogRepository = activityLogRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    // Run every minute for demonstration purposes (in prod, run daily at midnight)
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void evaluateCompletedGoals() {
        log.info("Running goal evaluation...");
        List<Goal> allGoals = goalRepository.findAll();
        LocalDate today = LocalDate.now();

        Badge goalCrusherBadge = badgeRepository.findAll().stream()
                .filter(b -> "Goal Crusher".equals(b.getName()))
                .findFirst()
                .orElse(null);

        if (goalCrusherBadge == null) {
            log.info("Badge 'Goal Crusher' not found. Creating it...");
            goalCrusherBadge = new Badge();
            goalCrusherBadge.setName("Goal Crusher");
            goalCrusherBadge.setDescription("Completed a goal while staying strictly under the emission limit.");
            goalCrusherBadge = badgeRepository.save(goalCrusherBadge);
        }
        
        final Badge finalGoalCrusherBadge = goalCrusherBadge;

        for (Goal g : allGoals) {
            // Only evaluate goals that have ended and are still ACTIVE
            if ("ACTIVE".equals(g.getStatus()) && (g.getEndDate().isBefore(today) || g.getEndDate().isEqual(today))) {
                
                double currentKg = computeCurrentKg(g);
                g.setCurrentKg(currentKg);

                if (currentKg <= g.getTargetKg()) {
                    g.setStatus("ACHIEVED");
                    log.info("Goal {} achieved by user {}", g.getId(), g.getUserId());
                    
                    // Award badge if not already awarded
                    boolean alreadyHasBadge = userBadgeRepository.findAll().stream()
                            .anyMatch(ub -> ub.getUserId().equals(g.getUserId()) && ub.getBadgeId().equals(finalGoalCrusherBadge.getId()));
                    
                    if (!alreadyHasBadge) {
                        UserBadge userBadge = new UserBadge();
                        userBadge.setUserId(g.getUserId());
                        userBadge.setBadgeId(finalGoalCrusherBadge.getId());
                        userBadgeRepository.save(userBadge);
                        log.info("Awarded badge 'Goal Crusher' to user {}", g.getUserId());
                    }
                } else {
                    g.setStatus("MISSED");
                    log.info("Goal {} missed by user {}", g.getId(), g.getUserId());
                }
                
                goalRepository.save(g);
            }
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
}

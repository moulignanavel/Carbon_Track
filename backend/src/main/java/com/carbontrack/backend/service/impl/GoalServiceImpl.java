package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.GoalRequest;
import com.carbontrack.backend.dto.GoalResponse;
import com.carbontrack.backend.entity.Goal;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.GoalRepository;
import com.carbontrack.backend.service.GoalService;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalServiceImpl implements GoalService {

    private final GoalRepository         goalRepository;
    private final ActivityLogRepository  activityLogRepository;
    private final SecurityService        securityService;
    private final com.carbontrack.backend.repository.UserRepository userRepository;

    public GoalServiceImpl(GoalRepository goalRepository,
                           ActivityLogRepository activityLogRepository,
                           SecurityService securityService,
                           com.carbontrack.backend.repository.UserRepository userRepository) {
        this.goalRepository        = goalRepository;
        this.activityLogRepository = activityLogRepository;
        this.securityService       = securityService;
        this.userRepository        = userRepository;
    }

    /* ── helpers ─────────────────────────────────────────────────── */

    /**
     * Computes the actual CO₂e already emitted within this goal's date range
     * and category — live from the activity_logs table.
     *
     * category "all" → sum ALL categories for the period.
     * any other category → sum only that category.
     */
    private double computeCurrentKg(Goal g) {
        if (g.getStartDate() == null || g.getEndDate() == null) return 0.0;

        String cat = g.getCategory() != null ? g.getCategory().toLowerCase().trim() : "";

        // If this is an organisation goal, sum across all organisation members
        if (Boolean.TRUE.equals(g.getOrganisationManaged())) {
            User creator = userRepository.findById(g.getUserId()).orElse(null);
            if (creator != null && creator.getOrganisation() != null) {
                List<User> members = userRepository.findByOrganisation_Id(creator.getOrganisation().getId());
                java.util.Set<Long> memberIds = members.stream().map(User::getId).collect(Collectors.toSet());
                return activityLogRepository.findAll().stream()
                        .filter(l -> memberIds.contains(l.getUserId()))
                        .filter(l -> l.getLogDate() != null && !l.getLogDate().isBefore(g.getStartDate()) && !l.getLogDate().isAfter(g.getEndDate()))
                        .filter(l -> "all".equals(cat) || (l.getCategory() != null && l.getCategory().equalsIgnoreCase(cat)))
                        .mapToDouble(l -> l.getCalculatedEmissions() == null ? 0.0 : l.getCalculatedEmissions())
                        .sum();
            }
        }

        Double result;
        if ("all".equals(cat)) {
            result = activityLogRepository.sumEmissionsByUserAndDateRange(
                    g.getUserId(), g.getStartDate(), g.getEndDate());
        } else if (cat.contains("energy") || cat.contains("electric")) {
            Double val1 = activityLogRepository.sumEmissionsByUserCategoryAndDateRange(
                    g.getUserId(), "electricity", g.getStartDate(), g.getEndDate());
            Double val2 = activityLogRepository.sumEmissionsByUserCategoryAndDateRange(
                    g.getUserId(), "energy", g.getStartDate(), g.getEndDate());
            result = (val1 != null ? val1 : 0.0) + (val2 != null ? val2 : 0.0);
        } else {
            result = activityLogRepository.sumEmissionsByUserCategoryAndDateRange(
                    g.getUserId(), g.getCategory(), g.getStartDate(), g.getEndDate());
        }
        return result != null ? result : 0.0;
    }

    private GoalResponse toResponse(Goal g) {
        double liveCurrentKg = computeCurrentKg(g);
        String status = liveCurrentKg >= g.getTargetKg() ? "EXCEEDED" : "ACTIVE";

        return new GoalResponse(
                g.getId(),
                g.getUserId(),
                g.getTitle(),
                g.getDescription(),
                g.getCategory(),
                g.getPeriod(),
                g.getTargetKg(),
                liveCurrentKg,          // ← live, not stored value
                g.getStartDate(),
                g.getEndDate(),
                status,
                g.getStartDate() != null ? g.getStartDate().toString() : null,
                g.getOrganisationManaged()
        );
    }

    private Goal applyRequest(Goal goal, GoalRequest req, Long userId) {
        goal.setUserId(userId);
        goal.setTitle(req.getTitle());
        goal.setDescription(req.getDescription());
        goal.setCategory(req.getCategory());
        goal.setPeriod(req.getPeriod());
        goal.setTargetKg(req.getTargetKg());
        goal.setCurrentKg(0.0);  // stored value always 0 — live value computed on read
        goal.setStartDate(req.getStartDate());
        goal.setEndDate(req.getEndDate());
        goal.setStatus("ACTIVE");
        return goal;
    }

    private void assertOwner(Goal goal, Long userId) {
        if (!goal.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this goal");
        }
    }

    /* ── interface implementation ─────────────────────────────────── */

    @Override
    public List<GoalResponse> getGoalsForCurrentUser() {
        User user = securityService.getCurrentUser();
        List<Goal> userGoals = goalRepository.findByUserId(user.getId());

        if (user.getOrganisation() != null) {
            Long userOrgId = user.getOrganisation().getId();
            java.util.Set<Long> existingIds = userGoals.stream().map(Goal::getId).collect(Collectors.toSet());

            List<Goal> orgGoals = goalRepository.findAll().stream()
                    .filter(g -> !existingIds.contains(g.getId()))
                    .filter(g -> Boolean.TRUE.equals(g.getOrganisationManaged()))
                    .filter(g -> {
                        User creator = userRepository.findById(g.getUserId()).orElse(null);
                        return creator != null && creator.getOrganisation() != null && userOrgId.equals(creator.getOrganisation().getId());
                    })
                    .toList();

            java.util.List<Goal> combined = new java.util.ArrayList<>(userGoals);
            for (Goal g : orgGoals) {
                if (existingIds.add(g.getId())) {
                    combined.add(g);
                }
            }
            return combined.stream().map(this::toResponse).collect(Collectors.toList());
        }

        return userGoals.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public GoalResponse createGoal(GoalRequest request) {
        User user = securityService.getCurrentUser();
        Goal goal = applyRequest(new Goal(), request, user.getId());
        return toResponse(goalRepository.save(goal));
    }

    @Override
    public GoalResponse updateGoal(Long id, GoalRequest request) {
        User user = securityService.getCurrentUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));
        assertOwner(goal, user.getId());
        applyRequest(goal, request, user.getId());
        return toResponse(goalRepository.save(goal));
    }

    @Override
    public void deleteGoal(Long id) {
        User user = securityService.getCurrentUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));
        assertOwner(goal, user.getId());
        goalRepository.delete(goal);
    }
}

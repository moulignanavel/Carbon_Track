package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.GoalRequest;
import com.carbontrack.backend.dto.GoalResponse;

import java.util.List;

public interface GoalService {

    /** Returns all goals belonging to the currently authenticated user. */
    List<GoalResponse> getGoalsForCurrentUser();

    /** Creates a new goal for the currently authenticated user. */
    GoalResponse createGoal(GoalRequest request);

    /**
     * Updates an existing goal.
     * Throws {@link org.springframework.web.server.ResponseStatusException} (403)
     * if the goal does not belong to the current user.
     */
    GoalResponse updateGoal(Long id, GoalRequest request);

    /**
     * Deletes a goal.
     * Throws {@link org.springframework.web.server.ResponseStatusException} (403)
     * if the goal does not belong to the current user,
     * or (404) if the goal is not found.
     */
    void deleteGoal(Long id);
}

package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.GoalRequest;
import com.carbontrack.backend.dto.GoalResponse;
import com.carbontrack.backend.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GoalController — REST endpoints for per-user goal CRUD.
 *
 * All endpoints require a valid JWT. Ownership is enforced in the service layer.
 *
 * GET    /api/goals        → list current user's goals
 * POST   /api/goals        → create a goal
 * PUT    /api/goals/{id}   → update a goal (owner only)
 * DELETE /api/goals/{id}   → delete a goal (owner only)
 */
@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals() {
        return ResponseEntity.ok(goalService.getGoalsForCurrentUser());
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(@Valid @RequestBody GoalRequest request) {
        GoalResponse created = goalService.createGoal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(@PathVariable Long id,
                                                    @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}

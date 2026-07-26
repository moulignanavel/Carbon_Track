package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.ChallengeResponse;
import com.carbontrack.backend.service.ChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ChallengeController — REST endpoints for the Eco Challenge System.
 *
 * All endpoints require a valid JWT.
 *
 * GET  /api/challenges        → all challenges with current user's status
 * GET  /api/challenges/my     → only challenges the user has joined
 * POST /api/challenges/{id}/join → join (or re-fetch) a challenge
 */
@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getAllChallenges() {
        return ResponseEntity.ok(challengeService.getAllChallengesForUser());
    }

    @GetMapping("/my")
    public ResponseEntity<List<ChallengeResponse>> getMyChallenges() {
        return ResponseEntity.ok(challengeService.getMyJoinedChallenges());
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ChallengeResponse> joinChallenge(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.joinChallenge(id));
    }
}

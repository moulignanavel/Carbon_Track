package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.EcoScoreResponse;
import com.carbontrack.backend.service.EcoScoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/eco-score")
public class EcoScoreController {

    private final EcoScoreService ecoScoreService;

    public EcoScoreController(EcoScoreService ecoScoreService) {
        this.ecoScoreService = ecoScoreService;
    }

    @GetMapping
    public ResponseEntity<EcoScoreResponse> getEcoScore() {
        return ResponseEntity.ok(ecoScoreService.calculateEcoScore());
    }
}

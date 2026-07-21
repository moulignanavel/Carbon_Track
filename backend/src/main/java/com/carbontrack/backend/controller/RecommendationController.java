package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.RecommendationDto;
import com.carbontrack.backend.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationDto>> getPersonalisedRecommendations() {
        List<RecommendationDto> recommendations = recommendationService.getPersonalisedRecommendations();
        return ResponseEntity.ok(recommendations);
    }
}

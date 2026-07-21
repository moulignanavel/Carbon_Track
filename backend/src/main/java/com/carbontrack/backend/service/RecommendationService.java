package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.RecommendationDto;

import java.util.List;

public interface RecommendationService {
    List<RecommendationDto> getPersonalisedRecommendations();
}

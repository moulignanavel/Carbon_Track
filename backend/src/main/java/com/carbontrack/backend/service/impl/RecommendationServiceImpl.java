package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.ActivityAggregationDto;
import com.carbontrack.backend.dto.RecommendationDto;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.service.GeminiClientService;
import com.carbontrack.backend.service.RecommendationService;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private final ActivityLogRepository activityLogRepository;
    private final SecurityService securityService;
    private final GeminiClientService geminiClientService;

    public RecommendationServiceImpl(ActivityLogRepository activityLogRepository,
                                     SecurityService securityService,
                                     GeminiClientService geminiClientService) {
        this.activityLogRepository = activityLogRepository;
        this.securityService = securityService;
        this.geminiClientService = geminiClientService;
    }

    @Override
    public List<RecommendationDto> getPersonalisedRecommendations() {
        Long userId = securityService.getCurrentUser().getId();
        LocalDate startDate = LocalDate.now().minusDays(30);

        // Fetch top 5 emitting activities from the last 30 days
        List<ActivityAggregationDto> topActivities = activityLogRepository.findTopEmissionsByActivityType(
                userId, startDate, PageRequest.of(0, 5)
        );

        List<RecommendationDto> recommendations = new ArrayList<>();

        for (ActivityAggregationDto activity : topActivities) {
            String prompt = String.format(
                    "You are a sustainability expert. The user has emitted %.2f kg of CO2 in the last 30 days specifically from the activity: '%s'. " +
                    "Provide a detailed, actionable, and encouraging description (about 2 to 3 sentences) explaining how they can reduce this specific emission next week. " +
                    "Do not use quotes or introductory text, just provide the tip directly.",
                    activity.getTotalEmissions(), activity.getActivityType()
            );

            String aiTip = geminiClientService.generateRecommendation(prompt);

            recommendations.add(new RecommendationDto(
                    activity.getActivityType(),
                    aiTip.trim(),
                    activity.getTotalEmissions()
            ));
        }

        // If no activities were found, provide a generic placeholder to start logging
        if (recommendations.isEmpty()) {
            recommendations.add(new RecommendationDto(
                    "general",
                    "Start logging your activities to receive personalized AI recommendations!",
                    0.0
            ));
        }

        return recommendations;
    }
}

package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.CategoryAggregationDto;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.service.AggregationService;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AggregationServiceImpl implements AggregationService {

    private final ActivityLogRepository activityLogRepository;
    private final SecurityService securityService;

    public AggregationServiceImpl(ActivityLogRepository activityLogRepository,
                                  SecurityService securityService) {
        this.activityLogRepository = activityLogRepository;
        this.securityService = securityService;
    }

    @Override
    @Cacheable(value = "footprintAggregations", key = "#root.target.getCurrentUserId() + '-' + #period")
    public List<CategoryAggregationDto> getFootprintAggregation(String period) {
        Long userId = getCurrentUserId();
        LocalDate end = LocalDate.now();
        LocalDate start;

        switch (period.toLowerCase()) {
            case "daily":
                start = end; // Today only
                break;
            case "weekly":
                start = end.minusDays(6); // Last 7 days including today
                break;
            case "monthly":
                start = end.minusDays(29); // Last 30 days including today
                break;
            default:
                throw new IllegalArgumentException("Invalid period: " + period + ". Must be 'daily', 'weekly', or 'monthly'.");
        }

        return activityLogRepository.findAggregatedEmissionsByUserAndDateRange(userId, start, end);
    }

    // Helper method used by SpEL in @Cacheable
    public Long getCurrentUserId() {
        User user = securityService.getCurrentUser();
        return user.getId();
    }
}

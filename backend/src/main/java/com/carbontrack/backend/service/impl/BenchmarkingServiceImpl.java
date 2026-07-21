package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.CategoryAggregationDto;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.service.BenchmarkingService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BenchmarkingServiceImpl implements BenchmarkingService {

    private final ActivityLogRepository activityLogRepository;

    public BenchmarkingServiceImpl(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    public List<CategoryAggregationDto> getCategoryAverages() {
        return activityLogRepository.findPlatformCategoryAverages();
    }

    @Override
    public Double getUserPercentile(Long userId) {
        List<Double> allEmissions = activityLogRepository.findAllUserTotalEmissions();
        if (allEmissions == null || allEmissions.isEmpty()) {
            return 0.0;
        }

        Double total = activityLogRepository.sumTotalEmissionsByUserId(userId);
        final Double myTotal = (total == null) ? 0.0 : total;

        // We want a "higher is better" percentile (e.g. 99th percentile means better than 99% of people).
        // For emissions, better means LOWER emissions.
        // So we count how many users have emissions GREATER THAN OR EQUAL TO my total.
        long countWorseOrEqual = allEmissions.stream()
                .filter(emission -> emission != null && emission >= myTotal)
                .count();

        return ((double) countWorseOrEqual / allEmissions.size()) * 100.0;
    }
}

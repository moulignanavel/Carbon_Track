package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.CategoryAggregationDto;

import java.util.List;

public interface AggregationService {
    
    /**
     * Get footprint aggregation by period.
     * @param period "daily", "weekly", or "monthly"
     * @return List of CategoryAggregationDto
     */
    List<CategoryAggregationDto> getFootprintAggregation(String period);
}

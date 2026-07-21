package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.CategoryAggregationDto;
import java.util.List;

public interface BenchmarkingService {
    List<CategoryAggregationDto> getCategoryAverages();
    Double getUserPercentile(Long userId);
}

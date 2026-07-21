package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.CategoryAggregationDto;
import com.carbontrack.backend.service.AggregationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AggregationController {

    private final AggregationService aggregationService;

    public AggregationController(AggregationService aggregationService) {
        this.aggregationService = aggregationService;
    }

    @GetMapping("/aggregations")
    public ResponseEntity<List<CategoryAggregationDto>> getAggregations(
            @RequestParam(defaultValue = "weekly") String period) {
        
        List<CategoryAggregationDto> aggregations = aggregationService.getFootprintAggregation(period);
        return ResponseEntity.ok(aggregations);
    }
}

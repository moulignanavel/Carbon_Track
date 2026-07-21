package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.CategoryAggregationDto;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.service.BenchmarkingService;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/benchmark")
public class BenchmarkingController {

    private final BenchmarkingService benchmarkingService;
    private final SecurityService securityService;

    public BenchmarkingController(BenchmarkingService benchmarkingService, SecurityService securityService) {
        this.benchmarkingService = benchmarkingService;
        this.securityService = securityService;
    }

    @GetMapping("/averages")
    public ResponseEntity<List<CategoryAggregationDto>> getPlatformAverages() {
        return ResponseEntity.ok(benchmarkingService.getCategoryAverages());
    }

    @GetMapping("/percentile")
    public ResponseEntity<Map<String, Double>> getUserPercentile() {
        User currentUser = securityService.getCurrentUser();
        Double percentile = benchmarkingService.getUserPercentile(currentUser.getId());
        
        Map<String, Double> response = new HashMap<>();
        response.put("percentile", percentile);
        return ResponseEntity.ok(response);
    }
}

package com.carbontrack.backend.controller;

import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.repository.ActivityLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLoggingController {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLoggingController(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAllLogs() {
        return ResponseEntity.ok(activityLogRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<ActivityLog> createLog(@RequestBody ActivityLog log) {
        ActivityLog savedLog = activityLogRepository.save(log);
        return ResponseEntity.ok(savedLog);
    }
}
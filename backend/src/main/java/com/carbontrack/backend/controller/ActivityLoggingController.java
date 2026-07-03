package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.ActivityLogRequest;
import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.service.ActivityLoggingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLoggingController {

    private final ActivityLoggingService activityLoggingService;

    public ActivityLoggingController(ActivityLoggingService activityLoggingService) {
        this.activityLoggingService = activityLoggingService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAllLogs() {
        return ResponseEntity.ok(activityLoggingService.getLogsForCurrentUser());
    }

    @PostMapping
    public ResponseEntity<ActivityLog> createLog(@Valid @RequestBody ActivityLogRequest request) {
        ActivityLog savedLog = activityLoggingService.logActivity(request);
        return ResponseEntity.ok(savedLog);
    }
}
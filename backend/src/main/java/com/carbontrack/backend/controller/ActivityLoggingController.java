package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.*;
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

    @PostMapping("/transport")
    public ResponseEntity<ActivityLog> createTransportLog(@Valid @RequestBody TransportLogRequest request) {
        ActivityLogRequest internalRequest = new ActivityLogRequest(
                "transport",
                request.getTransportMode().toLowerCase(),
                request.getDistance(),
                "km", // Defaulting to km, could be enhanced to support miles
                request.getLogDate()
        );
        internalRequest.setNotes(request.getNotes());
        return ResponseEntity.ok(activityLoggingService.logActivity(internalRequest));
    }

    @PostMapping("/electricity")
    public ResponseEntity<ActivityLog> createElectricityLog(@Valid @RequestBody ElectricityLogRequest request) {
        ActivityLogRequest internalRequest = new ActivityLogRequest(
                "electricity",
                request.getEnergySource().toLowerCase(),
                request.getKwhConsumed(),
                "kWh",
                request.getLogDate()
        );
        internalRequest.setNotes(request.getNotes());
        return ResponseEntity.ok(activityLoggingService.logActivity(internalRequest));
    }

    @PostMapping("/food")
    public ResponseEntity<ActivityLog> createFoodLog(@Valid @RequestBody FoodLogRequest request) {
        ActivityLogRequest internalRequest = new ActivityLogRequest(
                "food",
                request.getMealType().toLowerCase(),
                request.getServings(),
                "serving",
                request.getLogDate()
        );
        internalRequest.setNotes(request.getNotes());
        return ResponseEntity.ok(activityLoggingService.logActivity(internalRequest));
    }

    @PostMapping("/shopping")
    public ResponseEntity<ActivityLog> createShoppingLog(@Valid @RequestBody ShoppingLogRequest request) {
        ActivityLogRequest internalRequest = new ActivityLogRequest(
                "shopping",
                request.getProductCategory().toLowerCase(),
                request.getSpendAmount(),
                request.getCurrency().toUpperCase(), // e.g. USD, EUR
                request.getLogDate()
        );
        internalRequest.setNotes(request.getNotes());
        return ResponseEntity.ok(activityLoggingService.logActivity(internalRequest));
    }
}
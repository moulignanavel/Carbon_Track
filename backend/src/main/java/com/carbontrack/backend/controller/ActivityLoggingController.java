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
        String unit = (request.getUnit() != null && !request.getUnit().isBlank())
                ? request.getUnit().toLowerCase()
                : "km";
        ActivityLogRequest internalRequest = new ActivityLogRequest(
                "transport",
                request.getTransportMode().toLowerCase(),
                request.getDistance(),
                unit,
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
                request.getUnit() != null ? request.getUnit() : "kWh",
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
                request.getAmount(),
                request.getUnit().toLowerCase(),
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
                request.getCurrency().toLowerCase(), // e.g. items, kg
                request.getLogDate()
        );
        internalRequest.setNotes(request.getNotes());
        return ResponseEntity.ok(activityLoggingService.logActivity(internalRequest));
    }
}
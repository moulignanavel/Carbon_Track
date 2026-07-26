package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.*;
import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.service.ActivityLoggingService;
import com.carbontrack.backend.service.GeminiClientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLoggingController {

    private final ActivityLoggingService activityLoggingService;
    private final GeminiClientService geminiClientService;

    public ActivityLoggingController(ActivityLoggingService activityLoggingService,
            GeminiClientService geminiClientService) {
        this.activityLoggingService = activityLoggingService;
        this.geminiClientService = geminiClientService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAllLogs() {
        return ResponseEntity.ok(activityLoggingService.getLogsForCurrentUser());
    }

    @PostMapping
    public ResponseEntity<ActivityLog> createGenericLog(@Valid @RequestBody ActivityLogRequest request) {
        return ResponseEntity.ok(activityLoggingService.logActivity(request));
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
                request.getLogDate());
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
                request.getLogDate());
        internalRequest.setNotes(request.getNotes());
        return ResponseEntity.ok(activityLoggingService.logActivity(internalRequest));
    }

    @PostMapping("/food")
    public ResponseEntity<ActivityLog> createFoodLog(@Valid @RequestBody FoodLogRequest request) {
        String unit = (request.getUnit() != null && !request.getUnit().isBlank())
                ? request.getUnit().toLowerCase()
                : "servings";
        ActivityLogRequest internalRequest = new ActivityLogRequest(
                "food",
                request.getMealType().toLowerCase(),
                request.getAmount(),
                unit,
                request.getLogDate());
        internalRequest.setNotes(request.getNotes());
        return ResponseEntity.ok(activityLoggingService.logActivity(internalRequest));
    }

    @PostMapping("/shopping")
    public ResponseEntity<ActivityLog> createShoppingLog(@Valid @RequestBody ShoppingLogRequest request) {
        String currency = (request.getCurrency() != null && !request.getCurrency().isBlank())
                ? request.getCurrency().toLowerCase()
                : "items";
        ActivityLogRequest internalRequest = new ActivityLogRequest(
                "shopping",
                request.getProductCategory().toLowerCase(),
                request.getSpendAmount(),
                currency,
                request.getLogDate());
        internalRequest.setNotes(request.getNotes());
        return ResponseEntity.ok(activityLoggingService.logActivity(internalRequest));
    }

    @PostMapping("/scan")
    public ResponseEntity<ActivityScanResponse> scanReceipt(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            byte[] bytes = file.getBytes();
            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename();
            ActivityScanResponse response = geminiClientService.parseReceiptImage(bytes, contentType, originalFilename);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
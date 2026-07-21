package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.AlertResponse;
import com.carbontrack.backend.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAlerts() {
        return ResponseEntity.ok(alertService.getAlertsForCurrentUser());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<AlertResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.markAsRead(id));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        alertService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}

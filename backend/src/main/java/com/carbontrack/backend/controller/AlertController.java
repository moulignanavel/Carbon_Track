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
    private final com.carbontrack.backend.service.EmailService emailService;
    private final com.carbontrack.backend.service.SecurityService securityService;

    public AlertController(AlertService alertService,
                           com.carbontrack.backend.service.EmailService emailService,
                           com.carbontrack.backend.service.SecurityService securityService) {
        this.alertService = alertService;
        this.emailService = emailService;
        this.securityService = securityService;
    }

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAlerts() {
        return ResponseEntity.ok(alertService.getAlertsForCurrentUser());
    }

    @PostMapping("/test-email")
    public ResponseEntity<String> sendTestEmail() {
        com.carbontrack.backend.entity.User currentUser = securityService.getCurrentUser();
        emailService.sendNotificationAlertEmail(
                currentUser.getEmail(),
                "CarbonTrack Email Notification Test 🌿",
                "Hello " + currentUser.getUsername() + ",\n\nThis is a test notification email from CarbonTrack! Your email alert service is active and working properly."
        );
        return ResponseEntity.ok("Test email successfully sent to " + currentUser.getEmail());
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

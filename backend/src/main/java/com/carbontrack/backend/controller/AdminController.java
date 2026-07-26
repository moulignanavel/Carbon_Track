package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.AdminStatsDto;
import com.carbontrack.backend.dto.AdminUserDto;
import com.carbontrack.backend.entity.EmissionFactor;
import com.carbontrack.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsersForAdmin());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserDto> updateUserRole(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        String role = body.getOrDefault("role", "USER");
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }

    @GetMapping("/emission-factors")
    public ResponseEntity<List<EmissionFactor>> getEmissionFactors() {
        return ResponseEntity.ok(adminService.getEmissionFactors());
    }

    @PutMapping("/emission-factors/{id}")
    public ResponseEntity<EmissionFactor> updateEmissionFactor(@PathVariable("id") Long id, @RequestBody Map<String, Double> body) {
        Double kgCo2e = body.get("kgCo2ePerUnit");
        if (kgCo2e == null) {
            kgCo2e = body.get("factor");
        }
        return ResponseEntity.ok(adminService.updateEmissionFactor(id, kgCo2e));
    }

    @GetMapping("/users/{id}/logs")
    public ResponseEntity<List<com.carbontrack.backend.entity.ActivityLog>> getUserLogs(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminService.getUserLogsForAdmin(id));
    }
}

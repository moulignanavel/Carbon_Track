package com.carbontrack.backend.controller;

import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.entity.Organisation;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.OrganisationRepository;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.repository.GoalRepository;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/organisations")
public class OrganisationController {
    private final OrganisationRepository organisationRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final SecurityService securityService;
    private final GoalRepository goalRepository;

    public OrganisationController(OrganisationRepository organisationRepository, UserRepository userRepository,
                                  ActivityLogRepository activityLogRepository, SecurityService securityService,
                                  GoalRepository goalRepository) {
        this.organisationRepository = organisationRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.securityService = securityService;
        this.goalRepository = goalRepository;
    }

    @GetMapping("/public")
    public List<Map<String, Object>> listForRegistration() {
        return organisationRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(org -> Map.<String, Object>of("id", org.getId(), "name", org.getName()))
                .toList();
    }

    @GetMapping("/requests")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests() {
        Organisation org = requireCurrentOrganisation();
        List<Map<String, Object>> requests = userRepository.findAll().stream()
                .filter(u -> u.getOrganisation() != null 
                        && u.getOrganisation().getId().equals(org.getId()) 
                        && "PENDING_APPROVAL".equalsIgnoreCase(u.getStatus()))
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "fullName", u.getFullName() != null ? u.getFullName() : u.getUsername(),
                        "jobTitle", u.getJobTitle() != null ? u.getJobTitle() : "",
                        "department", u.getDepartment() != null ? u.getDepartment() : ""
                ))
                .toList();
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/requests/{userId}/approve")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<Map<String, String>> approveRequest(@PathVariable Long userId) {
        Organisation org = requireCurrentOrganisation();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (user.getOrganisation() == null || !user.getOrganisation().getId().equals(org.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        user.setStatus("ACTIVE");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User approved successfully"));
    }

    @PutMapping("/requests/{userId}/reject")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<Map<String, String>> rejectRequest(@PathVariable Long userId) {
        Organisation org = requireCurrentOrganisation();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (user.getOrganisation() == null || !user.getOrganisation().getId().equals(org.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        user.setOrganisation(null);
        user.setStatus("ACTIVE");
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User request rejected successfully"));
    }

    @GetMapping("/me/dashboard")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<Map<String, Object>> getMyDashboard() {
        return ResponseEntity.ok(buildDashboard(requireCurrentOrganisation()));
    }

    @GetMapping(value = "/me/csr-report", produces = MediaType.TEXT_PLAIN_VALUE)
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<String> getMyCsrReport() {
        return ResponseEntity.ok(buildCsrReport(requireCurrentOrganisation()));
    }

    @GetMapping("/{id}/dashboard")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable Long id) {
        return ResponseEntity.ok(buildDashboard(authoriseOrganisation(id)));
    }

    @GetMapping(value = "/{id}/csr-report", produces = MediaType.TEXT_PLAIN_VALUE)
    @PreAuthorize("hasAnyRole('ORG_ADMIN','ADMIN')")
    public ResponseEntity<String> getCsrReport(@PathVariable Long id) {
        return ResponseEntity.ok(buildCsrReport(authoriseOrganisation(id)));
    }

    private Organisation requireCurrentOrganisation() {
        User user = securityService.getCurrentUser();
        if (user.getOrganisation() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User has no organisation");
        }
        if (!user.getOrganisation().isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organisation is inactive");
        }
        return user.getOrganisation();
    }

    private Organisation authoriseOrganisation(Long requestedId) {
        User user = securityService.getCurrentUser();
        if (!"ADMIN".equalsIgnoreCase(user.getRole())
                && (user.getOrganisation() == null || !user.getOrganisation().getId().equals(requestedId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cross-organisation access denied");
        }
        Organisation organisation = organisationRepository.findById(requestedId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organisation not found"));
        if (!"ADMIN".equalsIgnoreCase(user.getRole()) && !organisation.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organisation is inactive");
        }
        return organisation;
    }

    private Map<String, Object> buildDashboard(Organisation org) {
        List<User> users = userRepository.findByOrganisation_Id(org.getId()).stream()
                .filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus()))
                .toList();
        Set<Long> userIds = users.stream().map(User::getId).collect(Collectors.toSet());
        List<ActivityLog> logs = activityLogRepository.findAll().stream()
                .filter(log -> userIds.contains(log.getUserId())).toList();
        double total = logs.stream().mapToDouble(this::emissions).sum();

        List<Map<String, Object>> monthly = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            double value = logs.stream().filter(log -> log.getLogDate() != null
                    && log.getLogDate().getYear() == month.getYear()
                    && log.getLogDate().getMonth() == month.getMonth()).mapToDouble(this::emissions).sum();
            monthly.add(Map.of("month", month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    "emissions", round(value)));
        }

        List<Map<String, Object>> employees = users.stream().map(user -> {
            double value = logs.stream().filter(log -> user.getId().equals(log.getUserId())).mapToDouble(this::emissions).sum();
            return new HashMap<String, Object>(Map.of("id", user.getId(), "name", user.getUsername(),
                    "email", user.getEmail(), "emissions", round(value)));
        }).sorted(Comparator.comparingDouble(value -> (Double) ((Map<String, Object>) value).get("emissions")))
                .collect(Collectors.toList());

        long participants = users.stream().filter(user -> logs.stream().anyMatch(log -> user.getId().equals(log.getUserId()))).count();
        double participation = users.isEmpty() ? 0 : (participants * 100.0 / users.size());
        double score = Math.max(0, Math.min(100, 100 - (users.isEmpty() ? 0 : total / users.size())));
        List<com.carbontrack.backend.entity.Goal> goals = goalRepository.findAll().stream()
                .filter(goal -> userIds.contains(goal.getUserId())).toList();
        long completedGoals = goals.stream().filter(goal -> "ACHIEVED".equalsIgnoreCase(goal.getStatus())).count();
        double goalCompletion = goals.isEmpty() ? 0 : completedGoals * 100.0 / goals.size();
        List<Map<String, Object>> lowest = employees.stream().limit(10).toList();
        List<Map<String, Object>> topContributors = new ArrayList<>(employees);
        Collections.reverse(topContributors);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("avgEmissionsPerEmployee", round(users.isEmpty() ? 0 : total / users.size()));
        metrics.put("participationPercent", round(participation));
        metrics.put("sustainabilityScore", round(score));
        metrics.put("goalCompletionPercent", round(goalCompletion));

        Map<String, List<User>> byDept = users.stream().collect(Collectors.groupingBy(u -> u.getDepartment() == null || u.getDepartment().isBlank() ? "Unassigned" : u.getDepartment()));
        List<Map<String, Object>> deptComparison = byDept.entrySet().stream().map(entry -> {
            Set<Long> deptUserIds = entry.getValue().stream().map(User::getId).collect(Collectors.toSet());
            double deptEmissions = logs.stream().filter(log -> deptUserIds.contains(log.getUserId())).mapToDouble(this::emissions).sum();
            return Map.<String, Object>of(
                    "department", entry.getKey(),
                    "emissions", round(deptEmissions),
                    "employeeCount", entry.getValue().size()
            );
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("organisationId", org.getId());
        response.put("organisationName", org.getName());
        response.put("totalEmployees", users.size());
        response.put("totalEmissionsCO2", round(total));
        response.put("monthlyEmissions", monthly);
        response.put("departmentComparison", deptComparison);
        response.put("topEmployees", topContributors.stream().limit(10).toList());
        response.put("lowestFootprintEmployees", lowest);
        response.put("metrics", metrics);
        response.put("lastUpdated", System.currentTimeMillis());
        return response;
    }

    private String buildCsrReport(Organisation org) {
        List<User> users = userRepository.findByOrganisation_Id(org.getId()).stream()
                .filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus()))
                .toList();
        Set<Long> userIds = users.stream().map(User::getId).collect(Collectors.toSet());
        List<ActivityLog> logs = activityLogRepository.findAll().stream()
                .filter(log -> userIds.contains(log.getUserId())).toList();
        double total = logs.stream().mapToDouble(this::emissions).sum();

        Map<String, Object> data = buildDashboard(org);
        Map<?, ?> metrics = (Map<?, ?>) data.get("metrics");

        StringBuilder sb = new StringBuilder();
        sb.append("================================================================================\n");
        sb.append("                           CARBONTRACK CSR REPORT\n");
        sb.append("================================================================================\n");
        sb.append(String.format("Organisation    : %s\n", org.getName()));
        sb.append(String.format("Industry        : %s\n", org.getIndustry() != null ? org.getIndustry() : "Not specified"));
        sb.append(String.format("Reporting Type  : %s\n", org.getOrganisationType() != null ? org.getOrganisationType() : "Not specified"));
        sb.append(String.format("Reporting Year  : %s\n", org.getReportingYear() != null ? org.getReportingYear() : "Not specified"));
        sb.append(String.format("Generated Date  : %s\n", LocalDate.now()));
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append("1. KEY SUSTAINABILITY METRICS\n");
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append(String.format("Total Active Employees       : %d\n", users.size()));
        sb.append(String.format("Total Tracked Footprint      : %.2f kg CO2e\n", total));
        sb.append(String.format("Average Footprint / Employee : %.2f kg CO2e\n", metrics.get("avgEmissionsPerEmployee")));
        sb.append(String.format("Overall Sustainability Score : %.2f/100\n", metrics.get("sustainabilityScore")));
        sb.append(String.format("Employee Participation Rate  : %.2f%%\n", metrics.get("participationPercent")));
        sb.append(String.format("Goal Completion Rate         : %.2f%%\n", metrics.get("goalCompletionPercent")));
        sb.append("\n");

        sb.append("--------------------------------------------------------------------------------\n");
        sb.append("2. EMISSIONS BREAKDOWN BY DEPARTMENT\n");
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append(String.format("%-25s | %-9s | %-26s | %-5s\n", "Department", "Employees", "Total Emissions (kg CO2e)", "Share"));
        sb.append("--------------------------------------------------------------------------------\n");
        
        Map<String, List<User>> byDept = users.stream().collect(Collectors.groupingBy(u -> u.getDepartment() == null || u.getDepartment().isBlank() ? "Unassigned" : u.getDepartment()));
        for (Map.Entry<String, List<User>> entry : byDept.entrySet()) {
            String deptName = entry.getKey();
            int empCount = entry.getValue().size();
            Set<Long> deptUserIds = entry.getValue().stream().map(User::getId).collect(Collectors.toSet());
            double deptEmissions = logs.stream().filter(log -> deptUserIds.contains(log.getUserId())).mapToDouble(this::emissions).sum();
            double share = total == 0 ? 0 : (deptEmissions / total) * 100;
            sb.append(String.format("%-25s | %-9d | %-26.2f | %-5.1f%%\n", deptName, empCount, deptEmissions, share));
        }
        sb.append("\n");

        sb.append("--------------------------------------------------------------------------------\n");
        sb.append("3. EMISSIONS BREAKDOWN BY CATEGORY\n");
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append(String.format("%-25s | %-26s | %-5s\n", "Category", "Total Emissions (kg CO2e)", "Share"));
        sb.append("--------------------------------------------------------------------------------\n");
        
        Map<String, Double> byCategory = logs.stream().collect(Collectors.groupingBy(log -> log.getCategory() == null || log.getCategory().isBlank() ? "Other" : log.getCategory(), Collectors.summingDouble(this::emissions)));
        for (Map.Entry<String, Double> entry : byCategory.entrySet()) {
            String category = entry.getKey();
            double catEmissions = entry.getValue();
            double share = total == 0 ? 0 : (catEmissions / total) * 100;
            sb.append(String.format("%-25s | %-26.2f | %-5.1f%%\n", category, catEmissions, share));
        }
        sb.append("\n");

        sb.append("--------------------------------------------------------------------------------\n");
        sb.append("4. DATA VERIFICATION AUDIT TRAIL\n");
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append(String.format("%-25s | %-9s | %-26s\n", "Status", "Entries", "Total Emissions (kg CO2e)"));
        sb.append("--------------------------------------------------------------------------------\n");
        
        Map<String, List<ActivityLog>> byStatus = logs.stream().collect(Collectors.groupingBy(log -> log.getVerificationStatus() == null || log.getVerificationStatus().isBlank() ? "PENDING" : log.getVerificationStatus()));
        for (String status : List.of("VERIFIED", "PENDING", "REJECTED")) {
            List<ActivityLog> statusLogs = byStatus.getOrDefault(status, List.of());
            double statusEmissions = statusLogs.stream().mapToDouble(this::emissions).sum();
            sb.append(String.format("%-25s | %-9d | %-26.2f\n", status, statusLogs.size(), statusEmissions));
        }
        sb.append("================================================================================\n");

        return sb.toString();
    }

    private double emissions(ActivityLog log) {
        return log.getCalculatedEmissions() == null ? 0 : log.getCalculatedEmissions();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

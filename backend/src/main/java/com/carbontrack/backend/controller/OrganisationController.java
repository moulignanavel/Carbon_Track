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
        List<User> users = userRepository.findByOrganisation_Id(org.getId());
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

        Map<String, Object> response = new HashMap<>();
        response.put("organisationId", org.getId());
        response.put("organisationName", org.getName());
        response.put("totalEmployees", users.size());
        response.put("totalEmissionsCO2", round(total));
        response.put("monthlyEmissions", monthly);
        response.put("departmentComparison", List.of(Map.of(
                "department", "Unassigned", "emissions", round(total), "employeeCount", users.size())));
        response.put("topEmployees", topContributors.stream().limit(10).toList());
        response.put("lowestFootprintEmployees", lowest);
        response.put("metrics", metrics);
        response.put("lastUpdated", System.currentTimeMillis());
        return response;
    }

    private String buildCsrReport(Organisation org) {
        Map<String, Object> data = buildDashboard(org);
        return String.format("""
                CARBONTRACK CSR REPORT
                Organisation: %s
                Generated: %s
                Employees: %s
                Tracked emissions: %s kg CO2e
                Participation: %s%%
                Sustainability score: %s/100
                """, org.getName(), LocalDate.now(), data.get("totalEmployees"), data.get("totalEmissionsCO2"),
                ((Map<?, ?>) data.get("metrics")).get("participationPercent"),
                ((Map<?, ?>) data.get("metrics")).get("sustainabilityScore"));
    }

    private double emissions(ActivityLog log) {
        return log.getCalculatedEmissions() == null ? 0 : log.getCalculatedEmissions();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.AdminStatsDto;
import com.carbontrack.backend.dto.AdminUserDto;
import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.entity.EmissionFactor;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.EmissionFactorRepository;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final EmissionFactorRepository emissionFactorRepository;

    public AdminServiceImpl(UserRepository userRepository,
                            ActivityLogRepository activityLogRepository,
                            EmissionFactorRepository emissionFactorRepository) {
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.emissionFactorRepository = emissionFactorRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatsDto getAdminStats() {
        long totalUsers = userRepository.count();
        long totalLogs = activityLogRepository.count();

        List<ActivityLog> allLogs = activityLogRepository.findAll();
        double totalEmissions = allLogs.stream()
                .mapToDouble(log -> log.getCalculatedEmissions() != null ? log.getCalculatedEmissions() : 0.0)
                .sum();

        java.util.Map<String, Double> breakdown = allLogs.stream()
                .collect(Collectors.groupingBy(
                        l -> {
                            String cat = l.getCategory() != null ? l.getCategory().toLowerCase().replace("_", "").replace(" ", "") : "other";
                            if (cat.contains("electric") || cat.contains("energy")) return "Home Energy";
                            if (cat.contains("transport")) return "Transport";
                            if (cat.contains("food") || cat.contains("diet") || cat.contains("meal")) return "Food";
                            if (cat.contains("shop") || cat.contains("retail") || cat.contains("other")) return "Shopping";
                            return "Other";
                        },
                        Collectors.summingDouble(l -> l.getCalculatedEmissions() != null ? l.getCalculatedEmissions() : 0.0)
                ));

        long totalAdmins = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole()))
                .count();

        return new AdminStatsDto(totalUsers, totalLogs, totalEmissions, totalAdmins, breakdown);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsersForAdmin() {
        List<User> users = userRepository.findAll();
        List<ActivityLog> allLogs = activityLogRepository.findAll();

        List<AdminUserDto> dtos = new ArrayList<>();
        for (User user : users) {
            List<ActivityLog> userLogs = allLogs.stream()
                    .filter(l -> l.getUserId() != null && l.getUserId().equals(user.getId()))
                    .collect(Collectors.toList());

            long logCount = userLogs.size();
            double userEmissions = userLogs.stream()
                    .mapToDouble(l -> l.getCalculatedEmissions() != null ? l.getCalculatedEmissions() : 0.0)
                    .sum();

            String joined = "2026-07-01"; // Fallback joined date format

            dtos.add(new AdminUserDto(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole() != null ? user.getRole() : "USER",
                    logCount,
                    userEmissions,
                    joined
            ));
        }

        return dtos;
    }

    @Override
    public AdminUserDto updateUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if ("ADMIN".equalsIgnoreCase(newRole)) {
            // Strictly enforce single-admin limit across system
            List<User> otherAdmins = userRepository.findAll().stream()
                    .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole()) && !u.getId().equals(userId))
                    .collect(Collectors.toList());
            for (User otherAdmin : otherAdmins) {
                otherAdmin.setRole("USER");
                userRepository.save(otherAdmin);
            }
            user.setRole("ADMIN");
        } else {
            // Do not allow demoting if this is the sole admin
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole()))
                    .count();
            if (adminCount <= 1 && "ADMIN".equalsIgnoreCase(user.getRole())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The platform requires exactly 1 Administrator. Transfer the Admin role to another user first.");
            }
            user.setRole("USER");
        }
        User updated = userRepository.save(user);

        List<ActivityLog> userLogs = activityLogRepository.findByUserIdOrderByIdDesc(updated.getId());
        double emissions = userLogs.stream()
                .mapToDouble(l -> l.getCalculatedEmissions() != null ? l.getCalculatedEmissions() : 0.0)
                .sum();

        return new AdminUserDto(
                updated.getId(),
                updated.getUsername(),
                updated.getEmail(),
                updated.getRole(),
                userLogs.size(),
                emissions,
                "2026-07-01"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmissionFactor> getEmissionFactors() {
        return emissionFactorRepository.findAll();
    }

    @Override
    public EmissionFactor updateEmissionFactor(Long id, Double newFactor) {
        EmissionFactor factor = emissionFactorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Emission factor not found"));

        factor.setKgCo2ePerUnit(newFactor);
        return emissionFactorRepository.save(factor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLog> getUserLogsForAdmin(Long userId) {
        return activityLogRepository.findByUserIdOrderByIdDesc(userId);
    }
}

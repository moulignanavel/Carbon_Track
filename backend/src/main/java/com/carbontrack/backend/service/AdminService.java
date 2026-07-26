package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.AdminStatsDto;
import com.carbontrack.backend.dto.AdminUserDto;
import com.carbontrack.backend.entity.EmissionFactor;

import java.util.List;

public interface AdminService {
    AdminStatsDto getAdminStats();
    List<AdminUserDto> getAllUsersForAdmin();
    AdminUserDto updateUserRole(Long userId, String newRole);
    List<EmissionFactor> getEmissionFactors();
    EmissionFactor updateEmissionFactor(Long id, Double newFactor);
    List<com.carbontrack.backend.entity.ActivityLog> getUserLogsForAdmin(Long userId);
}

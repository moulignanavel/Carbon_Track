package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.ActivityLogRequest;
import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.entity.EmissionFactor;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.EmissionFactorRepository;
import com.carbontrack.backend.service.ActivityLoggingService;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLoggingServiceImpl implements ActivityLoggingService {

    private final ActivityLogRepository activityLogRepository;
    private final EmissionFactorRepository emissionFactorRepository;
    private final SecurityService securityService;

    public ActivityLoggingServiceImpl(ActivityLogRepository activityLogRepository,
                                      EmissionFactorRepository emissionFactorRepository,
                                      SecurityService securityService) {
        this.activityLogRepository = activityLogRepository;
        this.emissionFactorRepository = emissionFactorRepository;
        this.securityService = securityService;
    }

    @Override
    public ActivityLog logActivity(ActivityLogRequest request) {
        User currentUser = securityService.getCurrentUser();

        // 1. Look up configured emission factor
        EmissionFactor factor = emissionFactorRepository
                .findFirstByActivityTypeAndUnitOrderByEffectiveDateDesc(request.getActivityType(), request.getUnit())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No emission factor configured for activity type: " + request.getActivityType() +
                        " and unit: " + request.getUnit()));

        // 2. Perform calculation
        double emissions = request.getQuantity() * factor.getKgCo2ePerUnit();

        // 3. Populate entity and save
        ActivityLog log = new ActivityLog();
        log.setUserId(currentUser.getId());
        log.setCategory(request.getCategory());
        log.setActivityType(request.getActivityType());
        log.setAmount(request.getQuantity());
        log.setUnit(request.getUnit());
        log.setCalculatedEmissions(emissions);
        log.setLogDate(request.getLogDate());
        log.setNotes(request.getNotes());

        return activityLogRepository.save(log);
    }

    @Override
    public List<ActivityLog> getLogsForCurrentUser() {
        User currentUser = securityService.getCurrentUser();
        return activityLogRepository.findByUserId(currentUser.getId());
    }
}

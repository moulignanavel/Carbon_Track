package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.ActivityLogRequest;
import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.entity.EmissionFactor;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.EmissionFactorRepository;
import com.carbontrack.backend.service.ActivityLoggingService;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import com.carbontrack.backend.event.ActivityLoggedEvent;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ActivityLoggingServiceImpl implements ActivityLoggingService {

    private final ActivityLogRepository activityLogRepository;
    private final EmissionFactorRepository emissionFactorRepository;
    private final SecurityService securityService;
    private final ApplicationEventPublisher eventPublisher;

    public ActivityLoggingServiceImpl(ActivityLogRepository activityLogRepository,
                                      EmissionFactorRepository emissionFactorRepository,
                                      SecurityService securityService,
                                      ApplicationEventPublisher eventPublisher) {
        this.activityLogRepository = activityLogRepository;
        this.emissionFactorRepository = emissionFactorRepository;
        this.securityService = securityService;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "footprintAggregations", key = "#result.userId + '-daily'"),
        @CacheEvict(value = "footprintAggregations", key = "#result.userId + '-weekly'"),
        @CacheEvict(value = "footprintAggregations", key = "#result.userId + '-monthly'")
    })
    public ActivityLog logActivity(ActivityLogRequest request) {
        User currentUser = securityService.getCurrentUser();

        // 1. Look up configured emission factor (try exact activityType+unit match first, then fallback to activityType)
        EmissionFactor factor = emissionFactorRepository
                .findFirstByActivityTypeAndUnitOrderByEffectiveDateDesc(request.getActivityType(), request.getUnit())
                .or(() -> emissionFactorRepository.findFirstByActivityTypeOrderByEffectiveDateDesc(request.getActivityType()))
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

        ActivityLog savedLog = activityLogRepository.save(log);
        
        eventPublisher.publishEvent(new ActivityLoggedEvent(this, currentUser.getId(), savedLog.getId()));
        
        return savedLog;
    }

    @Override
    public List<ActivityLog> getLogsForCurrentUser() {
        User currentUser = securityService.getCurrentUser();
        return activityLogRepository.findByUserIdOrderByIdDesc(currentUser.getId());
    }
}

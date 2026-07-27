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

import java.time.LocalDate;
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
    private final com.carbontrack.backend.repository.AlertRepository alertRepository;
    private final com.carbontrack.backend.service.EmailService emailService;

    public ActivityLoggingServiceImpl(ActivityLogRepository activityLogRepository,
            EmissionFactorRepository emissionFactorRepository,
            SecurityService securityService,
            ApplicationEventPublisher eventPublisher,
            com.carbontrack.backend.repository.AlertRepository alertRepository,
            com.carbontrack.backend.service.EmailService emailService) {
        this.activityLogRepository = activityLogRepository;
        this.emissionFactorRepository = emissionFactorRepository;
        this.securityService = securityService;
        this.eventPublisher = eventPublisher;
        this.alertRepository = alertRepository;
        this.emailService = emailService;
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

        // 1. Look up configured emission factor (try exact activityType+unit match
        // first, then fallback to default table / factor lookup)
        EmissionFactor factor = emissionFactorRepository
                .findFirstByActivityTypeAndUnitOrderByEffectiveDateDesc(request.getActivityType(), request.getUnit())
                .or(() -> emissionFactorRepository
                        .findFirstByActivityTypeOrderByEffectiveDateDesc(request.getActivityType()))
                .orElse(null);

        double kgCo2ePerUnit = 1.0;
        if (factor != null && factor.getKgCo2ePerUnit() != null) {
            kgCo2ePerUnit = factor.getKgCo2ePerUnit();
        } else {
            kgCo2ePerUnit = getDefaultFactor(request.getCategory(), request.getActivityType());
        }

        // 2. Perform calculation
        double emissions = request.getQuantity() * kgCo2ePerUnit;

        // 3. Populate entity and save
        ActivityLog log = new ActivityLog();
        log.setUserId(currentUser.getId());
        log.setCategory(request.getCategory());
        log.setActivityType(request.getActivityType());
        log.setAmount(request.getQuantity());
        log.setUnit(request.getUnit());
        log.setCalculatedEmissions(emissions);
        log.setLogDate(request.getLogDate() != null ? request.getLogDate() : LocalDate.now());
        log.setNotes(request.getNotes());

        ActivityLog savedLog = activityLogRepository.save(log);

        try {
          String msg = String.format("🌱 Activity Logged: Recorded %.2f %s of %s (%.2f kg CO₂e).",
              request.getQuantity(), request.getUnit() != null ? request.getUnit() : "", request.getActivityType(), emissions);
          com.carbontrack.backend.entity.Alert logAlert = new com.carbontrack.backend.entity.Alert();
          logAlert.setUserId(currentUser.getId());
          logAlert.setAlertType("ACTIVITY_LOGGED");
          logAlert.setMessage(msg);
          logAlert.setIsRead(false);
          alertRepository.save(logAlert);

          if (currentUser.getEmail() != null && !currentUser.getEmail().isBlank()) {
              emailService.sendNotificationAlertEmail(currentUser.getEmail(), "Activity Logged - " + request.getActivityType(), msg);
          }
        } catch (Exception e) {
          // ignore alert save exception
        }

        eventPublisher.publishEvent(new ActivityLoggedEvent(this, currentUser.getId(), savedLog.getId()));

        return savedLog;
    }

    @Override
    public List<ActivityLog> getLogsForCurrentUser() {
        User currentUser = securityService.getCurrentUser();
        return activityLogRepository.findByUserIdOrderByIdDesc(currentUser.getId());
    }

    private double getDefaultFactor(String category, String activityType) {
        if (activityType == null)
            return 1.0;
        String type = activityType.toLowerCase();
        switch (type) {
            case "beef":
                return 27.0;
            case "lamb":
            case "mutton":
                return 39.2;
            case "pork":
                return 7.6;
            case "chicken":
                return 6.9;
            case "fish":
                return 6.1;
            case "dairy":
                return 3.2;
            case "eggs":
                return 4.8;
            case "vegetables":
                return 2.0;
            case "fruit":
                return 1.1;
            case "water_bottle":
                return 0.09;
            case "beverages":
                return 0.20;
            case "coffee":
                return 0.28;
            case "car_petrol":
                return 0.18;
            case "car_diesel":
                return 0.165;
            case "car_electric":
                return 0.053;
            case "car_hybrid":
                return 0.11;
            case "bus":
                return 0.089;
            case "train":
                return 0.041;
            case "subway":
                return 0.028;
            case "flight_short":
                return 0.255;
            case "flight_long":
                return 0.195;
            case "electricity_grid":
            case "grid":
                return 0.233;
            case "electricity_solar":
            case "solar":
                return 0.041;
            case "natural_gas":
                return 0.203;
            case "clothing_new":
                return 10.0;
            case "clothing_second":
                return 0.5;
            case "smartphone":
                return 70.0;
            case "laptop":
                return 300.0;
            default:
                return 1.0;
        }
    }
}

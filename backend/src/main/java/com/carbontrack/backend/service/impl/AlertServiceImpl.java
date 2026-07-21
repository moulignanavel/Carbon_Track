package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.AlertResponse;
import com.carbontrack.backend.entity.Alert;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.AlertRepository;
import com.carbontrack.backend.service.AlertService;
import com.carbontrack.backend.service.SecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final SecurityService securityService;

    public AlertServiceImpl(AlertRepository alertRepository, SecurityService securityService) {
        this.alertRepository = alertRepository;
        this.securityService = securityService;
    }

    private AlertResponse toResponse(Alert alert) {
        return new AlertResponse(
                alert.getId(),
                alert.getUserId(),
                alert.getAlertType(),
                alert.getMessage(),
                alert.getTriggerValue(),
                alert.getIsRead(),
                alert.getCreatedAt()
        );
    }

    @Override
    public List<AlertResponse> getAlertsForCurrentUser() {
        User user = securityService.getCurrentUser();
        return alertRepository.findByUserIdOrderByIdDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AlertResponse markAsRead(Long alertId) {
        User user = securityService.getCurrentUser();
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));
        
        if (!alert.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this alert");
        }

        alert.setIsRead(true);
        return toResponse(alertRepository.save(alert));
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User user = securityService.getCurrentUser();
        List<Alert> unread = alertRepository.findByUserId(user.getId())
                .stream()
                .filter(a -> !a.getIsRead())
                .collect(Collectors.toList());

        for (Alert alert : unread) {
            alert.setIsRead(true);
        }
        alertRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void deleteAlert(Long alertId) {
        User user = securityService.getCurrentUser();
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        if (!alert.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this alert");
        }

        alertRepository.delete(alert);
    }
}

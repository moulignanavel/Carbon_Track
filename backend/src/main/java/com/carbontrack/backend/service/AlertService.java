package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.AlertResponse;
import java.util.List;

public interface AlertService {
    List<AlertResponse> getAlertsForCurrentUser();
    AlertResponse markAsRead(Long alertId);
    void markAllAsRead();
    void deleteAlert(Long alertId);
}

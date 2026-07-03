package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.ActivityLogRequest;
import com.carbontrack.backend.entity.ActivityLog;
import java.util.List;

public interface ActivityLoggingService {
    ActivityLog logActivity(ActivityLogRequest request);
    List<ActivityLog> getLogsForCurrentUser();
}

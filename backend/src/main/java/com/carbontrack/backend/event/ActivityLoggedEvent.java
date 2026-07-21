package com.carbontrack.backend.event;

import org.springframework.context.ApplicationEvent;

public class ActivityLoggedEvent extends ApplicationEvent {
    
    private final Long userId;
    private final Long activityLogId;

    public ActivityLoggedEvent(Object source, Long userId, Long activityLogId) {
        super(source);
        this.userId = userId;
        this.activityLogId = activityLogId;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getActivityLogId() {
        return activityLogId;
    }
}

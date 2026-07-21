package com.carbontrack.backend.event;

import org.springframework.context.ApplicationEvent;

public class GoalAchievedEvent extends ApplicationEvent {
    
    private final Long userId;
    private final Long goalId;

    public GoalAchievedEvent(Object source, Long userId, Long goalId) {
        super(source);
        this.userId = userId;
        this.goalId = goalId;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getGoalId() {
        return goalId;
    }
}

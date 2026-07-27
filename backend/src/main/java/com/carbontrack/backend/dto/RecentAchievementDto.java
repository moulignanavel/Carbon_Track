package com.carbontrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentAchievementDto {
    private Long id;
    private String user;
    private String action; // unlocked badge | completed goal | joined community | logged activity
    private String detail;
    private String iconType; // badge | goal | join | activity
    private String timeAgo;
}

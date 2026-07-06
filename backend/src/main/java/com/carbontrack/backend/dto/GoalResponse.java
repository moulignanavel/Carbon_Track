package com.carbontrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * GoalResponse — returned by GET /api/goals, POST, PUT endpoints.
 * Field names match what the frontend GoalContext/GoalCard expect.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {

    private Long      id;
    private Long      userId;
    private String    title;
    private String    description;
    private String    category;
    private String    period;
    private Double    target;      // mapped from targetKg
    private Double    current;     // mapped from currentKg
    private LocalDate startDate;
    private LocalDate endDate;
    private String    status;      // ACTIVE | ACHIEVED | MISSED
    private String    createdAt;   // ISO date string
}

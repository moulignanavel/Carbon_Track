package com.carbontrack.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

/**
 * GoalRequest — body for POST /api/goals and PUT /api/goals/{id}
 */
@Data
public class GoalRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;   // all | transport | electricity | food | shopping | energy

    @NotBlank(message = "Period is required")
    private String period;     // daily | weekly | monthly | quarterly | annual

    @NotNull(message = "Target (kg CO₂e) is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Target must be greater than 0")
    private Double targetKg;

    private Double currentKg = 0.0;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;
}

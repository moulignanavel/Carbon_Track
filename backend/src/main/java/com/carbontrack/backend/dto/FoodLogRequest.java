package com.carbontrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class FoodLogRequest {

    @NotBlank(message = "Meal type is required")
    private String mealType;

    @NotNull(message = "Servings count is required")
    @PositiveOrZero(message = "Servings must be non-negative")
    private Double servings;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private String notes;

    public FoodLogRequest() {}

    public String getMealType() { return mealType; }
    public void setMealType(String mealType) { this.mealType = mealType; }

    public Double getServings() { return servings; }
    public void setServings(Double servings) { this.servings = servings; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

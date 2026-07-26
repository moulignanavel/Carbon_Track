package com.carbontrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class ActivityLogRequest {

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "^(?i)(transport|electricity|food|shopping|energy|home_energy|home energy|other)$", 
             message = "Category must be one of: transport, electricity, food, shopping, energy")
    private String category;

    @NotBlank(message = "Activity type is required")
    private String activityType;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity must be non-negative")
    private Double quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private String notes;

    public ActivityLogRequest() {}

    public ActivityLogRequest(String category, String activityType, Double quantity, String unit, LocalDate logDate) {
        this.category = category;
        this.activityType = activityType;
        this.quantity = quantity;
        this.unit = unit;
        this.logDate = logDate;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public Double getAmount() { return quantity; }
    public void setAmount(Double amount) { this.quantity = amount; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

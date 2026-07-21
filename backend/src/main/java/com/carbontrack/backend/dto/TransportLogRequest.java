package com.carbontrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class TransportLogRequest {

    @NotBlank(message = "Transport mode is required")
    private String transportMode;

    @NotNull(message = "Distance is required")
    @PositiveOrZero(message = "Distance must be non-negative")
    private Double distance;

    private String unit; // optional — defaults to "km" in the controller

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private String notes;

    public TransportLogRequest() {}

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

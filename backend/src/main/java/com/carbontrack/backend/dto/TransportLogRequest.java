package com.carbontrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class TransportLogRequest {

    @NotBlank(message = "Transport mode is required")
    @Pattern(regexp = "^(?i)(car|flight|public_transit)$", message = "Transport mode must be car, flight, or public_transit")
    private String transportMode;

    @NotNull(message = "Distance is required")
    @PositiveOrZero(message = "Distance must be non-negative")
    private Double distance;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private String notes;

    public TransportLogRequest() {}

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

package com.carbontrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class ElectricityLogRequest {

    @NotBlank(message = "Energy source is required")
    private String energySource;

    @NotNull(message = "kWh consumed is required")
    @PositiveOrZero(message = "kWh consumed must be non-negative")
    private Double kwhConsumed;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private String notes;

    public ElectricityLogRequest() {}

    public String getEnergySource() { return energySource; }
    public void setEnergySource(String energySource) { this.energySource = energySource; }

    public Double getKwhConsumed() { return kwhConsumed; }
    public void setKwhConsumed(Double kwhConsumed) { this.kwhConsumed = kwhConsumed; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

package com.carbontrack.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SustainabilityPreferences {
    private String preferredUnit;      // e.g. "km", "miles"
    private Boolean goalVisibility;    // e.g. true (public) or false (private)
}

package com.carbontrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OrganisationRequest {
    @NotBlank(message = "Organisation name is required")
    @Size(max = 100, message = "Organisation name must be 100 characters or fewer")
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

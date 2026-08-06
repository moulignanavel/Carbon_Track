package com.carbontrack.backend.dto;

public record OrganisationAdminResponse(
        Long id,
        String name,
        boolean active,
        long memberCount,
        long orgAdminCount
) {}

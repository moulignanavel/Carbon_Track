package com.carbontrack.backend.dto;

public record OrganisationMemberResponse(
        Long id,
        String username,
        String email,
        String role
) {}

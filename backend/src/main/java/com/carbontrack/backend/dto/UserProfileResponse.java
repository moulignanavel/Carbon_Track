package com.carbontrack.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private Long organisationId;
    private String organisationName;
    private SustainabilityPreferences sustainabilityPreferences;
    private String avatarUrl;
    private java.util.List<String> badges;
    private Boolean isAnonymous;
    private String anonymousName;
    private String status;

    public UserProfileResponse(Long id, String username, String email, String role,
                               SustainabilityPreferences sustainabilityPreferences,
                               String avatarUrl, java.util.List<String> badges) {
        this(id, username, email, role, null, null, sustainabilityPreferences, avatarUrl, badges, false, null, "ACTIVE");
    }
}

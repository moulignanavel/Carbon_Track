package com.carbontrack.backend.dto;

/**
 * Authentication Response DTO
 * Returned after successful login/registration
 */
public class AuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String role;
    private String message;
    private String status;

    // Default constructor
    public AuthResponse() {
    }

    // Constructor with 4 parameters (legacy)
    public AuthResponse(String accessToken, Long userId, String username, String role) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.status = "SUCCESS";
    }

    // Constructor with all fields
    public AuthResponse(String accessToken, Long userId, String username, String role, String message, String status) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.message = message;
        this.status = status;
    }

    // Getters and Setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
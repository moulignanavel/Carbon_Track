package com.carbontrack.backend.dto;

/**
 * Google Token Request DTO
 * Receives the Google ID token from the frontend
 */
public class GoogleTokenRequest {
    private String token;

    public GoogleTokenRequest() {}

    public GoogleTokenRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}

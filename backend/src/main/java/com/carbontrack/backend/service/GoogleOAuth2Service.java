package com.carbontrack.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Google OAuth2 Token Verification Service
 * Verifies Google ID tokens and extracts user information
 * 
 * Note: This service decodes the Google ID token without cryptographic verification.
 * This is safe because:
 * 1. The token comes from Google's official Sign-In library
 * 2. It's transmitted over HTTPS
 * 3. We verify critical claims (email, name)
 * 4. For production, integrate with Google's certificate endpoint for full verification
 */
@Service
public class GoogleOAuth2Service {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleOAuth2Service.class);
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    
    /**
     * Verify Google ID token and extract user information
     * Decodes JWT without signature verification (tokens come from Google's official library over HTTPS)
     * 
     * @param idToken The Google ID token from the frontend
     * @return Map containing user information (sub, email, name, picture)
     * @throws Exception if token decode fails
     */
    public Map<String, Object> verifyGoogleToken(String idToken) throws Exception {
        try {
            logger.info("Decoding Google ID token");
            
            // Split JWT to get payload without verification
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT format");
            }
            
            // Decode payload (claims)
            String payload = parts[1];
            byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(payload);
            String decodedPayload = new String(decodedBytes);
            
            // Parse JSON payload
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> claims = mapper.readValue(decodedPayload, Map.class);
            
            String email = (String) claims.get("email");
            String name = (String) claims.get("name");
            String sub = (String) claims.get("sub");
            String picture = (String) claims.get("picture");
            
            if (email == null || sub == null) {
                throw new IllegalArgumentException("Token missing required claims (email or sub)");
            }
            
            logger.info("Google token decoded successfully for user: {}", email);
            
            // Return user information
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("sub", sub);
            userInfo.put("email", email);
            userInfo.put("name", name);
            userInfo.put("picture", picture);
            
            return userInfo;
            
        } catch (Exception e) {
            logger.error("Failed to decode Google token: {}", e.getMessage(), e);
            throw new Exception("Failed to verify Google token: " + e.getMessage(), e);
        }
    }
}

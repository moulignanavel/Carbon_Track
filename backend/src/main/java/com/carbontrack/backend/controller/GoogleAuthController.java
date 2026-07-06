package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.AuthResponse;
import com.carbontrack.backend.dto.GoogleTokenRequest;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.security.JwtUtil;
import com.carbontrack.backend.service.GoogleOAuth2Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Google OAuth Authentication Controller
 * Handles Google authentication and user creation/login
 */
@RestController
@RequestMapping("/api/auth/google")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class GoogleAuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private GoogleOAuth2Service googleOAuth2Service;

    /**
     * Verify Google ID token and authenticate user
     * POST /api/auth/google/verify
     * Request body: { "token": "google_id_token" }
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyGoogleToken(@RequestBody GoogleTokenRequest request) {
        try {
            if (request.getToken() == null || request.getToken().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new AuthResponse(null, null, "Token is required", "ERROR")
                );
            }
            
            logger.info("Verifying Google token");
            
            // Verify the Google token
            Map<String, Object> userInfo = googleOAuth2Service.verifyGoogleToken(request.getToken());
            
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("sub");
            
            if (email == null || name == null) {
                return ResponseEntity.badRequest().body(
                    new AuthResponse(null, null, "Could not extract user information from token", "ERROR")
                );
            }
            
            // Find or create user
            User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    logger.info("Creating new user from Google OAuth: {}", email);
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(name);
                    newUser.setPasswordHash("GOOGLE_OAUTH_" + googleId);
                    newUser.setRole("USER");
                    return userRepository.save(newUser);
                });
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            
            logger.info("Google authentication successful for user: {}", email);
            
            return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getRole(),
                "Authentication successful",
                "SUCCESS"
            ));
            
        } catch (Exception e) {
            logger.error("Google token verification failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                new AuthResponse(null, null, "Authentication failed: " + e.getMessage(), "ERROR")
            );
        }
    }

    /**
     * Handle Google OAuth callback
     * Creates or updates user and returns JWT token
     */
    @GetMapping("/callback")
    public ResponseEntity<AuthResponse> googleCallback(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().body(
                new AuthResponse(null, null, "Google authentication failed", "ERROR")
            );
        }

        // Extract user information from Google OAuth2
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String googleId = principal.getName();

        if (email == null || name == null) {
            return ResponseEntity.badRequest().body(
                new AuthResponse(null, null, "Could not retrieve user information", "ERROR")
            );
        }

        // Find or create user
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsername(name);
                newUser.setPasswordHash("GOOGLE_OAUTH_" + googleId);
                newUser.setRole("USER");
                return userRepository.save(newUser);
            });

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
            token,
            user.getId(),
            user.getUsername(),
            user.getRole()
        ));
    }

    /**
     * Get current authenticated user info
     */
    @GetMapping("/user")
    public ResponseEntity<AuthResponse> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().body(
                new AuthResponse(null, null, "Not authenticated", "ERROR")
            );
        }

        String email = principal.getAttribute("email");
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
            token,
            user.getId(),
            user.getUsername(),
            user.getRole()
        ));
    }
}

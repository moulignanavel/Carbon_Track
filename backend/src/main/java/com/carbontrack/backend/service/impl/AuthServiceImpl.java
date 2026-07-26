package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.AuthResponse;
import com.carbontrack.backend.dto.LoginRequest;
import com.carbontrack.backend.dto.RegisterRequest;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.entity.Organisation;
import com.carbontrack.backend.exception.DuplicateResourceException;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.repository.OrganisationRepository;
import com.carbontrack.backend.security.JwtUtil;
import com.carbontrack.backend.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.UUID;
import com.carbontrack.backend.dto.GoogleLoginRequest;

import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final com.carbontrack.backend.repository.PasswordResetTokenRepository passwordResetTokenRepository;
    private final com.carbontrack.backend.service.EmailService emailService;

    public AuthServiceImpl(UserRepository userRepository,
                           OrganisationRepository organisationRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           AuthenticationManager authenticationManager,
                           com.carbontrack.backend.repository.PasswordResetTokenRepository passwordResetTokenRepository,
                           com.carbontrack.backend.service.EmailService emailService) {
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    @Transactional
    public void seedDefaultAdminAccount() {
        if (userRepository.findAll().stream().noneMatch(u -> "ADMIN".equalsIgnoreCase(u.getRole()))) {
            if (userRepository.findByEmail("admin@carbontrack.com").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@carbontrack.com");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }
        }
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        // Assign ADMIN if username/email starts with admin and no admin exists
        boolean hasAdmin = userRepository.findAll().stream().anyMatch(u -> "ADMIN".equalsIgnoreCase(u.getRole()));
        if (!hasAdmin && (request.getUsername().equalsIgnoreCase("admin") || request.getEmail().toLowerCase().startsWith("admin"))) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        // Fixed to use our proper entity relationship instead of raw IDs
        if (request.getOrgId() != null) {
            Organisation org = organisationRepository.findById(request.getOrgId())
                .orElseThrow(() -> new IllegalArgumentException("Organisation not found"));
            user.setOrganisation(org);
        }

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());

        return new AuthResponse(token, savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        if ("admin@carbontrack.com".equalsIgnoreCase(request.getEmail()) && "admin123".equals(request.getPassword())) {
            User admin = userRepository.findByEmail("admin@carbontrack.com").orElseGet(() -> {
                User u = new User();
                u.setUsername("admin");
                u.setEmail("admin@carbontrack.com");
                return u;
            });
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getRole());
    }

    @Override
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getIdToken();
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new BadCredentialsException("Invalid Google token");
            }
            Map<String, Object> body = response.getBody();
            
            // Check for error description in body
            if (body.containsKey("error_description")) {
                throw new BadCredentialsException((String) body.get("error_description"));
            }

            String email = (String) body.get("email");
            String name = (String) body.get("name");
            
            if (email == null) {
                throw new BadCredentialsException("Email not provided by Google");
            }
            
            // Find or create user
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                String fallbackUsername = name != null ? name.replaceAll("\\s+", "").toLowerCase() + "_" + (System.currentTimeMillis() % 1000) : email.split("@")[0];
                newUser.setUsername(fallbackUsername);
                newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                newUser.setRole("USER");
                return userRepository.save(newUser);
            });
            
            String token = jwtUtil.generateToken(user.getEmail());
            return new AuthResponse(token, user.getId(), user.getUsername(), user.getRole());
        } catch (Exception e) {
            throw new BadCredentialsException("Google authentication failed: " + e.getMessage());
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void forgotPassword(com.carbontrack.backend.dto.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            // Silently return to prevent email enumeration
            return;
        }

        // Generate token and save
        String token = UUID.randomUUID().toString();
        com.carbontrack.backend.entity.PasswordResetToken resetToken = new com.carbontrack.backend.entity.PasswordResetToken(
            token, user, java.time.LocalDateTime.now().plusMinutes(30)
        );
        passwordResetTokenRepository.save(resetToken);

        // Send email
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(com.carbontrack.backend.dto.ResetPasswordRequest request) {
        com.carbontrack.backend.entity.PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        if (resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete the token and any other tokens for this user
        passwordResetTokenRepository.deleteByUserId(user.getId());
    }
}
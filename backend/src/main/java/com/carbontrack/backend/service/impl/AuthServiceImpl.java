package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.AuthResponse;
import com.carbontrack.backend.dto.LoginRequest;
import com.carbontrack.backend.dto.RegisterRequest;
import com.carbontrack.backend.dto.OrganisationRegistrationRequest;
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

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        // Registration is never a role-assignment workflow.
        user.setRole("USER");

        if (request.getOrganisationId() != null) {
            Organisation org = organisationRepository.findById(request.getOrganisationId())
                    .orElseThrow(() -> new com.carbontrack.backend.exception.ResourceNotFoundException("Organisation not found"));
            user.setOrganisation(org);
            user.setStatus("PENDING_APPROVAL");
        } else {
            user.setStatus("ACTIVE");
        }

        User savedUser = userRepository.save(user);
        
        AuthResponse response = new AuthResponse(null, savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
        response.setOrganisationId(savedUser.getOrganisation() != null ? savedUser.getOrganisation().getId() : null);
        response.setStatus(savedUser.getStatus());
        return response;
    }

    @Override
    @Transactional
    public AuthResponse registerOrganisation(OrganisationRegistrationRequest request) {
        if (organisationRepository.findByNameIgnoreCase(request.getOrganisationName()).isPresent())
            throw new DuplicateResourceException("Organisation name is already registered");
        if (organisationRepository.existsByCodeIgnoreCase(request.getOrganisationCode()))
            throw new DuplicateResourceException("Organisation code is already registered");
        if (organisationRepository.existsByOfficialEmailIgnoreCase(request.getOfficialEmail()))
            throw new DuplicateResourceException("Official organisation email is already registered");
        if (userRepository.findByUsername(request.getUsername()).isPresent())
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        if (userRepository.findByEmail(request.getWorkEmail()).isPresent())
            throw new DuplicateResourceException("Email already registered: " + request.getWorkEmail());

        Organisation organisation = new Organisation();
        organisation.setName(request.getOrganisationName());
        organisation.setCode(request.getOrganisationCode());
        organisation.setOrganisationType(request.getOrganisationType());
        organisation.setIndustry(request.getIndustry());
        organisation.setOfficialEmail(request.getOfficialEmail());
        organisation.setContactNumber(request.getContactNumber());
        organisation.setAddress(request.getAddress());
        organisation.setCity(request.getCity());
        organisation.setState(request.getState());
        organisation.setCountry(request.getCountry());
        organisation.setActive(true);
        organisation = organisationRepository.save(organisation);

        User admin = new User();
        admin.setFullName(request.getAdminFullName());
        admin.setUsername(request.getUsername());
        admin.setEmail(request.getWorkEmail());
        admin.setJobTitle(request.getJobTitle());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setRole("ORG_ADMIN");
        admin.setStatus("ACTIVE");
        admin.setOrganisation(organisation);
        admin = userRepository.save(admin);
        organisation.setAdminUserId(admin.getId());
        organisationRepository.save(organisation);

        AuthResponse response = new AuthResponse(null, admin.getId(), admin.getUsername(), admin.getRole());
        response.setOrganisationId(organisation.getId());
        return response;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(request.getEmail(), request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        String token = jwtUtil.generateToken(user);
        AuthResponse response = new AuthResponse(token, user.getId(), user.getUsername(), user.getRole());
        response.setOrganisationId(user.getOrganisation() != null ? user.getOrganisation().getId() : null);
        response.setStatus(user.getStatus());
        return response;
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
            
            // Organisation selection is mandatory, so OAuth only logs in an
            // account that completed the standard registration workflow.
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadCredentialsException(
                            "Register with an organisation before using Google sign-in"));
            
            String token = jwtUtil.generateToken(user);
            AuthResponse authResponse = new AuthResponse(token, user.getId(), user.getUsername(), user.getRole());
            authResponse.setOrganisationId(user.getOrganisation() != null ? user.getOrganisation().getId() : null);
            return authResponse;
        } catch (Exception e) {
            throw new BadCredentialsException("Google authentication failed: " + e.getMessage());
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void forgotPassword(com.carbontrack.backend.dto.ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCaseOrUsernameIgnoreCase(request.getEmail(), request.getEmail()).orElse(null);
        if (user == null) {
            // Silently return to prevent email enumeration
            return;
        }

        // Clean up any existing reset tokens for this user
        try {
            passwordResetTokenRepository.deleteByUserId(user.getId());
        } catch (Exception ignored) {}

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

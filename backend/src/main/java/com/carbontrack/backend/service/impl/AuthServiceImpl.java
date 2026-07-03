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

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OrganisationRepository organisationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(UserRepository userRepository,
                           OrganisationRepository organisationRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.organisationRepository = organisationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
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
        user.setRole("USER");

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
    public AuthResponse login(LoginRequest request) {
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
}
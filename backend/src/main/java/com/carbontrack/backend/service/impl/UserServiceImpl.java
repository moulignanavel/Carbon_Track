package com.carbontrack.backend.service.impl;

import com.carbontrack.backend.dto.SustainabilityPreferences;
import com.carbontrack.backend.dto.UserProfileRequest;
import com.carbontrack.backend.dto.UserProfileResponse;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.exception.DuplicateResourceException;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.service.SecurityService;
import com.carbontrack.backend.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SecurityService securityService;
    private final ObjectMapper objectMapper;

    public UserServiceImpl(UserRepository userRepository, SecurityService securityService, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.securityService = securityService;
        this.objectMapper = objectMapper;
    }

    @Override
    public UserProfileResponse getProfile() {
        User user = securityService.getCurrentUser();
        return mapToResponse(user);
    }

    @Override
    public UserProfileResponse updateProfile(UserProfileRequest request) {
        User currentUser = securityService.getCurrentUser();

        if (!currentUser.getEmail().equalsIgnoreCase(request.getEmail()) &&
                userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (!currentUser.getUsername().equalsIgnoreCase(request.getUsername()) &&
                userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }

        currentUser.setUsername(request.getUsername());
        currentUser.setEmail(request.getEmail());

        if (request.getSustainabilityPreferences() != null) {
            try {
                String jsonStr = objectMapper.writeValueAsString(request.getSustainabilityPreferences());
                currentUser.setSustainabilityPreferences(jsonStr);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Failed to serialize preferences: " + e.getMessage());
            }
        }

        User savedUser = userRepository.save(currentUser);
        return mapToResponse(savedUser);
    }

    private UserProfileResponse mapToResponse(User user) {
        SustainabilityPreferences prefs = null;
        if (user.getSustainabilityPreferences() != null && !user.getSustainabilityPreferences().isBlank()) {
            try {
                prefs = objectMapper.readValue(user.getSustainabilityPreferences(), SustainabilityPreferences.class);
            } catch (JsonProcessingException e) {
                prefs = new SustainabilityPreferences();
            }
        }
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                prefs
        );
    }
}

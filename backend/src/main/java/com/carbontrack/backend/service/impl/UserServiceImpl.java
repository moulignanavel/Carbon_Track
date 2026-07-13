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
import com.carbontrack.backend.entity.Badge;
import com.carbontrack.backend.entity.UserBadge;
import com.carbontrack.backend.repository.BadgeRepository;
import com.carbontrack.backend.repository.UserBadgeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SecurityService securityService;
    private final ObjectMapper objectMapper;
    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;

    public UserServiceImpl(UserRepository userRepository, 
                           SecurityService securityService, 
                           ObjectMapper objectMapper,
                           UserBadgeRepository userBadgeRepository,
                           BadgeRepository badgeRepository) {
        this.userRepository = userRepository;
        this.securityService = securityService;
        this.objectMapper = objectMapper;
        this.userBadgeRepository = userBadgeRepository;
        this.badgeRepository = badgeRepository;
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
        
        List<String> userBadges = userBadgeRepository.findByUserId(user.getId())
                .stream()
                .map(ub -> badgeRepository.findById(ub.getBadgeId()).orElse(null))
                .filter(b -> b != null)
                .map(Badge::getName)
                .collect(Collectors.toList());

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                prefs,
                user.getAvatarUrl(),
                userBadges
        );
    }
}

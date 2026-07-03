package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.UserProfileRequest;
import com.carbontrack.backend.dto.UserProfileResponse;
import com.carbontrack.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UserProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }
}

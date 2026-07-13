package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.UserProfileRequest;
import com.carbontrack.backend.dto.UserProfileResponse;
import com.carbontrack.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.carbontrack.backend.service.FileUploadService;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.UserRepository;
import com.carbontrack.backend.service.SecurityService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final FileUploadService fileUploadService;
    private final UserRepository userRepository;
    private final SecurityService securityService;

    public UserController(UserService userService, FileUploadService fileUploadService, UserRepository userRepository, SecurityService securityService) {
        this.userService = userService;
        this.fileUploadService = fileUploadService;
        this.userRepository = userRepository;
        this.securityService = securityService;
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String avatarUrl = fileUploadService.storeFile(file);
        
        User currentUser = securityService.getCurrentUser();
        currentUser.setAvatarUrl(avatarUrl);
        userRepository.save(currentUser);
        
        return ResponseEntity.ok(userService.getProfile());
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

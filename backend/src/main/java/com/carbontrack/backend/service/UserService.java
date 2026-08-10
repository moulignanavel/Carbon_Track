package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.UserProfileRequest;
import com.carbontrack.backend.dto.UserProfileResponse;

public interface UserService {
    UserProfileResponse getProfile();
    UserProfileResponse updateProfile(UserProfileRequest request);
    void changePassword(String currentPassword, String newPassword);
}

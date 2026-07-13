package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.AuthResponse;
import com.carbontrack.backend.dto.LoginRequest;
import com.carbontrack.backend.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse googleLogin(com.carbontrack.backend.dto.GoogleLoginRequest request);
    void forgotPassword(com.carbontrack.backend.dto.ForgotPasswordRequest request);
    void resetPassword(com.carbontrack.backend.dto.ResetPasswordRequest request);
}
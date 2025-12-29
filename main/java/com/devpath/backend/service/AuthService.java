package com.devpath.backend.service;

import com.devpath.backend.DTO.AuthResponse;
import com.devpath.backend.DTO.LoginRequest;
import com.devpath.backend.DTO.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse resetPassword(String token, String newPassword);

	AuthResponse forgotPassword(String email);
}

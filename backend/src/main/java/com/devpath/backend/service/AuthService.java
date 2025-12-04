package com.devpath.backend.service;


import com.devpath.backend.DTO.AuthResponse;
import com.devpath.backend.DTO.LoginRequest;
import com.devpath.backend.DTO.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    static AuthResponse login(LoginRequest request) {
		// TODO Auto-generated method stub
		return null;
	}
}
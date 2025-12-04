package com.devpath.backend.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {

    private String token;     // JWT
    private Long userId;
    private String fullName;
    private String email;
}
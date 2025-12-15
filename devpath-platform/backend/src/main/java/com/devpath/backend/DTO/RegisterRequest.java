package com.devpath.backend.DTO;

import lombok.Data;

@Data
public class RegisterRequest {

    private String fullName;  // Ad Soyad
    private String email;     // E-posta
    private String password;  // Şifre
}
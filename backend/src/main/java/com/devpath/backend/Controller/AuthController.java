package com.devpath.backend.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.devpath.backend.DTO.AuthResponse;
import com.devpath.backend.DTO.LoginRequest;
import com.devpath.backend.DTO.RegisterRequest;
import com.devpath.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Tüm kaynaklardan gelen isteklere izin ver
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        // KONSOLDA GÖRMEK İÇİN BU SATIRI EKLEDİK:
        System.out.println("✅ BACKEND'E KAYIT (REGISTER) İSTEĞİ GELDİ! Email: " + request.getEmail());
        
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // KONSOLDA GÖRMEK İÇİN BU SATIRI EKLEDİK:
        System.out.println("✅ BACKEND'E GİRİŞ (LOGIN) İSTEĞİ GELDİ! Email: " + request.getEmail());
        
        // Düzeltme: AuthService (Class) yerine authService (Instance) kullandık.
        return ResponseEntity.ok(AuthService.login(request));
    }
}
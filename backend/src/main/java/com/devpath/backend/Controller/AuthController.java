package com.devpath.backend.Controller;

import lombok.RequiredArgsConstructor;

import java.util.Map;

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

    // ---------------------- REGISTER ----------------------
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        System.out.println("✅ BACKEND'E KAYIT (REGISTER) İSTEĞİ GELDİ! Email: " + request.getEmail());
        return ResponseEntity.ok(authService.register(request));
    }

    // ---------------------- LOGIN -------------------------
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        System.out.println("✅ BACKEND'E GİRİŞ (LOGIN) İSTEĞİ GELDİ! Email: " + request.getEmail());
        return ResponseEntity.ok(authService.login(request));
    }

    //Şifre sıfırlama maili gönderme
    // ŞİFREMİ UNUTTUM
    // ---------------------- FORGOT PASSWORD ----------------------
    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@RequestParam("email") String email) {
        System.out.println("🔐 ŞİFREMİ UNUTTUM İSTEĞİ ALINDI → " + email);
        return ResponseEntity.ok(authService.forgotPassword(email));
    }
    
    
    //FE’den gelen token + yeni şifreyi backend alacak.
 // YENİ ŞİFRE KAYDETME
    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@RequestBody Map<String, String> body) {

        String token = body.get("token");
        String newPassword = body.get("newPassword");

        return ResponseEntity.ok(authService.resetPassword(token, newPassword));
    }

}

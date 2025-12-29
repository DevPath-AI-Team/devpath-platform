package com.devpath.backend.service;

import com.devpath.backend.DTO.AuthResponse;
import com.devpath.backend.DTO.LoginRequest;
import com.devpath.backend.DTO.RegisterRequest;
import com.devpath.backend.config.JwtService;
import com.devpath.backend.entity.Role;
import com.devpath.backend.entity.User;
import com.devpath.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;  // 🔥 Şifre sıfırlama maili göndermek için

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Bu e-posta ile zaten hesap mevcut.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER.name())
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .build();
    }

    // 🔥🔥 ŞİFREMİ UNUTTUM
    @Override
    public AuthResponse forgotPassword(String email) {

        // Kullanıcı var mı diye bakıyoruz ama dışarıya aynı mesajı döneceğiz (güvenlik için)
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            // Bilerek generic mesaj dönüyoruz: email var/yok belli olmasın
            return AuthResponse.builder()
                    .message("Eğer bu e-posta ile kayıtlı bir hesabın varsa, şifre sıfırlama bağlantısı gönderildi.")
                    .build();
        }

        User user = optionalUser.get();

        // 1) Token oluştur
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpire(LocalDateTime.now().plusMinutes(15));

        userRepository.save(user);

        // 2) Link
        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        // 3) Mail gönder (try/catch ile sardık ki Postman sonsuza kadar takılmasın)
        try {
            emailService.sendResetMail(user.getEmail(), resetLink);
            System.out.println("✅ Reset maili gönderildi: " + user.getEmail());
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("❌ Reset maili gönderilirken hata oluştu: " + e.getMessage());
            // İstersen burada loglayıp devam etmek yeterli, kullanıcıya yine de aynı mesajı döndürüyoruz.
        }

        return AuthResponse.builder()
                .message("Eğer bu e-posta ile kayıtlı bir hesabın varsa, şifre sıfırlama bağlantısı gönderildi.")
                .build();
    }

    // 🔁 YENİ ŞİFRE KAYDETME
    @Override
    public AuthResponse resetPassword(String token, String newPassword) {

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı."));

        // Token süresi kontrolü
        if (user.getResetTokenExpire() == null || user.getResetTokenExpire().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Şifre sıfırlama bağlantısının süresi dolmuş.");
        }

        // Yeni şifreyi kaydet
        user.setPassword(passwordEncoder.encode(newPassword));

        // Token'ı temizle
        user.setResetToken(null);
        user.setResetTokenExpire(null);

        userRepository.save(user);

        // İstersen kullanıcıya otomatik login için yeni JWT üretebilirsin
        String jwt = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .message("Şifreniz başarıyla güncellendi.")
                .build();
    }
}

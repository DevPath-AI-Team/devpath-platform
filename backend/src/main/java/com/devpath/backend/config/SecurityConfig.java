package com.devpath.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // Şifreleri Bcrypt ile encode etmek için PasswordEncoder bean'i
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Ana güvenlik zinciri
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF kapalı (JWT + REST API için)
                .csrf(csrf -> csrf.disable())

                // Session yerine tamamen stateless JWT kullanıyoruz
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Hangi endpoint'e kim erişebilir?
                .authorizeHttpRequests(auth -> auth
                        // Kayıt / giriş herkese açık
                        .requestMatchers("/api/auth/**").permitAll()
                        // Ders endpointleri şimdilik herkese açık (geliştirme için)
                        .requestMatchers("/api/lessons/**").permitAll()
                        // İlerleme (UserProgress) endpointleri de şimdilik herkese açık
                        .requestMatchers("/api/progress/**").permitAll()
                        // Diğer tüm endpointler için authentication zorunlu
                        .anyRequest().authenticated()
                )

                // JWT filtresini UsernamePasswordAuthenticationFilter'dan önce ekliyoruz
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // AuthenticationManager bean'i (AuthService içinde kullanılıyor)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

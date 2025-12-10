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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // Şifreleri Bcrypt ile encode etmek için PasswordEncoder bean'i
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager bean'i (AuthService içinde kullanılıyor)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    // Ana güvenlik zinciri (Büşra'nın ve senin endpoint bazlı izinlerini birleştirdik)
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF kapalı (JWT + REST API için)
                .csrf(csrf -> csrf.disable())

                // CORS Entegrasyonu
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Session yerine tamamen stateless JWT kullanıyoruz
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Hangi endpoint'e kim erişebilir?
                .authorizeHttpRequests(auth -> auth
                        // Kayıt / giriş herkese açık
                        .requestMatchers("/api/auth/**").permitAll()
                        // QUIZ ve LESSON endpointleri herkese açık (geliştirme için)
                        .requestMatchers("/api/lessons/**").permitAll()
                        .requestMatchers("/api/progress/**").permitAll()
                        .requestMatchers("/api/quiz/**").permitAll() // Yeni Quiz Controller için eklendi
                        // Diğer tüm endpointler için authentication zorunlu
                        .anyRequest().authenticated()
                )

                // JWT filtresini UsernamePasswordAuthenticationFilter'dan önce ekliyoruz
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS Konfigürasyonu (Eski hatayı çözen kısım korundu)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // "setAllowedOriginPatterns" kullanıyoruz.
        configuration.setAllowedOriginPatterns(List.of("*")); 
        
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
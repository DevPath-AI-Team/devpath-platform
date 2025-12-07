package com.devpath.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;   // Ad Soyad

    @Column(nullable = false, unique = true)
    private String email;      // E-posta

    @Column(nullable = false)
    private String password;   // Şifre (BCrypt ile hashlenecek)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    private String level;
    
    @Column(name = "reset_token")
    private String resetToken;

    //expire süresi dolmak
    @Column(name = "reset_token_expire")
    private LocalDateTime resetTokenExpire;

}
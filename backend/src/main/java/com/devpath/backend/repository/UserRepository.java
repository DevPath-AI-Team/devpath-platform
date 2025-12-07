package com.devpath.backend.repository;

import com.devpath.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Kayıt olurken email var mı kontrolü için
    boolean existsByEmail(String email);

    // Login / kullanıcı bulma için
    Optional<User> findByEmail(String email);

    // Şifre sıfırlama için → token ile kullanıcı bul
    Optional<User> findByResetToken(String resetToken);
}

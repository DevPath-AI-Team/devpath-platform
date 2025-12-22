package com.devpath.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder; // BU EKSİKTİ
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime; // BU EKSİKTİ

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // BU ÇOK ÖNEMLİ: AuthServiceImpl'deki .builder() hatasını çözer
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    @Column(unique = true)
    private String email;

    private String password;

    // CustomUserDetailsService içinde .name() hatasını çözmek için String yerine Enum da kullanılabilir
    // ama şimdilik kodun yapısını bozmadan String bırakalım.
    // Ancak diğer servislerdeki hatayı çözmek için getRole().name() kullanımı varsa
    // burayı Enum yapmamız gerekebilir. Şimdilik String kalsın, hatayı serviste çözeceğiz.
    private String role; 

    // --- EKLENEN YENİ ALANLAR (Hataları Çözen Kısımlar) ---

    // Şifre Sıfırlama için gerekli alanlar (AuthServiceImpl hatası için)
    private String resetToken;
    private LocalDateTime resetTokenExpire;

    // Dashboard ve İlerleme için gerekli alanlar
    private String language; // JAVASCRIPT, PYTHON, JAVA
    
    private String level;    // BEGINNER, INTERMEDIATE, ADVANCED
    
    // Puanlama (Tip uyumsuzluğu olmasın diye Double yapıyoruz, hata mesajında Double istenmiş)
    private Double score;   

    // Yol Haritası Başlangıç Konusu ID'si
    private Integer roadmapStartTopicId; 
}
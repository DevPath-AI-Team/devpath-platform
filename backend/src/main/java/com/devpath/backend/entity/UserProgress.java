package com.devpath.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// Kullanıcının belirli bir dersteki ilerlemesini tutar
@Entity
@Table(name = "user_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Hangi kullanıcı?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Hangi ders?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    // Yüzdesel ilerleme (0–100)
    @Column(nullable = false)
    private int progress;   // örn: 0, 30, 100

    // Tamamlandı mı?
    @Column(nullable = false)
    private boolean completed;

    // Ne zaman başladı?
    private LocalDateTime startedAt;

    // Ne zaman tamamladı?
    private LocalDateTime completedAt;

    // Son güncellenme zamanı
    private LocalDateTime updatedAt;
}

package com.devpath.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false)
    private int progress;

    @Builder.Default // Sarı uyarıyı çözer
    @Column(nullable = false)
    private Boolean completed = false; 

    private Double score;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt;

    // --- UYUMLULUK METODU ---
    // Service katmanında "isCompleted()" arayan yerler için:
    public boolean isCompleted() {
        return Boolean.TRUE.equals(this.completed);
    }
}
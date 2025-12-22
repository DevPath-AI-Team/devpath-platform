package com.devpath.backend.entity;

import com.devpath.backend.curriculum.LessonLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String language;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Yeni sistemin istediği alan
    private String topicId;

    @Enumerated(EnumType.STRING)
    private LessonLevel level;

    @Column(nullable = false)
    private Integer orderIndex;

    private Integer estimatedMinutes;

    // Hem videoUrl hem youtubeUrl olarak kullanılabilsin diye
    private String videoUrl;

    private String materialUrl;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<Note> notes;

    // --- UYUMLULUK METODLARI (Sihirli Kısım) ---
    // Eski kodlar "getYoutubeUrl" dediğinde videoUrl'i verecek
    public String getYoutubeUrl() {
        return this.videoUrl;
    }

    // Eski kodlar "setYoutubeUrl" dediğinde videoUrl'i güncelleyecek
    public void setYoutubeUrl(String youtubeUrl) {
        this.videoUrl = youtubeUrl;
    }
}
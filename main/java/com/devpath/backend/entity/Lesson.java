package com.devpath.backend.entity;

import com.devpath.backend.curriculum.LessonLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(
    name = "lessons",
    uniqueConstraints = {
        // ✅ Aynı dil + seviye + orderIndex aynı olamaz => duplicate engellenir
        @UniqueConstraint(columnNames = {"language", "level", "order_index"})
    }
)
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

    private String topicId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private LessonLevel level;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    private Integer estimatedMinutes;

    @Column(name = "youtube_url")
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

    // Uyumlu getter/setter
    public String getYoutubeUrl() { return this.videoUrl; }
    public void setYoutubeUrl(String youtubeUrl) { this.videoUrl = youtubeUrl; }
}

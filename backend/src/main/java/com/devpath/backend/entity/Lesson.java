package com.devpath.backend.entity;

import com.devpath.backend.curriculum.LessonLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

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
	    private Long id;                    // Otomatik ID

	    @Column(unique = true, nullable = false, length = 100)
	    private String code;                // Örn: JAVA_INTRO_01

	    @Column(nullable = false, length = 255)
	    private String title;               // Ders başlığı

	    @Column
	    private String description;         // Ders açıklaması

	    @Enumerated(EnumType.STRING)
	    private LessonLevel level;          // BEGINNER / INTERMEDIATE / ADVANCED

	    @Column(nullable = false)
	    private Integer orderIndex;         // Yol haritasındaki sırası (1,2,3,...)

	    private Integer estimatedMinutes;   // Tahmini süre (dk)

	    private String videoUrl;            // Video linki

	    private String materialUrl;         // PDF / not linki

	    @Column(nullable = false)
	    private Boolean isActive = true;    // Aktif / pasif

	    @CreationTimestamp
	    private LocalDateTime createdAt;    // Oluşturulma zamanı

	    @UpdateTimestamp
	    private LocalDateTime updatedAt;    // Güncellenme zamanı
	}

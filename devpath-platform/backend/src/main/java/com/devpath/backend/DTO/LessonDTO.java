package com.devpath.backend.DTO;

import com.devpath.backend.curriculum.LessonLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDTO {
    private Long id;            // "lessonId" yerine genelde "id" kullanılır, Entity ile uyum için.
    private String language;
    private String title;
    private String description;
    private LessonLevel level;
    private Integer orderIndex;
    
    private String videoUrl;         // Frontend bunu bekliyor
    private Integer estimatedMinutes; // Bu eksikti
    private Boolean isActive;        // Bu eksikti
    
    // Eski kodlar "getYoutubeUrl" dediğinde hata vermesin diye:
    public String getYoutubeUrl() {
        return videoUrl;
    }
}
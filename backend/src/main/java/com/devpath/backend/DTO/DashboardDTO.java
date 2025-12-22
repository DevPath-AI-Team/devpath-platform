package com.devpath.backend.DTO;

import lombok.Builder;
import lombok.Data;
import java.util.List;

// Frontend'in anasayfayı çizmesi için gereken tüm verileri içeren ana DTO.
@Data
@Builder
public class DashboardDTO {

    // --- User & AI Analysis Info ---
    private String userFullName;
    private String language;
    private String level;
    private Double score;
    private Integer roadmapStartTopicId;

    // --- Roadmap ---
    private List<RoadmapItemDTO> roadmap;

    // Yol haritasındaki tek bir dersi temsil eden alt DTO.
    @Data
    @Builder
    public static class RoadmapItemDTO {
        // Dersin temel bilgileri
        private Long lessonId;
        private String title;
        private String description;
        private String videoUrl;
        private Integer estimatedMinutes;
        private Integer topicId; // Müfredattaki orijinal sıralama/grup ID'si

        // Kullanıcıya özel ilerleme durumu
        private RoadmapStatus status; // COMPLETED, CURRENT, LOCKED
        private int progressPercentage; // 0-100
    }

    // Bir yol haritası adımının durumunu belirten enum.
    public enum RoadmapStatus {
        COMPLETED, // Kullanıcı bu dersi tamamladı.
        CURRENT,   // Kullanıcının şu anda üzerinde çalışması gereken ders.
        LOCKED     // Henüz erişime açılmamış ders.
    }
}

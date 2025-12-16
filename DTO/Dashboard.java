package com.devpath.backend.DTO;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class Dashboard {

    private String userFullName;
    private String language;
    private String level;
    private Double score;
    private Integer roadmapStartTopicId;

    private List<RoadmapItemDTO> roadmap;

    @Data
    @Builder
    public static class RoadmapItemDTO {
        private Long lessonId;
        private String title;
        private String description;
        private String videoUrl;
        private Integer estimatedMinutes;
        private String language;
        private Integer topicId;
        private String lessonLevel;
        private RoadmapStatus status;
        private int progressPercentage;
    }

    public enum RoadmapStatus {
        COMPLETED,
        CURRENT,
        AVAILABLE,
        LOCKED
    }
}

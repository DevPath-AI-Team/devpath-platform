package com.devpath.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserLessonDTO {

    private Long lessonId;
    private String title;
    private String description;
    private String youtubeUrl;
    private String language;   // JAVA / PYTHON
    private String level;      // BEGINNER / INTERMEDIATE / ADVANCED
    private String status;     // completed / open / locked
}

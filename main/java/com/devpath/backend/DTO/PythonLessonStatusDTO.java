package com.devpath.backend.DTO;

import lombok.Data;

@Data
public class PythonLessonStatusDTO {
    private Long lessonId;
    private String status;  // tamamlandı, açık, kilitli
}
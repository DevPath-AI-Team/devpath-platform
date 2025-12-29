package com.devpath.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NextLessonResponse {
    private Long nextLessonId;     // varsa direkt açılacak ders
    private String newUserLevel;   // seviye yükseldiyse yeni seviye
}

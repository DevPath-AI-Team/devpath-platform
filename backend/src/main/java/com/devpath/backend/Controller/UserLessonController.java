package com.devpath.backend.Controller;

import com.devpath.backend.DTO.UserLessonDTO;
import com.devpath.backend.service.UserLessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserLessonController {

    private final UserLessonService userLessonService;

    // Örnek istek:
    // GET /api/users/3/lessons?language=JAVA
    @GetMapping("/{userId}/lessons")
    public ResponseEntity<List<UserLessonDTO>> getUserLessons(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "JAVA") String language
    ) {
        List<UserLessonDTO> lessons = userLessonService.getUserLessons(userId, language);
        return ResponseEntity.ok(lessons);
    }
}

/*Kullanıcının yol haritasını getirir

Python analiz sonuçlarını yansıtır

Dashboard ekranını otomatik çalıştırır

Derslerin sırasını FE’ye bildirir

Hangi videonun gösterileceğini belirler*/
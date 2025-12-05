package com.devpath.backend.Controller;

import com.devpath.backend.entity.UserProgress;
import com.devpath.backend.service.UserProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Kim hangi derste, yüzde kaçta? -> REST endpoint'leri
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserProgressController {

    private final UserProgressService progressService;

    // Kullanıcı bir dersi ilk kez açtığında
    // POST /api/progress/start?userId=11&lessonId=3
    @PostMapping("/start")
    public ResponseEntity<UserProgress> startLesson(
            @RequestParam("userId") Long userId,
            @RequestParam("lessonId") Long lessonId
    ) {
        return ResponseEntity.ok(progressService.startLesson(userId, lessonId));
    }

    // Kullanıcı ilerledikçe yüzdesini güncelle
    // PUT /api/progress/update?userId=11&lessonId=3&percentage=40
    @PutMapping("/update")
    public ResponseEntity<UserProgress> updateProgress(
            @RequestParam("userId") Long userId,
            @RequestParam("lessonId") Long lessonId,
            @RequestParam("percentage") int percentage
    ) {
        return ResponseEntity.ok(progressService.updateProgress(userId, lessonId, percentage));
    }

    // Dersi tamamlandı işaretlemek için
    // PUT /api/progress/complete?userId=11&lessonId=3
    @PutMapping("/complete")
    public ResponseEntity<UserProgress> completeLesson(
            @RequestParam("userId") Long userId,
            @RequestParam("lessonId") Long lessonId
    ) {
        return ResponseEntity.ok(progressService.completeLesson(userId, lessonId));
    }

    // Bir kullanıcının tüm derslerdeki ilerlemesi
    // GET /api/progress/user/11
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserProgress>> getUserProgress(
            @PathVariable("userId") Long userId
    ) {
        return ResponseEntity.ok(progressService.getUserProgress(userId));
    }
}

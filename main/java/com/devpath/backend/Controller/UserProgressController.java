package com.devpath.backend.Controller;

import com.devpath.backend.DTO.NextLessonResponse;
import com.devpath.backend.DTO.PythonAnalyzeResponse;
import com.devpath.backend.entity.UserProgress;
import com.devpath.backend.external.PythonApiClient;
import com.devpath.backend.service.UserProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserProgressController {

    private final UserProgressService progressService;
    private final PythonApiClient pythonApiClient;

    @PostMapping("/analyze")
    public ResponseEntity<PythonAnalyzeResponse> analyzeQuiz(@RequestBody Map<String, Object> requestBody) {
        PythonAnalyzeResponse pythonResponse = pythonApiClient.analyzeUser(requestBody);

        Long userId = Long.valueOf(requestBody.get("userId").toString());
        progressService.saveUserAnalysis(userId, requestBody, pythonResponse);

        return ResponseEntity.ok(pythonResponse);
    }

    @PostMapping("/start")
    public ResponseEntity<UserProgress> startLesson(
            @RequestParam Long userId,
            @RequestParam Long lessonId
    ) {
        return ResponseEntity.ok(progressService.startLesson(userId, lessonId));
    }

    @PutMapping("/update")
    public ResponseEntity<UserProgress> updateProgress(
            @RequestParam Long userId,
            @RequestParam Long lessonId,
            @RequestParam int percentage
    ) {
        return ResponseEntity.ok(progressService.updateProgress(userId, lessonId, percentage));
    }

    @PutMapping("/complete")
    public ResponseEntity<UserProgress> completeLesson(
            @RequestParam Long userId,
            @RequestParam Long lessonId
    ) {
        return ResponseEntity.ok(progressService.completeLesson(userId, lessonId));
    }

    // ✅ YENİ: complete + next
    @PutMapping("/complete-next")
    public ResponseEntity<NextLessonResponse> completeAndNext(
            @RequestParam Long userId,
            @RequestParam Long lessonId
    ) {
        return ResponseEntity.ok(progressService.completeAndGetNext(userId, lessonId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserProgress>> getUserProgress(@PathVariable Long userId) {
        return ResponseEntity.ok(progressService.getUserProgress(userId));
    }
}

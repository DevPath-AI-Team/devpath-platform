package com.devpath.backend.service;

import com.devpath.backend.DTO.NextLessonResponse;
import com.devpath.backend.DTO.PythonAnalyzeResponse;
import com.devpath.backend.entity.UserProgress;

import java.util.List;
import java.util.Map;

public interface UserProgressService {

    UserProgress startLesson(Long userId, Long lessonId);

    UserProgress updateProgress(Long userId, Long lessonId, int percentage);

    UserProgress completeLesson(Long userId, Long lessonId);

    // ✅ YENİ: Tamamla + bir sonraki dersi döndür
    NextLessonResponse completeAndGetNext(Long userId, Long lessonId);

    List<UserProgress> getUserProgress(Long userId);

    void saveUserAnalysis(Long userId, Map<String, Object> requestBody, PythonAnalyzeResponse pythonResponse);
}

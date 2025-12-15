package com.devpath.backend.service;

import com.devpath.backend.DTO.PythonAnalyzeResponse;
import com.devpath.backend.entity.UserProgress;

import java.util.List;
import java.util.Map;

public interface UserProgressService {

    UserProgress startLesson(Long userId, Long lessonId);

    UserProgress updateProgress(Long userId, Long lessonId, int percentage);

    UserProgress completeLesson(Long userId, Long lessonId);

    List<UserProgress> getUserProgress(Long userId);

    /**
     * Takes the result from the Python AI analysis and persists it to the User entity.
     *
     * @param userId The ID of the user to update.
     * @param requestBody The full request body, containing language.
     * @param pythonResponse The response from the Python service, containing level, score, etc.
     */
    void saveUserAnalysis(Long userId, Map<String, Object> requestBody, PythonAnalyzeResponse pythonResponse);

}

package com.devpath.backend.service;

import com.devpath.backend.DTO.LessonDTO;
import java.util.List;

public interface LessonService {
    // Controller'ın istediği metodlar:
    List<LessonDTO> getAllLessons();
    LessonDTO getLessonById(Long id);

    // Mevcut metodlar:
    List<LessonDTO> getLessonsByLanguage(String language);
    LessonDTO createLesson(LessonDTO lessonDTO);
    LessonDTO updateLesson(Long id, LessonDTO lessonDTO);
    void deleteLesson(Long id);
}
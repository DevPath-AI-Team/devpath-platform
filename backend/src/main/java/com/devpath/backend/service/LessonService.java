package com.devpath.backend.service;

import com.devpath.backend.entity.Lesson;

import java.util.List;

// Ders iş mantığı arayüzü
public interface LessonService {

    List<Lesson> getAllActiveLessons();

    Lesson getLessonById(Long id);

    Lesson createLesson(Lesson lesson);

    Lesson updateLesson(Long id, Lesson lesson);

    void deleteLesson(Long id);
}

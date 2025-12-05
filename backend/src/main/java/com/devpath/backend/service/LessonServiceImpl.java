package com.devpath.backend.service;

import com.devpath.backend.entity.Lesson;
import com.devpath.backend.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Lesson> getAllActiveLessons() {
        return lessonRepository.findAllByIsActiveTrueOrderByOrderIndexAsc();
    }

    @Override
    @Transactional(readOnly = true)
    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ders bulunamadı: " + id));
    }

    @Override
    public Lesson createLesson(Lesson lesson) {
        if (lesson.getIsActive() == null) {
            lesson.setIsActive(true);
        }
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson updateLesson(Long id, Lesson updated) {
        Lesson existing = getLessonById(id);

        existing.setCode(updated.getCode());
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setLevel(updated.getLevel());
        existing.setOrderIndex(updated.getOrderIndex());
        existing.setEstimatedMinutes(updated.getEstimatedMinutes());
        existing.setVideoUrl(updated.getVideoUrl());
        existing.setMaterialUrl(updated.getMaterialUrl());
        existing.setIsActive(updated.getIsActive());

        return lessonRepository.save(existing);
    }

    @Override
    public void deleteLesson(Long id) {
        lessonRepository.deleteById(id);
    }
}

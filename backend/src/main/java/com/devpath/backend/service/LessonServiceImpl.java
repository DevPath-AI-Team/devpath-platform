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

    // 🔹 Tüm aktif dersleri getirir (dil filtresi olmadan)
    @Override
    @Transactional(readOnly = true)
    public List<Lesson> getAllActiveLessons() {
        return lessonRepository.findAll()
                .stream()
                .filter(Lesson::getIsActive)
                .sorted((a, b) -> a.getOrderIndex().compareTo(b.getOrderIndex()))
                .toList();
    }

    // 🔹 ID'ye göre tek ders getir
    @Override
    @Transactional(readOnly = true)
    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ders bulunamadı: " + id));
    }

    // 🔹 Yeni ders oluştur
    @Override
    public Lesson createLesson(Lesson lesson) {
        if (lesson.getIsActive() == null) {
            lesson.setIsActive(true);
        }
        return lessonRepository.save(lesson);
    }

    // 🔹 Var olan dersi güncelle
    @Override
    public Lesson updateLesson(Long id, Lesson updated) {

        Lesson existing = getLessonById(id);

        existing.setLanguage(updated.getLanguage());
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setLevel(updated.getLevel());
        existing.setOrderIndex(updated.getOrderIndex());
        existing.setEstimatedMinutes(updated.getEstimatedMinutes());
        existing.setYoutubeUrl(updated.getYoutubeUrl());
        existing.setMaterialUrl(updated.getMaterialUrl());
        existing.setIsActive(updated.getIsActive());

        return lessonRepository.save(existing);
    }

    // 🔹 Ders sil
    @Override
    public void deleteLesson(Long id) {
        lessonRepository.deleteById(id);
    }
}

package com.devpath.backend.repository;

import com.devpath.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    // Dil ve aktiflik ile filtrele
    List<Lesson> findByLanguageAndIsActiveTrueOrderByOrderIndexAsc(String language);

    // Tüm aktif dersler
    List<Lesson> findAllByIsActiveTrueOrderByOrderIndexAsc();
}

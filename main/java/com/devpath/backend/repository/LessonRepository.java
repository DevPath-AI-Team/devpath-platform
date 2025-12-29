package com.devpath.backend.repository;

import com.devpath.backend.curriculum.LessonLevel;   // ✅ EKLENDİ
import com.devpath.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    // 1) Dil'e göre dersleri getir
    List<Lesson> findByLanguage(String language);

    // 2) Aktif dersleri dil'e göre sıralı getir
    List<Lesson> findByLanguageAndIsActiveTrueOrderByOrderIndexAsc(String language);

    // 3) DashboardService için: Tüm dersleri dil'e ve topicId sırasına göre getir
    List<Lesson> findAllByLanguageOrderByTopicIdAsc(String language);

    // 4) ✅ Seviye filtresi: dil + seviye listesi
    @Query("SELECT l FROM Lesson l WHERE LOWER(l.language) = LOWER(:language) " +
            "AND l.level IN :levels " +
            "ORDER BY l.orderIndex ASC")
    List<Lesson> findByLanguageIgnoreCaseAndLevelInOrderByOrderIndexAsc(
            @Param("language") String language,
            @Param("levels") List<String> levels);

    // 5) Basit seviye filtresi (case-sensitive)
    List<Lesson> findByLanguageAndLevelInOrderByOrderIndexAsc(String language, List<String> levels);

    // ✅ YENİ: tek seviye için sırayla getir (case-insensitive)
    @Query("SELECT l FROM Lesson l WHERE LOWER(l.language) = LOWER(:language) " +
            "AND l.level = :level " +
            "ORDER BY l.orderIndex ASC")
    List<Lesson> findByLanguageIgnoreCaseAndLevelOrderByOrderIndexAsc(
            @Param("language") String language,
            @Param("level") LessonLevel level   // ✅ DEĞİŞTİ
    );
}

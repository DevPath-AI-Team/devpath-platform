package com.devpath.backend.repository;

import com.devpath.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByLanguage(String language);

    List<Lesson> findByLanguageAndIsActiveTrueOrderByOrderIndexAsc(String language);

    // DashboardService'in aradığı o meşhur metod:
    List<Lesson> findAllByLanguageOrderByTopicIdAsc(String language);
}
package com.devpath.backend.repository;
import com.devpath.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


//Dersler için DB erişimi
public interface LessonRepository extends JpaRepository<Lesson, Long> {

 Optional<Lesson> findByCode(String code);

 List<Lesson> findAllByIsActiveTrueOrderByOrderIndexAsc();
}
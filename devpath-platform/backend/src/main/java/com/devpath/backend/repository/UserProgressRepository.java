package com.devpath.backend.repository;

import com.devpath.backend.entity.User;
import com.devpath.backend.entity.Lesson;
import com.devpath.backend.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Kim hangi derste ne kadar ilerlemiş? -> DB erişimi
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    // Belirli bir kullanıcı + ders için tek kayıt
    Optional<UserProgress> findByUserAndLesson(User user, Lesson lesson);

    // Kullanıcının tüm ilerleme kayıtları
    List<UserProgress> findAllByUser(User user);
}

package com.devpath.backend.service;

import com.devpath.backend.entity.User;
import com.devpath.backend.entity.Lesson;
import com.devpath.backend.entity.UserProgress;
import com.devpath.backend.repository.UserRepository;
import com.devpath.backend.repository.LessonRepository;
import com.devpath.backend.repository.UserProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProgressServiceImpl implements UserProgressService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final UserProgressRepository progressRepository;

    @Override
    public UserProgress startLesson(Long userId, Long lessonId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Ders bulunamadı: " + lessonId));

        // Eğer bu kullanıcı bu dersi daha önce açmışsa, kaydı yeniden kullan
        return progressRepository.findByUserAndLesson(user, lesson)
                .orElseGet(() -> {
                    UserProgress p = UserProgress.builder()
                            .user(user)
                            .lesson(lesson)
                            .progress(0)
                            .completed(false)
                            .startedAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return progressRepository.save(p);
                });
    }

    @Override
    public UserProgress updateProgress(Long userId, Long lessonId, int percentage) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Ders bulunamadı: " + lessonId));

        UserProgress progress = progressRepository.findByUserAndLesson(user, lesson)
                .orElseThrow(() -> new RuntimeException("Bu ders için ilerleme kaydı yok. Önce /start çağır."));

        progress.setProgress(percentage);
        progress.setUpdatedAt(LocalDateTime.now());

        if (percentage >= 100) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            progress.setProgress(100);
        }

        return progressRepository.save(progress);
    }

    @Override
    public UserProgress completeLesson(Long userId, Long lessonId) {
        // Direkt %100 yap
        return updateProgress(userId, lessonId, 100);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProgress> getUserProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        return progressRepository.findAllByUser(user);
    }
}

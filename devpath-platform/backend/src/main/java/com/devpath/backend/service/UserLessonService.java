package com.devpath.backend.service;

import com.devpath.backend.DTO.UserLessonDTO;
import com.devpath.backend.entity.Lesson;
import com.devpath.backend.entity.User;
import com.devpath.backend.entity.UserProgress;
import com.devpath.backend.repository.LessonRepository;
import com.devpath.backend.repository.UserProgressRepository;
import com.devpath.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserLessonService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final UserProgressRepository progressRepository;

    // 🔹 Dashboard için: Kullanıcının bir dildeki tüm derslerini durumlarıyla getir
    public List<UserLessonDTO> getUserLessons(Long userId, String language) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        // 1) Bu dildeki tüm aktif dersleri sıraya göre al
        List<Lesson> lessons = lessonRepository
                .findByLanguageAndIsActiveTrueOrderByOrderIndexAsc(language);

        // 2) Kullanıcının tüm progress kayıtlarını al ve Map'e çevir (lessonId -> progress)
        List<UserProgress> progressList = progressRepository.findAllByUser(user);

        Map<Long, UserProgress> progressMap = progressList.stream()
                .collect(Collectors.toMap(
                        p -> p.getLesson().getId(),
                        p -> p
                ));

        // 3) Her ders için status hesapla ve DTO oluştur
        List<UserLessonDTO> result = new ArrayList<>();

        for (Lesson lesson : lessons) {
            UserProgress p = progressMap.get(lesson.getId());

            String status;
            if (p == null) {
                // Python analizinde hiç kaydı yoksa: varsayılan kilitli
                status = "locked";
            } else if (p.isCompleted()) {
                status = "completed";
            } else {
                // Kayıt var ama completed değilse: open
                status = "open";
            }

            result.add(new UserLessonDTO(
                    lesson.getId(),
                    lesson.getTitle(),
                    lesson.getDescription(),
                    lesson.getYoutubeUrl(),
                    lesson.getLanguage(),
                    lesson.getLevel().name(),
                    status
            ));
        }

        return result;
    }
}

package com.devpath.backend.service;

import com.devpath.backend.DTO.NextLessonResponse;
import com.devpath.backend.DTO.PythonAnalyzeResponse;
import com.devpath.backend.entity.Lesson;
import com.devpath.backend.entity.User;
import com.devpath.backend.entity.UserProgress;
import com.devpath.backend.repository.LessonRepository;
import com.devpath.backend.repository.UserProgressRepository;
import com.devpath.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProgressServiceImpl implements UserProgressService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final UserProgressRepository progressRepository;

    private static final List<String> LEVEL_ORDER = Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED");

    @Override
    public UserProgress startLesson(Long userId, Long lessonId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Ders bulunamadı: " + lessonId));

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
        return updateProgress(userId, lessonId, 100);
    }

    // ✅ YENİ: Tamamla + Next ders id döndür
    @Override
    public NextLessonResponse completeAndGetNext(Long userId, Long lessonId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        Lesson currentLesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Ders bulunamadı: " + lessonId));

        // 1) progress kaydı yoksa oluştur, sonra complete yap
        UserProgress p = progressRepository.findByUserAndLesson(user, currentLesson)
                .orElseGet(() -> progressRepository.save(
                        UserProgress.builder()
                                .user(user)
                                .lesson(currentLesson)
                                .progress(0)
                                .completed(false)
                                .startedAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build()
                ));

        p.setProgress(100);
        p.setCompleted(true);
        p.setCompletedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        progressRepository.save(p);

        // 2) progressMap
        Map<Long, UserProgress> progressMap = progressRepository.findAllByUser(user).stream()
                .filter(Objects::nonNull)
                .filter(x -> x.getLesson() != null && x.getLesson().getId() != null)
                .collect(Collectors.toMap(x -> x.getLesson().getId(), x -> x, (a, b) -> a));

        // 3) kullanıcı seviyesi (string normalizasyon)
        String userLevel = normalizeUserLevel(user.getLevel());
        String language = safeString(user.getLanguage(), currentLesson.getLanguage());

        // 4) seviye yükseltme (BEGINNER bitince INTERMEDIATE, INTERMEDIATE bitince ADVANCED)
        userLevel = promoteIfNeeded(user, userLevel, language, progressMap);

        // 5) next lesson bul (önce aynı seviye içinde sıradaki incomplete)
        Long nextId = findNextInSameLevel(language, currentLesson, progressMap);

        // 6) aynı seviye bittiyse sonraki seviyenin ilk incomplete dersi
        if (nextId == null) {
            String lvl = normalizeUserLevel(currentLesson.getLevel() != null ? currentLesson.getLevel().name() : userLevel);
            String nextLevel = nextLevelOf(lvl);
            while (nextLevel != null) {
                Long candidate = firstIncompleteId(language, nextLevel, progressMap);
                if (candidate != null) {
                    nextId = candidate;
                    break;
                }
                nextLevel = nextLevelOf(nextLevel);
            }
        }

        return NextLessonResponse.builder()
                .nextLessonId(nextId)
                .newUserLevel(userLevel)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProgress> getUserProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        return progressRepository.findAllByUser(user);
    }

    // 🔹 PYTHON ANALİZ SONUCUNU VERİTABANINA KAYDET
    @Override
    public void saveUserAnalysis(Long userId, Map<String, Object> requestBody, PythonAnalyzeResponse pythonResponse) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        String language = (String) requestBody.get("language");
        String level = pythonResponse.getLevel();
        Double score = pythonResponse.getScore() != null ? pythonResponse.getScore().doubleValue() : 0.0;
        Integer startTopicId = pythonResponse.getRecommended_start_topic();

        user.setLanguage(language);
        user.setLevel(level);
        user.setScore(score);
        user.setRoadmapStartTopicId(startTopicId);

        userRepository.save(user);
    }

    // ----------------- HELPERS -----------------

    private Long findNextInSameLevel(String language, Lesson currentLesson, Map<Long, UserProgress> progressMap) {
        String lvl = currentLesson.getLevel() != null ? currentLesson.getLevel().name() : "BEGINNER";

        List<Lesson> same = lessonRepository.findByLanguageIgnoreCaseAndLevelOrderByOrderIndexAsc(language, lvl);
        if (same == null || same.isEmpty()) return null;

        int idx = -1;
        for (int i = 0; i < same.size(); i++) {
            if (same.get(i).getId().equals(currentLesson.getId())) {
                idx = i;
                break;
            }
        }
        if (idx == -1) return null;

        for (int i = idx + 1; i < same.size(); i++) {
            Lesson l = same.get(i);
            UserProgress p = progressMap.get(l.getId());
            if (p == null || !p.isCompleted()) return l.getId();
        }
        return null;
    }

    private Long firstIncompleteId(String language, String level, Map<Long, UserProgress> progressMap) {
        List<Lesson> list = lessonRepository.findByLanguageIgnoreCaseAndLevelOrderByOrderIndexAsc(language, level);
        if (list == null || list.isEmpty()) return null;

        for (Lesson l : list) {
            UserProgress p = progressMap.get(l.getId());
            if (p == null || !p.isCompleted()) return l.getId();
        }
        return null;
    }

    private String promoteIfNeeded(User user, String userLevel, String language, Map<Long, UserProgress> progressMap) {

        if ("BEGINNER".equals(userLevel) && isAllCompleted(language, "BEGINNER", progressMap)) {
            userLevel = "INTERMEDIATE";
            user.setLevel(userLevel);
            userRepository.save(user);
        }

        if ("INTERMEDIATE".equals(userLevel) && isAllCompleted(language, "INTERMEDIATE", progressMap)) {
            userLevel = "ADVANCED";
            user.setLevel(userLevel);
            userRepository.save(user);
        }

        return userLevel;
    }

    private boolean isAllCompleted(String language, String level, Map<Long, UserProgress> progressMap) {
        List<Lesson> list = lessonRepository.findByLanguageIgnoreCaseAndLevelOrderByOrderIndexAsc(language, level);
        if (list == null || list.isEmpty()) return false;

        for (Lesson l : list) {
            UserProgress p = progressMap.get(l.getId());
            if (p == null || !p.isCompleted()) return false;
        }
        return true;
    }

    private String nextLevelOf(String level) {
        String l = normalizeUserLevel(level);
        if ("BEGINNER".equals(l)) return "INTERMEDIATE";
        if ("INTERMEDIATE".equals(l)) return "ADVANCED";
        return null;
    }

    private String safeString(String s, String def) {
        if (s == null) return def;
        String x = s.trim();
        return x.isEmpty() ? def : x;
    }

    private String normalizeUserLevel(String rawLevel) {
        if (rawLevel == null || rawLevel.trim().isEmpty()) return "BEGINNER";
        String level = rawLevel.trim().toUpperCase();

        if (level.equals("INDERMATE") || level.equals("INTERMATE")) return "INTERMEDIATE";
        if (level.equals("ILERI") || level.equals("İLERİ")) return "ADVANCED";
        if (level.equals("TEMEL")) return "BEGINNER";

        if (!LEVEL_ORDER.contains(level)) return "BEGINNER";
        return level;
    }
}

package com.devpath.backend.service;

import com.devpath.backend.DTO.Dashboard;
import com.devpath.backend.entity.Lesson;
import com.devpath.backend.entity.User;
import com.devpath.backend.entity.UserProgress;
import com.devpath.backend.repository.LessonRepository;
import com.devpath.backend.repository.UserProgressRepository;
import com.devpath.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final UserProgressRepository userProgressRepository;

    private static final List<String> LEVEL_ORDER = Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED");

    @Override
    @Transactional
    public Dashboard getDashboardData(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        String language = safeString(user.getLanguage(), "PYTHON");
        String userLevel = normalizeUserLevel(user.getLevel());

        // Progress map
        Map<Long, UserProgress> progressMap = createProgressMapSafely(user);

        // ✅ Seviye yükseltme
        userLevel = promoteIfNeeded(user, userLevel, language, progressMap);

        // ✅ 3 seviye dersin hepsi gelsin (üst seviye kilitli görünecek)
        List<String> fetchLevels = Arrays.asList("BEGINNER", "INTERMEDIATE", "ADVANCED");
        List<Lesson> allLessons = lessonRepository
                .findByLanguageIgnoreCaseAndLevelInOrderByOrderIndexAsc(language, fetchLevels);

        allLessons = removeDuplicateLessonsStrict(allLessons);

        // Level bazlı listeler
        List<Lesson> beginnerLessons = filterByLevel(allLessons, "BEGINNER");
        List<Lesson> intermediateLessons = filterByLevel(allLessons, "INTERMEDIATE");
        List<Lesson> advancedLessons = filterByLevel(allLessons, "ADVANCED");

        // ✅ Sırayla açılacak "tek açık ders" (her seviyede)
        Lesson currentBeginner = firstIncomplete(beginnerLessons, progressMap);
        Lesson currentIntermediate = firstIncomplete(intermediateLessons, progressMap);
        Lesson currentAdvanced = firstIncomplete(advancedLessons, progressMap);

        List<Dashboard.RoadmapItemDTO> roadmap = new ArrayList<>();

        for (Lesson lesson : allLessons) {
            if (lesson == null || lesson.getId() == null) continue;

            String lessonLevel = safeLevelFromLesson(lesson);

            UserProgress p = progressMap.get(lesson.getId());
            boolean completed = (p != null && p.isCompleted());

            int progressPercentage = completed ? 100 : (p != null ? clamp0to100(p.getProgress()) : 0);

            Dashboard.RoadmapStatus status = decideStatus(
                    userLevel,
                    lessonLevel,
                    lesson,
                    completed,
                    currentBeginner,
                    currentIntermediate,
                    currentAdvanced
            );

            if (status == Dashboard.RoadmapStatus.LOCKED) {
                progressPercentage = 0;
            }

            roadmap.add(
                    Dashboard.RoadmapItemDTO.builder()
                            .lessonId(lesson.getId())
                            .title(safeString(lesson.getTitle(), "Başlıksız Ders"))
                            .description(safeString(lesson.getDescription(), ""))
                            .videoUrl(lesson.getVideoUrl())
                            .estimatedMinutes(lesson.getEstimatedMinutes() != null ? lesson.getEstimatedMinutes() : 30)
                            .language(safeString(lesson.getLanguage(), language))
                            .topicId(parseTopicId(lesson.getTopicId())) // topicId String -> Integer
                            .lessonLevel(lessonLevel)
                            .status(status)
                            .progressPercentage(progressPercentage)
                            .build()
            );
        }

        return Dashboard.builder()
                .userFullName(user.getFullName())
                .language(language)
                .level(userLevel)
                .score(user.getScore())
                .roadmapStartTopicId(user.getRoadmapStartTopicId())
                .roadmap(roadmap)
                .build();
    }

    // ---------------- STATUS RULES ----------------
    private Dashboard.RoadmapStatus decideStatus(String userLevel,
                                                 String lessonLevel,
                                                 Lesson lesson,
                                                 boolean completed,
                                                 Lesson currentBeginner,
                                                 Lesson currentIntermediate,
                                                 Lesson currentAdvanced) {

        // Completed her zaman completed
        if (completed) return Dashboard.RoadmapStatus.COMPLETED;

        // Üst seviye her zaman kilitli (görünür)
        if (isAboveUserLevel(lessonLevel, userLevel)) {
            return Dashboard.RoadmapStatus.LOCKED;
        }

        // ✅ BEGINNER öğrenci: Beginner da Intermediate gibi sırayla açılır
        if ("BEGINNER".equals(userLevel)) {
            if ("BEGINNER".equals(lessonLevel)) {
                if (currentBeginner != null && lesson.getId().equals(currentBeginner.getId())) {
                    return Dashboard.RoadmapStatus.CURRENT;
                }
                return Dashboard.RoadmapStatus.LOCKED;
            }
            return Dashboard.RoadmapStatus.LOCKED;
        }

        // ✅ INTERMEDIATE öğrenci:
        // Beginner: açık (AVAILABLE)
        // Intermediate: sadece 1 CURRENT, diğerleri LOCKED
        if ("INTERMEDIATE".equals(userLevel)) {
            if ("BEGINNER".equals(lessonLevel)) {
                return Dashboard.RoadmapStatus.AVAILABLE;
            }
            if ("INTERMEDIATE".equals(lessonLevel)) {
                if (currentIntermediate != null && lesson.getId().equals(currentIntermediate.getId())) {
                    return Dashboard.RoadmapStatus.CURRENT;
                }
                return Dashboard.RoadmapStatus.LOCKED;
            }
            return Dashboard.RoadmapStatus.LOCKED; // advanced
        }

        // ✅ ADVANCED öğrenci:
        // Beginner + Intermediate: açık (AVAILABLE)
        // Advanced: sadece 1 CURRENT, diğerleri LOCKED
        if ("ADVANCED".equals(userLevel)) {
            if ("BEGINNER".equals(lessonLevel) || "INTERMEDIATE".equals(lessonLevel)) {
                return Dashboard.RoadmapStatus.AVAILABLE;
            }
            if ("ADVANCED".equals(lessonLevel)) {
                if (currentAdvanced != null && lesson.getId().equals(currentAdvanced.getId())) {
                    return Dashboard.RoadmapStatus.CURRENT;
                }
                return Dashboard.RoadmapStatus.LOCKED;
            }
        }

        return Dashboard.RoadmapStatus.LOCKED;
    }

    // ---------------- PROMOTION ----------------
    private String promoteIfNeeded(User user,
                                   String userLevel,
                                   String language,
                                   Map<Long, UserProgress> progressMap) {

        if ("BEGINNER".equals(userLevel)) {
            if (isAllCompleted(language, "BEGINNER", progressMap)) {
                userLevel = "INTERMEDIATE";
                user.setLevel(userLevel);
                userRepository.save(user);
            }
        }

        if ("INTERMEDIATE".equals(userLevel)) {
            if (isAllCompleted(language, "INTERMEDIATE", progressMap)) {
                userLevel = "ADVANCED";
                user.setLevel(userLevel);
                userRepository.save(user);
            }
        }

        return userLevel;
    }

    private boolean isAllCompleted(String language, String level, Map<Long, UserProgress> progressMap) {
        List<Lesson> levelLessons = lessonRepository
                .findByLanguageIgnoreCaseAndLevelInOrderByOrderIndexAsc(language, Collections.singletonList(level));

        if (levelLessons == null || levelLessons.isEmpty()) return false;

        for (Lesson l : levelLessons) {
            if (l == null || l.getId() == null) continue;
            UserProgress p = progressMap.get(l.getId());
            if (p == null || !p.isCompleted()) return false;
        }
        return true;
    }

    // ---------------- HELPERS ----------------

    private Lesson firstIncomplete(List<Lesson> lessons, Map<Long, UserProgress> progressMap) {
        if (lessons == null) return null;
        for (Lesson l : lessons) {
            if (l == null || l.getId() == null) continue;
            UserProgress p = progressMap.get(l.getId());
            if (p == null || !p.isCompleted()) return l;
        }
        return null;
    }

    private List<Lesson> filterByLevel(List<Lesson> all, String level) {
        if (all == null) return Collections.emptyList();
        String lv = safeLevelString(level);
        return all.stream()
                .filter(Objects::nonNull)
                .filter(l -> lv.equals(safeLevelFromLesson(l)))
                .collect(Collectors.toList());
    }

    private boolean isAboveUserLevel(String lessonLevel, String userLevel) {
        String l = safeLevelString(lessonLevel);
        String u = safeLevelString(userLevel);

        int li = LEVEL_ORDER.indexOf(l);
        int ui = LEVEL_ORDER.indexOf(u);

        if (ui == -1) ui = 0;   // userLevel bozuksa BEGINNER
        if (li == -1) return true;

        return li > ui;
    }

    private String safeLevelFromLesson(Lesson lesson) {
        String lessonLevel = "BEGINNER";
        try {
            if (lesson.getLevel() != null) {
                lessonLevel = lesson.getLevel().name();
            }
        } catch (Exception ignored) { }
        return safeLevelString(lessonLevel);
    }

    private String safeLevelString(String s) {
        if (s == null) return "BEGINNER";
        String x = s.trim().toUpperCase();
        if (x.isEmpty()) return "BEGINNER";
        return x;
    }

    private String safeString(String s, String def) {
        if (s == null) return def;
        String x = s.trim();
        return x.isEmpty() ? def : x;
    }

    private int clamp0to100(int v) {
        if (v < 0) return 0;
        if (v > 100) return 100;
        return v;
    }

    private Map<Long, UserProgress> createProgressMapSafely(User user) {
        Map<Long, UserProgress> map = new HashMap<>();
        try {
            List<UserProgress> list = userProgressRepository.findAllByUser(user);
            if (list != null) {
                for (UserProgress p : list) {
                    if (p != null && p.getLesson() != null && p.getLesson().getId() != null) {
                        map.put(p.getLesson().getId(), p);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Progress map oluşturulurken hata: " + e.getMessage());
        }
        return map;
    }

    private List<Lesson> removeDuplicateLessonsStrict(List<Lesson> lessons) {
        if (lessons == null || lessons.isEmpty()) return Collections.emptyList();

        Map<String, Lesson> unique = new LinkedHashMap<>();
        for (Lesson lesson : lessons) {
            if (lesson == null || lesson.getId() == null) continue;

            String key = lesson.getId() + "|" +
                    (lesson.getTitle() != null ? lesson.getTitle().hashCode() : "null") + "|" +
                    lesson.getOrderIndex();

            unique.putIfAbsent(key, lesson);
        }
        return new ArrayList<>(unique.values());
    }

    // ✅ Kullanıcı seviyesini normalize et (TR + yazım hataları dahil)
    private String normalizeUserLevel(String rawLevel) {
        if (rawLevel == null || rawLevel.trim().isEmpty()) return "BEGINNER";

        String level = rawLevel.trim().toUpperCase();

        Map<String, String> map = new HashMap<>();
        map.put("BEGINNER", "BEGINNER");
        map.put("BASIC", "BEGINNER");
        map.put("TEMEL", "BEGINNER");
        map.put("TEMEL DÜZEY", "BEGINNER");
        map.put("TEMEL DUZEY", "BEGINNER");

        map.put("INTERMEDIATE", "INTERMEDIATE");
        map.put("INDERMATE", "INTERMEDIATE");
        map.put("INTERMATE", "INTERMEDIATE");
        map.put("ORTA", "INTERMEDIATE");
        map.put("ORTA DÜZEY", "INTERMEDIATE");
        map.put("ORTA DUZEY", "INTERMEDIATE");

        map.put("ADVANCED", "ADVANCED");
        map.put("İLERİ", "ADVANCED");
        map.put("ILERI", "ADVANCED");
        map.put("İLERİ DÜZEY", "ADVANCED");
        map.put("ILERI DUZEY", "ADVANCED");

        String normalized = map.getOrDefault(level, level);
        normalized = safeLevelString(normalized);

        if (!LEVEL_ORDER.contains(normalized)) return "BEGINNER";
        return normalized;
    }

    // ✅ Lesson.topicId (String) -> Dashboard.topicId (Integer)
    private Integer parseTopicId(String topicId) {
        if (topicId == null) return 0;
        String s = topicId.trim();
        if (s.isEmpty()) return 0;

        String numeric = s.replaceAll("[^0-9]", "");
        if (numeric.isEmpty()) return 0;

        try {
            return Integer.parseInt(numeric);
        } catch (Exception e) {
            return 0;
        }
    }
}

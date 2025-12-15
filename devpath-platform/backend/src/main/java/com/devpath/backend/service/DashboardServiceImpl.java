package com.devpath.backend.service;

import com.devpath.backend.DTO.DashboardDTO;
import com.devpath.backend.entity.Lesson;
import com.devpath.backend.entity.User;
import com.devpath.backend.entity.UserProgress;
import com.devpath.backend.repository.LessonRepository;
import com.devpath.backend.repository.UserProgressRepository;
import com.devpath.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final UserProgressRepository userProgressRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardDTO getDashboardData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        List<Lesson> allLessons = lessonRepository.findAllByLanguageOrderByTopicIdAsc(user.getLanguage());

        Map<Long, UserProgress> progressMap = userProgressRepository.findAllByUser(user).stream()
                .collect(Collectors.toMap(p -> p.getLesson().getId(), p -> p));

        // Burada da parseTopicId kullandık:
        final Optional<Lesson> firstUncompletedLesson = allLessons.stream()
                .filter(lesson -> !progressMap.containsKey(lesson.getId()) || !Boolean.TRUE.equals(progressMap.get(lesson.getId()).getCompleted()))
                .min(Comparator.comparing(l -> parseTopicId(l.getTopicId())));

        Lesson currentLesson = firstUncompletedLesson.orElse(allLessons.isEmpty() ? null : allLessons.get(allLessons.size() - 1));

        List<DashboardDTO.RoadmapItemDTO> roadmapItems = allLessons.stream().map(lesson -> {
            DashboardDTO.RoadmapStatus status;
            int progressPercentage = 0;

            UserProgress progress = progressMap.get(lesson.getId());

            if (progress != null && Boolean.TRUE.equals(progress.getCompleted())) {
                status = DashboardDTO.RoadmapStatus.COMPLETED;
                progressPercentage = 100;
            } else if (currentLesson != null && lesson.getId().equals(currentLesson.getId())) {
                status = DashboardDTO.RoadmapStatus.CURRENT;
                if(progress != null) progressPercentage = progress.getProgress();
            } else {
                status = DashboardDTO.RoadmapStatus.LOCKED;
            }

            return DashboardDTO.RoadmapItemDTO.builder()
                    .lessonId(lesson.getId())
                    .title(lesson.getTitle())
                    .description(lesson.getDescription())
                    .videoUrl(lesson.getVideoUrl())
                    .estimatedMinutes(lesson.getEstimatedMinutes())
                    // İŞTE BURASI DÜZELDİ:
                    .topicId(parseTopicId(lesson.getTopicId())) 
                    .status(status)
                    .progressPercentage(progressPercentage)
                    .build();
        }).collect(Collectors.toList());

        return DashboardDTO.builder()
                .userFullName(user.getFullName())
                .language(user.getLanguage())
                .level(user.getLevel())
                .score(user.getScore())
                .roadmapStartTopicId(user.getRoadmapStartTopicId())
                .roadmap(roadmapItems)
                .build();
    }

    // String "1.2" gibi gelebilir, biz sadece baştaki sayıyı alalım veya direkt çevirelim
    private Integer parseTopicId(String topicId) {
        try {
            if (topicId == null) return 0;
            // Sadece sayıları al (örn: "1.2" -> "12" veya "topic_5" -> "5")
            // Daha basit mantık: Direkt integer çevirmeyi dene, olmazsa 0 dön.
            // Eğer "1.2" gibi geliyorsa ve sen 1. konuyu kastediyorsan, noktadan öncesini almalısın.
            // Şimdilik basitçe hepsini sayıya çevirmeyi deneyelim:
            return Integer.parseInt(topicId.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
package com.devpath.backend.service;

import com.devpath.backend.DTO.LessonDTO;
import com.devpath.backend.entity.Lesson;
import com.devpath.backend.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;

    @Override
    public List<LessonDTO> getAllLessons() {
        return lessonRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LessonDTO getLessonById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));
        return mapToDTO(lesson);
    }

    @Override
    public List<LessonDTO> getLessonsByLanguage(String language) {
        return lessonRepository.findByLanguage(language).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LessonDTO createLesson(LessonDTO lessonDTO) {
        Lesson lesson = mapToEntity(lessonDTO);
        Lesson savedLesson = lessonRepository.save(lesson);
        return mapToDTO(savedLesson);
    }

    @Override
    public LessonDTO updateLesson(Long id, LessonDTO lessonDTO) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        lesson.setTitle(lessonDTO.getTitle());
        lesson.setDescription(lessonDTO.getDescription());
        lesson.setVideoUrl(lessonDTO.getVideoUrl()); 
        lesson.setEstimatedMinutes(lessonDTO.getEstimatedMinutes());
        lesson.setOrderIndex(lessonDTO.getOrderIndex());
        lesson.setIsActive(lessonDTO.getIsActive());

        return mapToDTO(lessonRepository.save(lesson));
    }

    @Override
    public void deleteLesson(Long id) {
        lessonRepository.deleteById(id);
    }

    private LessonDTO mapToDTO(Lesson lesson) {
        return LessonDTO.builder()
                .id(lesson.getId())
                .language(lesson.getLanguage())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .orderIndex(lesson.getOrderIndex())
                .estimatedMinutes(lesson.getEstimatedMinutes())
                .videoUrl(lesson.getVideoUrl())
                .isActive(lesson.getIsActive())
                .build();
    }

    private Lesson mapToEntity(LessonDTO dto) {
        return Lesson.builder()
                .language(dto.getLanguage())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .orderIndex(dto.getOrderIndex())
                .estimatedMinutes(dto.getEstimatedMinutes())
                .videoUrl(dto.getVideoUrl())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }
}
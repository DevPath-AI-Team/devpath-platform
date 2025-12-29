package com.devpath.backend.Controller;

import com.devpath.backend.DTO.LessonDTO;
import com.devpath.backend.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    // Tüm dersleri getir
    @GetMapping
    public ResponseEntity<List<LessonDTO>> getAllLessons() {
        return ResponseEntity.ok(lessonService.getAllLessons());
    }

    // ID'ye göre ders getir (Düzeltildi: @PathVariable("id") eklendi)
    @GetMapping("/{id}")
    public ResponseEntity<LessonDTO> getLessonById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(lessonService.getLessonById(id));
    }

    // Dile göre dersleri getir (Düzeltildi: @PathVariable("language") eklendi)
    @GetMapping("/language/{language}")
    public ResponseEntity<List<LessonDTO>> getLessonsByLanguage(@PathVariable("language") String language) {
        return ResponseEntity.ok(lessonService.getLessonsByLanguage(language));
    }

    // Ders ekle
    @PostMapping
    public ResponseEntity<LessonDTO> createLesson(@RequestBody LessonDTO lessonDTO) {
        return ResponseEntity.ok(lessonService.createLesson(lessonDTO));
    }

    // Ders güncelle (Düzeltildi: @PathVariable("id") eklendi)
    @PutMapping("/{id}")
    public ResponseEntity<LessonDTO> updateLesson(@PathVariable("id") Long id, @RequestBody LessonDTO lessonDTO) {
        return ResponseEntity.ok(lessonService.updateLesson(id, lessonDTO));
    }

    // Ders sil (Düzeltildi: @PathVariable("id") eklendi)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable("id") Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}
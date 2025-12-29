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

    // ID'ye göre ders getir (Hata veren yer burasıydı, düzelttik)
    @GetMapping("/{id}")
    public ResponseEntity<LessonDTO> getLessonById(@PathVariable Long id) {
        // Eski kod: return lessonService.getLessonById(id).map(...) 
        // Yeni kod: Direkt ok() içine alıyoruz çünkü servis zaten bulamazsa hata fırlatıyor.
        return ResponseEntity.ok(lessonService.getLessonById(id));
    }

    // Dile göre dersleri getir
    @GetMapping("/language/{language}")
    public ResponseEntity<List<LessonDTO>> getLessonsByLanguage(@PathVariable String language) {
        return ResponseEntity.ok(lessonService.getLessonsByLanguage(language));
    }

    // Ders ekle
    @PostMapping
    public ResponseEntity<LessonDTO> createLesson(@RequestBody LessonDTO lessonDTO) {
        return ResponseEntity.ok(lessonService.createLesson(lessonDTO));
    }

    // Ders güncelle
    @PutMapping("/{id}")
    public ResponseEntity<LessonDTO> updateLesson(@PathVariable Long id, @RequestBody LessonDTO lessonDTO) {
        return ResponseEntity.ok(lessonService.updateLesson(id, lessonDTO));
    }

    // Ders sil
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}
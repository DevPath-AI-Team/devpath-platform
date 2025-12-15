package com.devpath.backend.controller;

import com.devpath.backend.DTO.NoteDTO;
import com.devpath.backend.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @GetMapping("/user/{userId}/lesson/{lessonId}")
    public ResponseEntity<NoteDTO> getNote(@PathVariable Long userId, @PathVariable Long lessonId) {
        Optional<NoteDTO> noteDTO = noteService.getNoteByUserAndLesson(userId, lessonId);
        return noteDTO.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NoteDTO>> getAllNotesByUser(@PathVariable Long userId) {
        List<NoteDTO> notes = noteService.getAllNotesByUser(userId);
        return ResponseEntity.ok(notes);
    }

    @PostMapping
    public ResponseEntity<NoteDTO> createOrUpdateNote(@RequestBody NoteDTO noteDTO) {
        NoteDTO savedNote = noteService.saveOrUpdateNote(noteDTO);
        return ResponseEntity.ok(savedNote);
    }
}

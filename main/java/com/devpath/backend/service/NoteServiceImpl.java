package com.devpath.backend.service;

import com.devpath.backend.DTO.NoteDTO;
import com.devpath.backend.entity.Lesson;
import com.devpath.backend.entity.Note;
import com.devpath.backend.entity.User;
import com.devpath.backend.repository.LessonRepository;
import com.devpath.backend.repository.NoteRepository;
import com.devpath.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NoteServiceImpl implements NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Override
    public Optional<NoteDTO> getNoteByUserAndLesson(Long userId, Long lessonId) {
        return noteRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(this::convertToDTO);
    }

    @Override
    public List<NoteDTO> getAllNotesByUser(Long userId) {
        return noteRepository.findAllByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NoteDTO saveOrUpdateNote(NoteDTO noteDTO) {
        User user = userRepository.findById(noteDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + noteDTO.getUserId()));

        Lesson lesson = lessonRepository.findById(noteDTO.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + noteDTO.getLessonId()));

        Note note = noteRepository.findByUserIdAndLessonId(noteDTO.getUserId(), noteDTO.getLessonId())
                .orElse(new Note());

        note.setUser(user);
        note.setLesson(lesson);
        note.setContent(noteDTO.getContent());

        Note savedNote = noteRepository.save(note);
        return convertToDTO(savedNote);
    }

    private NoteDTO convertToDTO(Note note) {
        return NoteDTO.builder()
                .id(note.getId())
                .content(note.getContent())
                .userId(note.getUser().getId())
                .lessonId(note.getLesson().getId())
                .build();
    }
}

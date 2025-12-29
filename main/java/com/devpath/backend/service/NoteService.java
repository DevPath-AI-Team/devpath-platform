package com.devpath.backend.service;

import com.devpath.backend.DTO.NoteDTO;

import java.util.List;
import java.util.Optional;

public interface NoteService {

    /**
     * Retrieves a note for a given user and lesson.
     * @param userId The ID of the user.
     * @param lessonId The ID of the lesson.
     * @return An Optional containing the NoteDTO if a note is found.
     */
    Optional<NoteDTO> getNoteByUserAndLesson(Long userId, Long lessonId);

    /**
     * Retrieves all notes for a specific user.
     * @param userId The ID of the user.
     * @return A list of NoteDTOs.
     */
    List<NoteDTO> getAllNotesByUser(Long userId);

    /**
     * Creates or updates a note for a user on a specific lesson.
     * If a note already exists, its content will be updated.
     * If not, a new note will be created.
     * @param noteDTO The DTO containing the note details (userId, lessonId, content).
     * @return The created or updated NoteDTO.
     */
    NoteDTO saveOrUpdateNote(NoteDTO noteDTO);
}

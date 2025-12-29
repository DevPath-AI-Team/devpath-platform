package com.devpath.backend.repository;

import com.devpath.backend.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {

    /**
     * Finds a note for a specific user and lesson.
     * Each user should only have one note per lesson.
     * @param userId The ID of the user.
     * @param lessonId The ID of the lesson.
     * @return An Optional containing the note if it exists.
     */
    Optional<Note> findByUserIdAndLessonId(Long userId, Long lessonId);

    /**
     * Finds all notes for a specific user.
     * @param userId The ID of the user.
     * @return A list of notes.
     */
    List<Note> findAllByUserId(Long userId);
}

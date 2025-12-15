import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BackButton from './BackButton';
import './Courses.css';
import axios from 'axios';

// İkonlar (Mevcut haliyle korunabilir)
const JavaIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
const PythonIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l10 10 10-10V2H12z" /><path d="M12 8v4" /><path d="M12 16v.01" /></svg>;
const JsIcon = () => <svg width="24" height="24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9a3 3 0 0 1 3-3v7a3 3 0 0 1-6 0v-1a3 3 0 0 1 3-3h0z"/><path d="M15 9a3 3 0 0 1 3-3v7a3 3 0 0 1-6 0v-1a3 3 0 0 1 3-3h0z"/></svg>;
const DbIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>;

const getLanguageIcon = (language) => {
    if (!language) return <DbIcon />;
    const lang = language.toUpperCase();
    switch (lang) {
        case 'JAVA': return <JavaIcon />;
        case 'PYTHON': return <PythonIcon />;
        case 'JAVASCRIPT': return <JsIcon />;
        default: return <DbIcon />;
    }
};

// Ders ve Notları Gösteren Bileşen
const CourseWithNotes = ({ lesson, note }) => {
    return (
        <div className="course-notes-card">
            <div className="course-header">
                <div className="course-icon">{getLanguageIcon(lesson.language)}</div>
                <h3 className="course-title">{lesson.title}</h3>
                <span className={`course-lang-tag ${lesson.language ? lesson.language.toLowerCase() : ''}`}>{lesson.language}</span>
            </div>
            <div className="notes-content">
                <h4>Aldığım Notlar:</h4>
                {note ? (
                    <pre className="notes-text">{note}</pre>
                ) : (
                    <p className="no-notes">Bu ders için henüz not alınmamış.</p>
                )}
            </div>
        </div>
    );
};

const Courses = () => {
    const [lessons, setLessons] = useState([]);
    const [notes, setNotes] = useState(new Map()); // Notları lessonId -> content şeklinde saklamak için Map
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        const fetchLessonsAndNotes = async () => {
            setIsLoading(true);
            try {
                // --- İKİ İSTEĞİ AYNI ANDA YAP ---
                const [lessonsResponse, notesResponse] = await Promise.all([
                    axios.get('http://localhost:8080/api/lessons'), // Tüm dersleri çek
                    axios.get(`http://localhost:8080/api/notes/user/${userId}`) // Kullanıcının tüm notlarını çek
                ]);

                setLessons(lessonsResponse.data);

                // Notları bir Map'e dönüştürerek erişimi kolaylaştır
                const notesMap = new Map();
                notesResponse.data.forEach(note => {
                    notesMap.set(note.lessonId, note.content);
                });
                setNotes(notesMap);

            } catch (err) {
                setError("Dersler ve notlar yüklenirken bir hata oluştu.");
                console.error("Veri çekme hatası:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessonsAndNotes();
    }, [userId, navigate]);

    return (
        <div className="courses-container">
            <main className="courses-content">
                <div className="courses-header">
                    <BackButton />
                    <h1>Tüm Derslerim ve Notlarım</h1>
                </div>
                
                {isLoading && <p>Dersler ve notlar yükleniyor...</p>}
                {error && <p className="error-message">{error}</p>}

                {!isLoading && !error && (
                    lessons.length > 0 ? (
                        <div className="courses-grid">
                            {lessons.map(lesson => (
                                <CourseWithNotes 
                                    key={lesson.lessonId} 
                                    lesson={lesson} 
                                    note={notes.get(lesson.lessonId)} // Map'ten notu al
                                />
                            ))}
                        </div>
                    ) : (
                        <p>Platformda henüz hiç ders bulunmuyor.</p>
                    )
                )}
            </main>
        </div>
    );
};

export default Courses;

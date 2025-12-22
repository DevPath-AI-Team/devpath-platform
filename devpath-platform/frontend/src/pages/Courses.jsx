import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Courses.css";

const Courses = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const API = "http://localhost:8080";
  
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
  
  const [notes, setNotes] = useState([]);
  const [lessons, setLessons] = useState({}); // lessonId -> lesson data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }

    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Kullanıcının tüm notlarını çek
        const notesResponse = await axios.get(
          `${API}/api/notes/user/${userId}`,
          auth
        );
        
        const notesData = notesResponse.data || [];
        setNotes(notesData);

        // Her not için ders bilgisini çek
        const lessonPromises = notesData.map(note => 
          axios.get(`${API}/api/lessons/${note.lessonId}`, auth)
            .then(res => ({ lessonId: note.lessonId, lesson: res.data }))
            .catch(err => {
              console.error(`Ders ${note.lessonId} yüklenemedi:`, err);
              return null;
            })
        );

        const lessonResults = await Promise.all(lessonPromises);
        const lessonsMap = {};
        lessonResults.forEach(result => {
          if (result) {
            lessonsMap[result.lessonId] = result.lesson;
          }
        });
        setLessons(lessonsMap);

      } catch (err) {
        console.error("Notlar yüklenemedi:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        } else {
          setError("Notlar yüklenirken bir hata oluştu.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [userId, token, auth, navigate]);

  const getLanguageColor = (language) => {
    const lang = language?.toUpperCase() || "";
    if (lang === "JAVA") return { bg: "#FFF2E6", color: "#D95400" };
    if (lang === "PYTHON") return { bg: "#E6F0FF", color: "#2D63A1" };
    if (lang === "JAVASCRIPT" || lang === "JS") return { bg: "#FFFBE6", color: "#B89B00" };
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/course/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="courses-container">
        <div className="courses-content">
          <div style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-container">
        <div className="courses-content">
          <div style={{ padding: "2rem", color: "red" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-content">
        <div className="courses-header">
          <h1>📚 Derslerim ve Notlarım</h1>
        </div>

        {notes.length === 0 ? (
          <div style={{ 
            padding: "3rem", 
            textAlign: "center", 
            color: "#6B7280",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
          }}>
            <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Henüz not almadınız</p>
            <p style={{ fontSize: "0.95rem" }}>Ders videolarını izlerken not alabilirsiniz.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {notes.map((note) => {
              const lesson = lessons[note.lessonId];
              if (!lesson) return null;

              const langColors = getLanguageColor(lesson.language);
              const notePreview = note.content.length > 200 
                ? note.content.substring(0, 200) + "..." 
                : note.content;

              return (
                <div 
                  key={note.id} 
                  className="course-notes-card"
                  onClick={() => handleLessonClick(note.lessonId)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="course-header">
                    <div className="course-icon">
                      <span style={{ fontSize: "2rem" }}>📝</span>
                    </div>
                    <div className="course-title">{lesson.title}</div>
                    <span 
                      className="course-lang-tag"
                      style={{ 
                        backgroundColor: langColors.bg, 
                        color: langColors.color 
                      }}
                    >
                      {lesson.language}
                    </span>
                  </div>

                  <div className="notes-content">
                    <h4>Notlarım:</h4>
                    <div className="notes-text">
                      {notePreview.split('\n').map((line, idx) => (
                        <p key={idx} style={{ margin: "0.5rem 0" }}>{line || "\u00A0"}</p>
                      ))}
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: "1rem", 
                    paddingTop: "1rem", 
                    borderTop: "1px solid #e5e7eb",
                    fontSize: "0.85rem",
                    color: "#6B7280"
                  }}>
                    Derse gitmek için tıklayın →
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

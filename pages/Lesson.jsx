import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import BackButton from './BackButton';
import './Lesson.css';

/* -------------------- Basit Kod Editörü -------------------- */
const CodeEditor = ({ value, onChange }) => {
  return (
    <textarea
      className="code-editor-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Kodunuzu buraya yazın..."
    />
  );
};

/* -------------------- YouTube Embed Helper (Sağlam) -------------------- */
const getEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const u = new URL(trimmed);

    // youtu.be/VIDEO_ID
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '').trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // youtube.com/watch?v=VIDEO_ID
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;

    // youtube.com/embed/VIDEO_ID
    if (u.pathname.startsWith('/embed/')) return trimmed;

    // youtube.com/shorts/VIDEO_ID
    if (u.pathname.startsWith('/shorts/')) {
      const id = u.pathname.split('/shorts/')[1]?.split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
};

/* -------------------- Lesson Page -------------------- */
const Lesson = () => {
  const { id } = useParams();
  const lessonId = Number(id); // ✅ güvenli: "374" -> 374
  const navigate = useNavigate();

  const userIdRaw = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const userId = userIdRaw ? Number(userIdRaw) : null;

  const [lessonData, setLessonData] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  const noteSaveTimeout = useRef(null);

  const API_BASE = 'http://localhost:8080';

  const config = useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  /* -------------------- Load Lesson & Note -------------------- */
  useEffect(() => {
    if (!userId || !token || !lessonId) {
      navigate('/login');
      return;
    }

    const fetchLessonAndNote = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // ✅ Ders bilgisi
        const lessonResponse = await axios.get(
          `${API_BASE}/api/lessons/${lessonId}`,
          config
        );
        setLessonData(lessonResponse.data);

        // ✅ Note kısmı (dokunmadım — sende kalsın)
        try {
          const noteResponse = await axios.get(
            `${API_BASE}/api/notes/user/${userId}/lesson/${lessonId}`,
            config
          );
          setNoteContent(noteResponse.data?.content || '');
        } catch (noteErr) {
          if (noteErr.response?.status === 404) {
            setNoteContent('');
          } else if (noteErr.response?.status === 403) {
            navigate('/login');
          } else {
            console.error('Not yükleme hatası:', noteErr);
          }
        }
      } catch (err) {
        setError('Ders bilgileri yüklenirken hata oluştu.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonAndNote();
  }, [lessonId, userId, token, navigate, config]);

  /* -------------------- Save Note -------------------- */
  const handleSaveNote = async () => {
    if (noteSaveTimeout.current) clearTimeout(noteSaveTimeout.current);

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/notes`,
        {
          userId,     // ✅ number
          lessonId,   // ✅ number
          content: noteContent,
        },
        config
      );

      setSaveStatus('Not başarıyla kaydedildi.');
    } catch (err) {
      console.error(err);
      setSaveStatus('Not kaydedilemedi.');
    } finally {
      noteSaveTimeout.current = setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const embedUrl = useMemo(
    () => getEmbedUrl(lessonData?.videoUrl),
    [lessonData?.videoUrl]
  );

  useEffect(() => {
    console.log('videoUrl:', lessonData?.videoUrl);
    console.log('embedUrl:', embedUrl);
  }, [lessonData?.videoUrl, embedUrl]);

  /* -------------------- Render -------------------- */
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ padding: '2rem' }}>
          <BackButton />

          {isLoading && <div>Yükleniyor...</div>}
          {error && <div className="error-message">{error}</div>}

          {lessonData && (
            <div className="lesson-layout">
              {/* SOL: Video */}
              <div className="lesson-left-column">
                <h1 className="lesson-title">{lessonData.title}</h1>
                <p className="lesson-description">{lessonData.description}</p>

                {embedUrl ? (
                  <div className="video-player-wrapper">
                    <iframe
                      src={embedUrl}
                      title={lessonData.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="error-message">
                    Bu ders için video eklenmemiş veya link formatı uygun değil.
                  </div>
                )}
              </div>

              {/* SAĞ: Kod Editörü */}
              <div className="lesson-right-column">
                <div className="editor-container">
                  <h3 className="editor-header">Online Kod Editörü</h3>
                  <CodeEditor value={codeContent} onChange={setCodeContent} />
                </div>
              </div>
            </div>
          )}

          {/* ALT: Notlar */}
          {!isLoading && (
            <div className="notes-section">
              <h3 className="notes-header">Derse Özel Notların</h3>
              <textarea
                className="notes-textarea"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Bu dersle ilgili notlarınızı buraya yazın..."
              />
              <div className="notes-footer">
                <button className="save-note-btn" onClick={handleSaveNote}>
                  Notları Kaydet
                </button>
                {saveStatus && (
                  <span className="save-status-message">{saveStatus}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Lesson;

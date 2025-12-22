import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BackButton from "./BackButton";
import "./Lesson.css";

/* -------------------- Online Code Editor -------------------- */
const OnlineCodeEditor = ({ language = "python" }) => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideLoaded, setPyodideLoaded] = useState(false);
  const pyodideRef = useRef(null);
  
  // Python için örnek kod
  const defaultPythonCode = `# Python kodunuzu buraya yazın
print("Merhaba Dünya!")
x = 10
y = 20
print(f"Toplam: {x + y}")

# Örnek: Liste işlemleri
liste = [1, 2, 3, 4, 5]
print(f"Liste: {liste}")
print(f"Toplam: {sum(liste)}")`;
  
  // Pyodide'i yükle (Python için)
  useEffect(() => {
    if (language?.toLowerCase() === "python" && !pyodideLoaded) {
      const loadPyodide = async () => {
        try {
          // Pyodide CDN'den yükle
          if (!window.loadPyodide) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            document.body.appendChild(script);
            
            script.onload = async () => {
              try {
                window.pyodide = await window.loadPyodide({
                  indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
                });
                pyodideRef.current = window.pyodide;
                setPyodideLoaded(true);
                setOutput("✅ Python derleyicisi hazır! Kodunuzu yazıp çalıştırabilirsiniz.");
              } catch (err) {
                setOutput(`❌ Python derleyicisi yüklenemedi: ${err.message}`);
              }
            };
          } else {
            window.pyodide = await window.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
            });
            pyodideRef.current = window.pyodide;
            setPyodideLoaded(true);
            setOutput("✅ Python derleyicisi hazır! Kodunuzu yazıp çalıştırabilirsiniz.");
          }
        } catch (error) {
          console.error("Pyodide yükleme hatası:", error);
          setOutput("❌ Python derleyicisi yüklenemedi. Lütfen sayfayı yenileyin.");
        }
      };
      
      loadPyodide();
    }
  }, [language, pyodideLoaded]);
  
  useEffect(() => {
    if (language?.toLowerCase() === "python") {
      setCode(defaultPythonCode);
      setOutput(pyodideLoaded ? "✅ Python derleyicisi hazır!" : "⏳ Python derleyicisi yükleniyor...");
    }
  }, [language, pyodideLoaded]);
  
  const handleRunCode = async () => {
    if (language?.toLowerCase() !== "python") {
      setOutput("Şu an sadece Python dili desteklenmektedir.");
      return;
    }
    
    setIsRunning(true);
    setOutput("⏳ Kod çalıştırılıyor...");
    
    try {
      if (!pyodideLoaded || !pyodideRef.current) {
        setOutput("❌ Python derleyicisi henüz yüklenmedi. Lütfen bekleyin...");
        setIsRunning(false);
        return;
      }
      
      // Pyodide'in stdout yakalama mekanizması
      let outputText = "";
      
      // stdout'u yakalamak için
      pyodideRef.current.runPython(`
import sys
from io import StringIO
_stdout_buffer = StringIO()
sys.stdout = _stdout_buffer
`);
      
      // Python kodunu çalıştır
      try {
        pyodideRef.current.runPython(code);
        // stdout'u al
        outputText = pyodideRef.current.runPython("_stdout_buffer.getvalue()");
      } catch (pyError) {
        // Hata varsa göster
        const errorMsg = pyError.toString();
        setOutput(`❌ Hata:\n${errorMsg}`);
        setIsRunning(false);
        return;
      }
      
      // stdout'u geri yükle
      pyodideRef.current.runPython("sys.stdout = sys.__stdout__");
      
      setOutput(outputText || "✅ Kod başarıyla çalıştırıldı (çıktı yok)");
    } catch (error) {
      setOutput(`❌ Hata: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="online-editor-wrapper">
      <div className="editor-header">
        <span>💻 Python Derleyici</span>
        {pyodideLoaded && (
          <span style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: "500" }}>
            ✅ Hazır
          </span>
        )}
      </div>
      
      <div className="code-editor-container">
        <div className="code-editor-toolbar">
          <span style={{ fontSize: "0.9rem", color: "#6B7280" }}>
            Dil: PYTHON
          </span>
          <button 
            onClick={handleRunCode}
            disabled={isRunning}
            className="run-code-btn"
          >
            {isRunning ? "⏳ Çalıştırılıyor..." : "▶ Çalıştır"}
          </button>
        </div>
        
        <textarea
          className="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kodunuzu buraya yazın..."
          spellCheck={false}
        />
        
        <div className="code-output">
          <div className="output-header">Çıktı:</div>
          <pre className="output-content">
            {output || "Çıktı burada görünecek..."}
          </pre>
        </div>
      </div>
    </div>
  );
};

/* -------------------- YouTube ID Extract -------------------- */
const extractYoutubeId = (url) => {
  if (!url) return null;
  const match = url.match(/[?&]v=([^&]+)/) || 
                url.match(/youtu\.be\/([^?]+)/) || 
                url.match(/embed\/([^?]+)/);
  return match ? match[1] : null;
};

/* -------------------- Lesson Component -------------------- */
const Lesson = () => {
  const { id } = useParams();
  const lessonId = Number(id);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = Number(localStorage.getItem("userId"));
  const API = "http://localhost:8080";

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Not alma state'leri
  const [noteContent, setNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaveStatus, setNoteSaveStatus] = useState("");

  const playerRef = useRef(null);
  const playerHostRef = useRef(null);
  const autoNavigateRef = useRef(false);

  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  // Sayfa değiştiğinde (ID değiştiğinde) tüm durumları sıfırla
  useEffect(() => {
    setLesson(null);
    setIsEnded(false);
    autoNavigateRef.current = false;
    setLoading(true);
  }, [lessonId]);

  // Ders verisini çek ve notu yükle
  useEffect(() => {
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    const loadLessonData = async () => {
      try {
        const { data } = await axios.get(`${API}/api/lessons/${lessonId}`, config);
        setLesson(data);
        
        // Progress ve diğer istekler opsiyoneldir, hata alsa da dersi göster
        axios.post(`${API}/api/progress/start?userId=${userId}&lessonId=${lessonId}`, null, config).catch(() => {});
        
        // Notu yükle
        try {
          const noteResponse = await axios.get(
            `${API}/api/notes/user/${userId}/lesson/${lessonId}`,
            config
          );
          if (noteResponse.data && noteResponse.data.content) {
            setNoteContent(noteResponse.data.content);
          }
        } catch (noteError) {
          // Not yoksa hata verme, sadece boş bırak
          if (noteError.response?.status !== 404) {
            console.error("Not yüklenemedi:", noteError);
          }
        }
      } catch (error) {
        console.error("Ders yüklenemedi:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [lessonId, config, navigate, token, userId]);

  // YouTube Oynatıcı Yönetimi
  const videoId = useMemo(() => extractYoutubeId(lesson?.videoUrl), [lesson]);

  useEffect(() => {
    if (!videoId || loading) return;

    const onPlayerReady = () => {
      console.log("YouTube Player Hazır");
    };

    const onPlayerStateChange = (event) => {
      // event.data === 0 videonun bittiğini temsil eder (YT.PlayerState.ENDED)
      if (event.data === 0) {
        setIsEnded(true);
      }
    };

    const createPlayer = () => {
      if (window.YT && window.YT.Player && playerHostRef.current) {
        playerRef.current = new window.YT.Player(playerHostRef.current, {
          height: '400',
          width: '100%',
          videoId: videoId,
          playerVars: { 'autoplay': 0, 'rel': 0 },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
    };

    // YouTube Script kontrolü
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, loading]);

  // Tamamla ve Sonrakine Geç
  const completeAndNext = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await axios.put(
        `${API}/api/progress/complete-next?userId=${userId}&lessonId=${lessonId}`,
        null, config
      );

      const nextId = res.data?.nextLessonId;
      if (nextId) {
        // App.js rotanıza göre burası kesinlikle /course/ olmalı
        navigate(`/course/${nextId}`, { replace: true });
      } else {
        navigate("/roadmap", { replace: true });
      }
    } catch (error) {
      console.error("Geçiş hatası:", error);
      alert("Bir sonraki derse geçilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  }, [lessonId, userId, config, navigate, isSubmitting]);

  // Otomatik geçiş
  useEffect(() => {
    if (isEnded && !autoNavigateRef.current) {
      autoNavigateRef.current = true;
      setTimeout(completeAndNext, 1000);
    }
  }, [isEnded, completeAndNext]);

  // Not kaydetme fonksiyonu
  const saveNote = async () => {
    if (!userId || !lessonId) return;
    
    setIsSavingNote(true);
    setNoteSaveStatus("");
    
    try {
      await axios.post(
        `${API}/api/notes`,
        {
          userId: userId,
          lessonId: lessonId,
          content: noteContent
        },
        config
      );
      setNoteSaveStatus("✅ Not kaydedildi!");
      setTimeout(() => setNoteSaveStatus(""), 3000);
    } catch (error) {
      console.error("Not kaydedilemedi:", error);
      setNoteSaveStatus("❌ Not kaydedilemedi. Lütfen tekrar deneyin.");
      setTimeout(() => setNoteSaveStatus(""), 5000);
    } finally {
      setIsSavingNote(false);
    }
  };

  if (loading) return <div style={{padding: "50px"}}>Ders yükleniyor...</div>;

  if (!lesson) {
    return <div style={{padding: "50px"}}>Ders bulunamadı.</div>;
  }

  return (
    <div style={{ width: "100%", height: "100%", padding: "0 1.5rem 2rem 1.5rem", overflowX: "hidden", boxSizing: "border-box" }}>
      <div style={{ paddingTop: "0", marginBottom: "1rem" }}>
        <BackButton />
      </div>
      
      <div className="lesson-layout">
        <div className="lesson-left-column">
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          
          <div className="video-player-wrapper">
            {/* Oynatıcı bu div içine yerleşecek */}
            <div ref={playerHostRef}></div>
          </div>

          <div style={{ marginTop: 20, color: "#2563eb", fontWeight: "bold" }}>
            {isEnded ? "✅ Video bitti! Yönlendiriliyorsunuz..." : "⏳ Video izleniyor..."}
          </div>

          {/* Sonraki Ders Butonu */}
          <button
            onClick={completeAndNext}
            disabled={!isEnded || isSubmitting}
            className="next-lesson-btn"
            style={{
              marginTop: "1.5rem",
              padding: "12px 25px", 
              borderRadius: "8px",
              backgroundColor: isEnded ? "#2563eb" : "#ccc",
              color: "#fff", 
              border: "none", 
              cursor: isEnded ? "pointer" : "default",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              transition: "all 0.2s ease",
              fontSize: "1rem",
              fontWeight: "600",
              width: "100%",
              maxWidth: "300px"
            }}
          >
            {isSubmitting ? "Lütfen bekleyin..." : "Sonraki Ders ▶"}
          </button>

          {/* Not Alma Bölümü */}
          <div className="notes-section">
            <h2 className="notes-header">📝 Notlarım</h2>
            <textarea
              className="notes-textarea"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Bu ders hakkında notlarınızı buraya yazabilirsiniz..."
            />
            <div className="notes-footer">
              <button
                className="save-note-btn"
                onClick={saveNote}
                disabled={isSavingNote}
              >
                {isSavingNote ? "Kaydediliyor..." : "💾 Notu Kaydet"}
              </button>
              {noteSaveStatus && (
                <span className={noteSaveStatus.includes("✅") ? "save-status-message" : "error-message"}>
                  {noteSaveStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="lesson-right-column">
          <OnlineCodeEditor language={lesson?.language?.toLowerCase() || "python"} />
        </div>
      </div>
    </div>
  );
};

export default Lesson;
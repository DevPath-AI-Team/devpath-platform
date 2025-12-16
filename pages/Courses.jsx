import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

console.log("✅ COURSE COMPONENT ÇALIŞTI");

// ✅ SQL'deki format: https://www.youtube.com/watch?v=...&list=...&index=...
function extractYoutubeId(url) {
  if (!url) return null;

  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watch) return watch[1];

  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return short[1];

  const embed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embed) return embed[1];

  return null;
}

function loadYouTubeIframeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve();

    const existing = document.getElementById("youtube-iframe-api");
    if (existing) {
      const check = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(check);
          resolve();
        }
      }, 50);
      return;
    }

    const tag = document.createElement("script");
    tag.id = "youtube-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    window.onYouTubeIframeAPIReady = () => resolve();
    document.body.appendChild(tag);
  });
}

const Course = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [isEnded, setIsEnded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const playerHostRef = useRef(null);
  const playerRef = useRef(null);

  const videoId = useMemo(() => extractYoutubeId(lesson?.videoUrl), [lesson]);

  // ✅ ders çek + start
  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }

    const run = async () => {
      setLoading(true);
      setErr(null);
      setIsEnded(false);

      try {
        const res = await axios.get(`http://localhost:8080/api/lessons/${lessonId}`, auth);
        setLesson(res.data);

        await axios.post(
          `http://localhost:8080/api/progress/start?userId=${userId}&lessonId=${lessonId}`,
          null,
          auth
        );
      } catch (e) {
        console.error(e);
        setErr("Ders yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [lessonId, userId, token, auth, navigate]);

  // ✅ YouTube ENDED yakala
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // video yoksa player kurma
      if (!videoId) return;
      if (!playerHostRef.current) return;

      await loadYouTubeIframeAPI();
      if (cancelled) return;

      // eski player temizle
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch {}
      }

      playerRef.current = new window.YT.Player(playerHostRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsEnded(true);
            }
          }
        }
      });
    };

    init();

    return () => {
      cancelled = true;
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch {}
      }
    };
  }, [videoId]);

  // ✅ fixed buton tıklanınca: complete-next -> direkt next derse git
  const goNext = async () => {
    if (!videoId) {
      alert("Video linkinden videoId çıkarılamadı. videoUrl formatını kontrol et.");
      return;
    }
    if (!isEnded) {
      alert("Sonraki derse geçmek için videoyu bitirmelisin.");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await axios.put(
        `http://localhost:8080/api/progress/complete-next?userId=${userId}&lessonId=${lessonId}`,
        null,
        auth
      );

      const nextLessonId = res?.data?.nextLessonId;

      if (nextLessonId) {
        navigate(`/course/${nextLessonId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (e) {
      console.error(e);
      alert("Tamamlama / sonraki ders alınamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Yükleniyor...</div>;
  if (err) return <div style={{ padding: 16, color: "red" }}>{err}</div>;
  if (!lesson) return null;

  return (
    <div style={{ padding: 16, paddingBottom: 90 }}>
      <h2 style={{ marginBottom: 6 }}>{lesson.title}</h2>
      <p style={{ marginTop: 0 }}>{lesson.description}</p>

      {/* ✅ Video */}
      <div style={{ marginTop: 16 }}>
        {videoId ? (
          <div ref={playerHostRef} />
        ) : (
          <p style={{ color: "crimson" }}>
            videoUrl’den videoId çıkarılamadı: <br />
            <code>{lesson.videoUrl}</code>
          </p>
        )}
      </div>

      {/* ✅ Bilgi satırı */}
      <div style={{ marginTop: 14, fontSize: 14 }}>
        {!videoId
          ? "❌ Video ID bulunamadı"
          : isEnded
            ? "✅ Video bitti (Sonraki ders aktif)"
            : "⏳ Video bitince Sonraki ders aktif olacak"}
      </div>

      {/* ✅ SABİT BUTON: HER ŞARTTA GÖRÜNÜR */}
      <button
        onClick={goNext}
        disabled={!videoId || !isEnded || isSubmitting}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 999999,
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          cursor: (!videoId || !isEnded || isSubmitting) ? "not-allowed" : "pointer",
          opacity: (!videoId || !isEnded || isSubmitting) ? 0.6 : 1,
          background: "#2563eb",
          color: "white",
          fontWeight: 700
        }}
      >
        {isSubmitting ? "Yükleniyor..." : "Sonraki Ders ▶"}
      </button>
    </div>
  );
};

export default Course;

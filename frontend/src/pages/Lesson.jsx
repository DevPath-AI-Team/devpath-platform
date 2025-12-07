import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import Chatbot from "./Chatbot"; // Chatbot bileşenini import ettik
import '../pages/Chatbot.css';    // Chatbot stillerini çağırdık
import './Lesson.css';

// --- İKONLAR (Dashboard'dan aldık) ---
const RobotIcon = () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>;

// --- GEÇİCİ VERİ (Database gelince burası değişecek) ---
const courseData = {
  1: {
    title: "Java ile Nesne Yönelimli Programlama",
    videos: [
      { id: 101, title: "1. Giriş ve Kurulum", url: "https://www.youtube.com/watch?v=f47L4K3h46I" },
      { id: 102, title: "2. Değişkenler ve Veri Tipleri", url: "https://www.youtube.com/watch?v=M5G8f42R0hY" },
      { id: 103, title: "3. Class ve Object Mantığı", url: "https://www.youtube.com/watch?v=Jj3j5Q7oEcs" },
    ]
  },
  2: {
    title: "Python: Veri Bilimine Giriş",
    videos: [
      { id: 201, title: "1. Python'a Giriş", url: "https://www.youtube.com/watch?v=c2ZeZ0x5lX4" },
      { id: 202, title: "2. Listeler ve Sözlükler", url: "https://www.youtube.com/watch?v=1u3-jXWqZq8" },
    ]
  }
};

const Lesson = () => {
  const { id } = useParams();
  const course = courseData[id] || courseData[1];
  
  const [activeVideo, setActiveVideo] = useState(course.videos[0]);
  const [activeTab, setActiveTab] = useState('chapters'); // 'chapters' veya 'notes'
  const [showChat, setShowChat] = useState(false); // Floating Chatbot kontrolü

  // --- NOT DEFTERİ MANTIĞI (localStorage ile kaydetme) ---
  const [note, setNote] = useState(() => {
    return localStorage.getItem(`note_course_${id}`) || "";
  });

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    localStorage.setItem(`note_course_${id}`, newNote);
  };

  return (
    <div className="lesson-container">
      {/* Üst Bar */}
      <header className="lesson-header">
        <Link to="/dashboard" className="back-btn">
          ← Panele Dön
        </Link>
        <span style={{fontWeight: 'bold', color: '#1f2937'}}>{course.title}</span>
        <div style={{width: '80px'}}></div>
      </header>

      <div className="lesson-content">
        {/* SOL: Video Oynatıcı */}
        <div className="video-section">
          <ReactPlayer 
            url={activeVideo.url}
            controls={true}
            width="100%"
            height="100%"
            playing={false} 
          />
        </div>

        {/* SAĞ: İçerik ve Notlar */}
        <div className="sidebar-content">
          {/* Tab Başlıkları */}
          <div className="tabs-header">
            <button 
                className={`tab-btn ${activeTab === 'chapters' ? 'active' : ''}`}
                onClick={() => setActiveTab('chapters')}
            >
                Bölümler
            </button>
            <button 
                className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
            >
                Not Defterim ✏️
            </button>
          </div>

          {/* Tab İçerikleri */}
          <div className="tab-content">
            {activeTab === 'chapters' ? (
                <div>
                    <h4 style={{marginBottom: '15px', color: '#374151'}}>Ders Listesi</h4>
                    {course.videos.map((vid) => (
                        <div 
                            key={vid.id} 
                            className={`chapter-item ${activeVideo.id === vid.id ? 'active' : ''}`}
                            onClick={() => setActiveVideo(vid)}
                        >
                            <div className="play-icon">▶</div>
                            <span style={{fontSize: '0.9rem'}}>{vid.title}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="notepad-container">
                    <p style={{fontSize:'0.85rem', color:'#6b7280', marginBottom:'8px'}}>
                        Bu ders için aldığın notlar otomatik kaydedilir.
                    </p>
                    <textarea 
                        className="notepad-area"
                        placeholder="Önemli noktaları buraya not al..."
                        value={note}
                        onChange={handleNoteChange}
                    ></textarea>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- FLOATING AI BUTTON (Dashboard ile aynı) --- */}
      <div className="ai-fab" title="AI Asistan'a Sor" onClick={() => setShowChat(true)}>
        <RobotIcon />
      </div>

      {showChat && <Chatbot onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default Lesson;
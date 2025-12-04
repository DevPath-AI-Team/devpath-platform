import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import './Lesson.css';

// --- GEÇİCİ VERİ (Database gelince burası değişecek) ---
const courseData = {
  1: { // Java ID
    title: "Java ile Nesne Yönelimli Programlama",
    videos: [
      { id: 101, title: "1. Giriş ve Kurulum", url: "https://www.youtube.com/watch?v=f47L4K3h46I" }, // Örnek Link
      { id: 102, title: "2. Değişkenler ve Veri Tipleri", url: "https://www.youtube.com/watch?v=M5G8f42R0hY" },
      { id: 103, title: "3. Class ve Object Mantığı", url: "https://www.youtube.com/watch?v=Jj3j5Q7oEcs" },
    ]
  },
  2: { // Python ID
    title: "Python: Veri Bilimine Giriş",
    videos: [
      { id: 201, title: "1. Python'a Giriş", url: "https://www.youtube.com/watch?v=c2ZeZ0x5lX4" },
      { id: 202, title: "2. Listeler ve Sözlükler", url: "https://www.youtube.com/watch?v=1u3-jXWqZq8" },
    ]
  }
};

const Lesson = () => {
  const { id } = useParams(); // URL'den ID'yi al (örn: /course/1)
  const course = courseData[id] || courseData[1]; // Bulamazsa Java'yı aç
  
  const [activeVideo, setActiveVideo] = useState(course.videos[0]);
  const [activeTab, setActiveTab] = useState('chapters'); // chapters veya chat

  return (
    <div className="lesson-container">
      {/* Üst Bar */}
      <header className="lesson-header">
        <Link to="/dashboard" className="back-btn">
          ← Panele Dön
        </Link>
        <span style={{fontWeight: 'bold', color: '#1f2937'}}>{course.title}</span>
        <div style={{width: '80px'}}></div> {/* Hizalama için boşluk */}
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

        {/* SAĞ: İçerik ve AI */}
        <div className="sidebar-content">
          {/* Tab Başlıkları */}
          <div className="tabs-header">
            <button 
                className={`tab-btn ${activeTab === 'chapters' ? 'active' : ''}`}
                onClick={() => setActiveTab('chapters')}
            >
                Ders İçeriği
            </button>
            <button 
                className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
            >
                AI Asistan (Beta)
            </button>
          </div>

          {/* Tab İçerikleri */}
          <div className="tab-content">
            {activeTab === 'chapters' ? (
                <div>
                    <h4 style={{marginBottom: '15px', color: '#374151'}}>Bölümler</h4>
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
                <div className="chat-placeholder">
                    <p>🤖 Merhaba!</p>
                    <p style={{fontSize:'0.9rem'}}>Ben DevPath Asistanıyım.</p>
                    <p style={{fontSize:'0.8rem', marginTop:'10px'}}>
                        Beyza arkadaşlarım beni geliştirdiğinde,<br/>
                        burada videodaki takıldığın yerleri bana sorabileceksin.
                    </p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
import React, { useState, useEffect } from 'react';
import './Roadmap.css'; // Yeni CSS dosyamızı import ediyoruz
import { useNavigate } from 'react-router-dom';

// --- İKONLAR ---
const CheckCircle = ({ color }) => <svg width="24" height="24" fill={color} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const Lock = () => <svg width="24" height="24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const PlayCircle = () => <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>;
const Clock = () => <svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;

// --- MOCK API VERİSİ (Backend'den gelecek format) ---
const mockRoadmap = {
    user_id: "ilknur_y",
    level: "intermediate",
    language: "Python",
    recommended_start: 13,
    estimated_hours: 64,
    timeline: [
        { id: 1, title: "Python Giriş & Kurulum", description: "Temel yapıyı kurma.", status: "completed", estimated_time: 4, type: "beginner" },
        { id: 2, title: "Değişkenler ve Tipler", description: "Veri depolama yolları.", status: "completed", estimated_time: 3, type: "beginner" },
        { id: 10, title: "Tuple & Set", description: "Özel veri yapıları.", status: "completed", estimated_time: 4, type: "beginner" },
        { id: 11, title: "Sözlükler (Weak Topic)", description: "Key-Value mantığı. **Tekrar etmelisin!**", status: "review", estimated_time: 5, type: "beginner" },
        
        // BAŞLANGIÇ NOKTASI (Recommended Start)
        { id: 13, title: "Fonksiyonlar - İleri", description: "*args, **kwargs, lambda.", status: "current", estimated_time: 6, type: "intermediate" },
        { id: 15, title: "Dosya İşlemleri", description: "Dosya okuma ve yazma (I/O).", status: "upcoming", estimated_time: 4, type: "intermediate" },
        { id: 17, title: "OOP - Giriş", description: "Sınıf ve Nesne mantığı.", status: "upcoming", estimated_time: 7, type: "intermediate" },
        { id: 29, title: "Multithreading", description: "İleri seviye paralel programlama.", status: "locked", estimated_time: 8, type: "advanced" },
        { id: 31, title: "Async/Await", description: "Asenkron programlama.", status: "locked", estimated_time: 9, type: "advanced" },
    ]
};

// --- BİLEŞEN: Timeline Öğesi ---
const TimelineItem = ({ item, navigate }) => {
    // Statüye göre stil belirleme
    let statusClass = `item-${item.status}`;
    let icon = <PlayCircle />;
    let buttonText = "Derse Başla";
    let isClickable = true;

    if (item.status === 'completed') {
        icon = <CheckCircle color="#10b981" />; // Yeşil
        buttonText = "Tamamlandı";
        isClickable = false;
    } else if (item.status === 'review') {
        icon = <CheckCircle color="#f59e0b" />; // Sarı/Turuncu (Tekrar)
        buttonText = "Tekrar Gözden Geçir";
        isClickable = true;
    } else if (item.status === 'locked') {
        icon = <Lock />;
        buttonText = "Kilitli";
        isClickable = false;
    } else if (item.status === 'current') {
        icon = <PlayCircle />;
        buttonText = "Şimdi Başla";
        statusClass += ' pulse-animation';
        isClickable = true;
    } else if (item.status === 'upcoming') {
        icon = <PlayCircle />;
        buttonText = "Sıraya Ekle";
        isClickable = false;
    }
    
    // Tıklandığında /course/ID'ye yönlendir
    const handleClick = () => {
        if (isClickable) {
            navigate(`/course/${item.id}`);
        }
    };

    return (
        <div className={`timeline-item ${statusClass}`} onClick={handleClick} style={{ cursor: isClickable ? 'pointer' : 'default' }}>
            <div className="timeline-icon">
                {icon}
            </div>
            <div className="timeline-content">
                <div className="timeline-header">
                    <h3 className="timeline-title">{item.title}</h3>
                    <div className="timeline-badge type-badge">{item.type}</div>
                </div>
                <p className="timeline-description">{item.description}</p>
                <div className="timeline-footer">
                    <div className="time-info">
                        <Clock /> <span>{item.estimated_time} Saat</span>
                    </div>
                    <button className="start-btn" disabled={!isClickable}>
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Roadmap = () => {
    const navigate = useNavigate();
    const [roadmapData, setRoadmapData] = useState(mockRoadmap);
    const [isLoading, setIsLoading] = useState(false);

    // TODO: Gerçek API çağrısını burada yapabiliriz.
    // useEffect(() => {
    //     const fetchRoadmap = async () => {
    //         setIsLoading(true);
    //         // API'den veri çekme mantığı buraya gelecek:
    //         // const response = await fetch('/api/roadmap/ilknur_y'); 
    //         // setRoadmapData(await response.json());
    //         setIsLoading(false);
    //     };
    //     fetchRoadmap();
    // }, []);

    const welcomeName = localStorage.getItem('userName') || 'Yazılımcı';

    return (
        <div className="roadmap-page-container">
            {/* ÜST BAŞLIK */}
            <header className="roadmap-header">
                <div className="roadmap-title-section">
                    <h1>{roadmapData.language} Öğrenme Yol Haritan</h1>
                    <p>Hoşgeldin, **{welcomeName}**! Senin için {roadmapData.language} dilinde {roadmapData.level} seviyene uygun olarak oluşturulan kişiselleştirilmiş ders akışın aşağıdadır.</p>
                </div>
                <div className="roadmap-stats">
                    <div className="stat-card">
                        <span className="stat-value">{roadmapData.level.toUpperCase()}</span>
                        <span className="stat-label">Mevcut Seviyen</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{roadmapData.timeline.filter(i => i.status === 'completed').length} / {roadmapData.timeline.length}</span>
                        <span className="stat-label">Tamamlanan Konu</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{roadmapData.estimated_hours} Saat</span>
                        <span className="stat-label">Tahmini Bitiş Süresi</span>
                    </div>
                </div>
            </header>

            {/* ZAMAN TÜNELİ (TIMELINE) */}
            <main className="timeline-main">
                <div className="timeline-container">
                    {isLoading ? (
                        <div className="loading-spinner">Yol Haritan Yükleniyor...</div>
                    ) : (
                        roadmapData.timeline.map((item, index) => (
                            <TimelineItem key={item.id} item={item} navigate={navigate} />
                        ))
                    )}
                </div>
                <div className="timeline-main-end-note">
                    🚀 Hedefine ulaştın! Artık bir {roadmapData.language} Geliştiricisisin.
                </div>
            </main>
        </div>
    );
};

export default Roadmap;
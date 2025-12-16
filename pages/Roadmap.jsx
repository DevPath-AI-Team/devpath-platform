import React, { useState, useEffect } from 'react';
import './Roadmap.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackButton from './BackButton';

// --- İKONLAR ---
const CheckCircle = ({ color }) => <svg width="24" height="24" fill={color} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const Lock = () => <svg width="24" height="24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const PlayCircle = () => <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>;
const Clock = () => <svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;

// --- BİLEŞEN: Timeline Öğesi (DİL ETİKETİ EKLENDİ) ---
const TimelineItem = ({ item, navigate }) => {
    let statusClass = `item-${item.status}`;
    let icon = <PlayCircle />;
    let buttonText = "Derse Başla";
    let isClickable = true;

    if (item.status === 'completed') {
        icon = <CheckCircle color="#10b981" />;
        buttonText = "Tamamlandı";
        isClickable = false;
    } else if (item.status === 'review') {
        icon = <CheckCircle color="#f59e0b" />;
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
    
    const handleClick = () => {
        if (isClickable) {
            // DİKKAT: URL'yi artık `/lesson/` olarak değiştiriyoruz.
            navigate(`/lesson/${item.id}`);
        }
    };

    // Dil etiketleri için stil belirleme
    const getLanguageTagClass = (language) => {
        if (!language) return 'lang-tag-default';
        const lang = language.toLowerCase();
        if (lang.includes('java')) return 'lang-tag-java';
        if (lang.includes('python')) return 'lang-tag-python';
        if (lang.includes('javascript')) return 'lang-tag-js';
        return 'lang-tag-default';
    };

    return (
        <div className={`timeline-item ${statusClass}`} onClick={handleClick} style={{ cursor: isClickable ? 'pointer' : 'default' }}>
            <div className="timeline-icon">{icon}</div>
            <div className="timeline-content">
                <div className="timeline-header">
                    <h3 className="timeline-title">{item.title}</h3>
                    {/* YENİ: Dil Etiketi Eklendi */}
                    <div className={`language-tag ${getLanguageTagClass(item.language)}`}>
                        {item.language}
                    </div>
                    <div className="timeline-badge type-badge">{item.type}</div>
                </div>
                <p className="timeline-description">{item.description}</p>
                <div className="timeline-footer">
                    <div className="time-info">
                        <Clock /> <span>{item.estimated_time} Saat</span>
                    </div>
                    <button className="start-btn" disabled={!isClickable}>{buttonText}</button>
                </div>
            </div>
        </div>
    );
};

// --- ANA SAYFA BİLEŞENİ ---
const Roadmap = () => {
    const navigate = useNavigate();
    const [roadmapData, setRoadmapData] = useState({ timeline: [], level: 'Beginner', language: 'Java', estimated_hours: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const userLanguage = localStorage.getItem('selectedLanguage') || 'Java';
        const userLevel = localStorage.getItem('userLevel') || 'Beginner';
        const token = localStorage.getItem('token'); // Token'ı çek

        // İstenen loglama buraya eklendi
        console.log("Token:", token ? "Var" : "Yok");
        console.log("User ID:", userId);

        if (!userId) {
            setError("Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.");
            setIsLoading(false);
            navigate('/login'); // Güvenlik kontrolü
            return;
        }

        // Authorization başlığını oluştur
        const authConfig = {
            headers: {
                'Authorization': `Bearer ${token}`, // ← Authorization başlığı eklendi
                'Content-Type': 'application/json'
            }
        };

        const fetchRoadmap = async () => {
            setIsLoading(true);
            try {
                // API'den tüm dillerdeki ilerlemeyi çek (authConfig kullanıldı)
                const progressResponse = await axios.get(`http://localhost:8080/api/progress/user/${userId}`, authConfig);
                const userProgress = progressResponse.data;

                if (!userProgress || userProgress.length === 0) {
                     // Kullanıcının seçtiği dile göre dersleri öner (authConfig kullanıldı)
                    const allLessonsResponse = await axios.get(
                        `http://localhost:8080/api/lessons/language/${userLanguage}/level/${userLevel}`, 
                        authConfig // Lessons çağrısına da token eklendi
                    );
                    const timeline = allLessonsResponse.data.map((lesson, index) => ({
                        id: lesson.id,
                        title: lesson.title,
                        description: lesson.description,
                        status: index === 0 ? 'current' : 'upcoming',
                        estimated_time: Math.round(lesson.estimatedMinutes / 60) || 1,
                        type: lesson.level.toLowerCase(),
                        language: lesson.language, // DİL BİLGİSİ EKLENDİ
                    })).sort((a, b) => a.id - b.id);

                    setRoadmapData({
                        timeline: timeline,
                        language: userLanguage,
                        level: userLevel,
                        estimated_hours: timeline.reduce((sum, item) => sum + item.estimated_time, 0),
                    });

                } else {
                     const timeline = userProgress.map(progress => {
                        let status = 'upcoming';
                        if (progress.completed) {
                            status = 'completed';
                        } else if (progress.progress > 0) {
                            status = 'current';
                        }
                        
                        return {
                            id: progress.lesson.id,
                            title: progress.lesson.title,
                            description: progress.lesson.description,
                            status: status,
                            estimated_time: Math.round(progress.lesson.estimatedMinutes / 60) || 1,
                            type: progress.lesson.level.toLowerCase(),
                            language: progress.lesson.language, // DİL BİLGİSİ EKLENDİ
                        };
                    }).sort((a, b) => a.id - b.id);

                    const firstUpcomingIndex = timeline.findIndex(item => item.status === 'upcoming');
                    if (firstUpcomingIndex !== -1 && !timeline.some(item => item.status === 'current')) {
                       timeline[firstUpcomingIndex].status = 'current';
                    }

                    const totalHours = timeline.reduce((sum, item) => sum + item.estimated_time, 0);

                    setRoadmapData({
                        timeline: timeline,
                        language: userLanguage, // Ana dil olarak kullanıcının seçtiğini kullan
                        level: userLevel,
                        estimated_hours: totalHours,
                    });
                }

            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message;
                setError("Yol haritası yüklenirken bir hata oluştu: " + errorMessage);
                
                // İstenen 403 hatası yönetimi
                if (err.response?.status === 403 || err.response?.status === 401) {
                    console.error('Erişim reddedildi/Yetkilendirme Hatası:', err);
                    alert('Oturumun sona erdi veya erişim iznin yok. Lütfen tekrar giriş yap.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    navigate('/login');
                } else {
                     console.error("Yol haritası API hatası:", err);
                }

            } finally {
                setIsLoading(false);
            }
        };

        fetchRoadmap();
    }, [navigate]); // navigate dependency'sini koru

    const welcomeName = localStorage.getItem('userName') || 'Yazılımcı';

    if (isLoading) {
        return <div className="loading-spinner">Yol Haritan Yükleniyor...</div>;
    }
    
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="roadmap-page-container">
            <header className="roadmap-header">
                   <BackButton />
                   <div className="roadmap-title-section">
                        {/* Başlığı daha genel hale getir */}
                        <h1>Öğrenme Yol Haritan</h1>
                        <p>Hoşgeldin, **{welcomeName}**! Senin için oluşturulan kişiselleştirilmiş ders akışın aşağıdadır. Farklı dillerdeki ilerlemeni buradan takip edebilirsin.</p>
                    </div>
                    <div className="roadmap-stats">
                        <div className="stat-card">
                            <span className="stat-value">{roadmapData.level.toUpperCase()}</span>
                            <span className="stat-label">Genel Seviyen</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{roadmapData.timeline.filter(i => i.status === 'completed').length} / {roadmapData.timeline.length}</span>
                            <span className="stat-label">Tamamlanan Konu</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">~{roadmapData.estimated_hours} Saat</span>
                            <span className="stat-label">Toplam Süre</span>
                        </div>
                    </div>
            </header>

            <main className="timeline-main">
                <div className="timeline-container">
                    {roadmapData.timeline.length > 0 ? (
                        roadmapData.timeline.map((item) => (
                            <TimelineItem key={item.id} item={item} navigate={navigate} />
                        ))
                    ) : (
                       <div className="no-data-message">Görüntülenecek ders bulunamadı. Lütfen ana sayfadan bir dil seçimi yapın.</div>
                    )}
                </div>
                   <div className="timeline-main-end-note">
                        🚀 Yolculuğuna devam et, harika bir geliştirici olacaksın!
                    </div>
            </main>
        </div>
    );
};

export default Roadmap;
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

// Dil ikonları
const PythonIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.05 16.94v-4.03a2.98 2.98 0 0 1-1.02-2.12c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3h-1.97v4.03h4.03v-1.97c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3v2.98h-4.03v-1.97c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3z" />
  </svg>
);

const JavaIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 11v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-5" />
    <path d="M8 11h8" />
    <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
    <path d="M10 11a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
  </svg>
);

const JSIcon = () => (
  <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm4.146 3.854a.5.5 0 1 0-.708.708L6.293 8l-1.854 1.446a.5.5 0 1 0 .708.708L7.707 8 5.146 5.854zm3 0a.5.5 0 0 0-.708.708L9.293 8l-1.854 1.446a.5.5 0 1 0 .708.708L10.707 8 8.146 5.854z" />
  </svg>
);

// --- BİLEŞEN: Timeline Öğesi ---
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
        buttonText = "Sırayla İzle";
        isClickable = false;
    }
    
    const handleClick = () => {
        if (isClickable && item.id) {
            navigate(`/course/${item.id}`);
        } else if (!item.id) {
            console.error('Ders ID bulunamadı:', item);
        }
    };

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
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [roadmapData, setRoadmapData] = useState({ timeline: [], level: 'Beginner', language: 'Java', estimated_hours: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Kullanıcının çalıştığı dilleri tespit et
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId) {
            setError("Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.");
            setIsLoading(false);
            navigate('/login');
            return;
        }

        const fetchAvailableLanguages = async () => {
            try {
                const authConfig = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                };

                const progressResponse = await axios.get(
                    `http://localhost:8080/api/progress/user/${userId}`,
                    authConfig
                );

                const languages = new Set();
                if (progressResponse.data && progressResponse.data.length > 0) {
                    progressResponse.data.forEach(progress => {
                        if (progress.lesson && progress.lesson.language) {
                            languages.add(progress.lesson.language.toUpperCase());
                        }
                    });
                }

                // Eğer hiç dil yoksa, varsayılan dilleri ekle
                if (languages.size === 0) {
                    languages.add('PYTHON');
                    languages.add('JAVA');
                    languages.add('JAVASCRIPT');
                }

                const languageArray = Array.from(languages);
                setAvailableLanguages(languageArray);

                // İlk yüklemede dil seçme - kullanıcı kendisi seçsin
                // selectedLanguage null kalacak, böylece dil kartları gösterilecek
            } catch (err) {
                console.error('Dil bilgileri alınırken hata:', err);
                // Hata durumunda varsayılan diller
                setAvailableLanguages(['PYTHON', 'JAVA', 'JAVASCRIPT']);
                // Hata durumunda da selectedLanguage null kalsın
            }
        };

        fetchAvailableLanguages();
    }, [navigate]);

    // Seçilen dil için roadmap verilerini çek
    useEffect(() => {
        if (!selectedLanguage) return;

        const userId = localStorage.getItem('userId');
        const userLevel = localStorage.getItem('userLevel') || 'Beginner';
        const token = localStorage.getItem('token');

        if (!userId) return;

        const authConfig = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const fetchRoadmap = async () => {
            setIsLoading(true);
            try {
                // Önce tüm dersleri çek (seçilen dil için)
                const allLessonsResponse = await axios.get(
                    `http://localhost:8080/api/lessons/language/${selectedLanguage}`,
                    authConfig
                );
                const allLessons = allLessonsResponse.data;

                // Kullanıcının ilerlemesini çek
                const progressResponse = await axios.get(
                    `http://localhost:8080/api/progress/user/${userId}`,
                    authConfig
                );
                const userProgress = progressResponse.data || [];

                // İlerleme map'i oluştur (lessonId -> progress)
                const progressMap = new Map();
                userProgress.forEach(progress => {
                    if (progress.lesson && progress.lesson.language?.toUpperCase() === selectedLanguage.toUpperCase()) {
                        progressMap.set(progress.lesson.id, progress);
                    }
                });

                // Tüm dersleri timeline'a çevir ve ilerlemeyle eşleştir
                const timeline = allLessons
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)) // orderIndex'e göre sırala
                    .map((lesson, index) => {
                        const progress = progressMap.get(lesson.id);
                        let status = 'upcoming';
                        
                        if (progress) {
                            if (progress.completed) {
                                status = 'completed';
                            } else if (progress.progress > 0) {
                                status = 'current';
                            } else {
                                status = 'upcoming';
                            }
                        } else {
                            // İlerleme yoksa, ilk ders current, diğerleri upcoming
                            status = index === 0 ? 'current' : 'upcoming';
                        }
                        
                        // Level'ı string'e çevir (enum olarak gelebilir)
                        let levelString = 'beginner';
                        if (lesson.level) {
                            // JSON'da enum genellikle string olarak gelir (BEGINNER, INTERMEDIATE, ADVANCED)
                            let levelValue = '';
                            
                            if (typeof lesson.level === 'string') {
                                levelValue = lesson.level;
                            } else if (lesson.level && typeof lesson.level === 'object') {
                                // Enum objesi ise
                                levelValue = lesson.level.name || lesson.level.toString() || 'BEGINNER';
                            } else {
                                levelValue = String(lesson.level);
                            }
                            
                            // Büyük harfli geliyorsa küçük harfe çevir
                            const upperLevel = levelValue.toUpperCase();
                            if (upperLevel === 'BEGINNER') {
                                levelString = 'beginner';
                            } else if (upperLevel === 'INTERMEDIATE') {
                                levelString = 'intermediate';
                            } else if (upperLevel === 'ADVANCED') {
                                levelString = 'advanced';
                            } else {
                                levelString = levelValue.toLowerCase();
                            }
                        }
                        
                        // Debug için (geliştirme sırasında açılabilir)
                        if (process.env.NODE_ENV === 'development') {
                            console.log('Lesson:', lesson.title, 'Raw Level:', lesson.level, 'Type:', typeof lesson.level, 'Parsed:', levelString);
                        }
                        
                        return {
                            id: lesson.id,
                            title: lesson.title,
                            description: lesson.description,
                            status: status,
                            estimated_time: Math.round((lesson.estimatedMinutes || 30) / 60) || 1,
                            type: levelString,
                            language: lesson.language,
                        };
                    });

                // Eğer hiç current yoksa, ilk upcoming'i current yap
                const hasCurrent = timeline.some(item => item.status === 'current');
                if (!hasCurrent) {
                    const firstUpcomingIndex = timeline.findIndex(item => item.status === 'upcoming');
                    if (firstUpcomingIndex !== -1) {
                        timeline[firstUpcomingIndex].status = 'current';
                    }
                }

                const totalHours = timeline.reduce((sum, item) => sum + item.estimated_time, 0);

                setRoadmapData({
                    timeline: timeline,
                    language: selectedLanguage,
                    level: userLevel,
                    estimated_hours: totalHours,
                });

            } catch (err) {
                console.error("Roadmap API hatası:", err);
                
                if (err.response?.status === 403 || err.response?.status === 401) {
                    setError("Oturumun sona erdi. Lütfen tekrar giriş yapın.");
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (err.response?.status === 404) {
                    setError("Dersler bulunamadı. Lütfen daha sonra tekrar deneyin.");
                } else {
                    const errorMessage = err.response?.data?.message || err.message || "Bilinmeyen hata";
                    setError(`Yol haritası yüklenirken bir hata oluştu: ${errorMessage}`);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoadmap();
    }, [selectedLanguage, navigate]);

    const getLanguageIcon = (language) => {
        const lang = language?.toUpperCase() || '';
        if (lang.includes('PYTHON')) return <PythonIcon />;
        if (lang.includes('JAVA')) return <JavaIcon />;
        if (lang.includes('JAVASCRIPT') || lang.includes('JS')) return <JSIcon />;
        return <PythonIcon />;
    };

    const getLanguageName = (language) => {
        const lang = language?.toUpperCase() || '';
        if (lang.includes('PYTHON')) return 'Python';
        if (lang.includes('JAVA')) return 'Java';
        if (lang.includes('JAVASCRIPT') || lang.includes('JS')) return 'JavaScript';
        return language || 'Bilinmeyen';
    };

    const getLanguageColor = (language) => {
        const lang = language?.toUpperCase() || '';
        if (lang.includes('PYTHON')) return '#3776ab';
        if (lang.includes('JAVA')) return '#ed8b00';
        if (lang.includes('JAVASCRIPT') || lang.includes('JS')) return '#f7df1e';
        return '#6b7280';
    };

    const welcomeName = localStorage.getItem('userName') || 'Yazılımcı';

    // Sadece diller yüklenirken loading göster
    if (isLoading && availableLanguages.length === 0) {
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
                    <h1>Öğrenme Yol Haritan</h1>
                    <p>Hoşgeldin, <strong>{welcomeName}</strong>! Farklı dillerdeki ilerlemeni buradan takip edebilirsin.</p>
                </div>
            </header>

            {/* Dil Seçimi */}
            {!selectedLanguage && (
                <div className="language-selection-section">
                    <h2 className="section-title">Hangi Dilin Yol Haritasını Görmek İstersin?</h2>
                    <div className="language-cards-grid">
                        {availableLanguages.map((language) => (
                            <div
                                key={language}
                                className="language-card"
                                onClick={() => setSelectedLanguage(language)}
                                style={{ '--lang-color': getLanguageColor(language) }}
                            >
                                <div className="language-card-icon" style={{ color: getLanguageColor(language) }}>
                                    {getLanguageIcon(language)}
                                </div>
                                <div className="language-card-content">
                                    <h3>{getLanguageName(language)}</h3>
                                    <button className="view-roadmap-btn">
                                        Yol Haritasını Gör →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Seçilen Dil İçin Roadmap */}
            {selectedLanguage && (
                <>
                    <div className="selected-language-header">
                        <button className="back-to-languages-btn" onClick={() => setSelectedLanguage(null)}>
                            ← Dillere Dön
                        </button>
                        <div className="selected-language-info">
                            <div className="selected-language-icon" style={{ color: getLanguageColor(selectedLanguage) }}>
                                {getLanguageIcon(selectedLanguage)}
                            </div>
                            <div>
                                <h2>{getLanguageName(selectedLanguage)} Yol Haritası</h2>
                                <p>Öğrenme yolculuğunda adım adım ilerle.</p>
                            </div>
                        </div>
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

                    <main className="timeline-main">
                        <div className="timeline-container">
                            {isLoading ? (
                                <div className="loading-spinner">Yol Haritan Yükleniyor...</div>
                            ) : roadmapData.timeline.length > 0 ? (
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
                </>
            )}
        </div>
    );
};

export default Roadmap;

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chatbot from './Chatbot';
import './Dashboard.css';

const RobotIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="8" cy="16" r="1" />
    <circle cx="16" cy="16" r="1" />
    <path d="M12 11V7" />
    <path d="M9 7h6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const PlayCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="#3b82f6" stroke="#3b82f6" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-1 1.21-.6.25-1 .83-1 1.44s.4 1.19 1 1.44c.53.23 1 .81 1 1.4v.01" />
    <path d="M14 14.66V17c0 .55.47.98 1 1.21.6.25 1 .83 1 1.44s-.4 1.19-1 1.44c-.53.23-1 .81-1 1.4v.01" />
    <path d="M8 12a4 4 0 0 1 8 0H8Z" />
  </svg>
);

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

const Dashboard = () => {
  const [showChat, setShowChat] = useState(false);
  const [userLanguages, setUserLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [languageProgress, setLanguageProgress] = useState({}); // Her dil için ilerleme
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formatScorePercent = (score) => {
    if (score === null || score === undefined) return 0;
    const n = Number(score);
    if (Number.isNaN(n)) return 0;
    if (n >= 0 && n <= 1) return Math.round(n * 100);
    if (n > 1 && n <= 100) return Math.round(n);
    if (n > 100 && n <= 10000) return Math.round(n / 100);
    return Math.max(0, Math.min(100, Math.round(n)));
  };

  // Kullanıcının çalıştığı dilleri tespit et
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      navigate('/login');
      return;
    }

    const fetchUserLanguages = async () => {
      setIsLoading(true);
      try {
        // UserProgress'ten kullanıcının çalıştığı dilleri çek
        const progressResponse = await axios.get(
          `http://localhost:8080/api/progress/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Dilleri çıkar ve benzersiz yap
        const languages = new Set();
        if (progressResponse.data && progressResponse.data.length > 0) {
          progressResponse.data.forEach(progress => {
            if (progress.lesson && progress.lesson.language) {
              languages.add(progress.lesson.language.toUpperCase());
            }
          });
        }

        // Eğer hiç dil yoksa, kullanıcının seçtiği dili ekle
        if (languages.size === 0) {
          const userLanguage = localStorage.getItem('selectedLanguage') || 'PYTHON';
          languages.add(userLanguage.toUpperCase());
        }

        const languageArray = Array.from(languages);
        setUserLanguages(languageArray);

        // Her dil için ilerleme yüzdesini hesapla
        const progressMap = {};
        languageArray.forEach(lang => {
          const langProgress = progressResponse.data?.filter(
            p => p.lesson && p.lesson.language?.toUpperCase() === lang.toUpperCase()
          ) || [];
          const completed = langProgress.filter(p => p.completed).length;
          const total = langProgress.length;
          progressMap[lang] = total > 0 ? Math.round((completed / total) * 100) : 0;
        });
        setLanguageProgress(progressMap);

        // İlk yüklemede dil seçme - kullanıcı kendisi seçsin
        // selectedLanguage null kalacak, böylece dil kartları gösterilecek
      } catch (err) {
        console.error('Dil bilgileri alınırken hata:', err);
        // Hata durumunda varsayılan dil
        const defaultLang = localStorage.getItem('selectedLanguage') || 'PYTHON';
        setUserLanguages([defaultLang.toUpperCase()]);
        // Hata durumunda da selectedLanguage null kalsın
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserLanguages();
  }, [navigate]);

  // Seçilen dil için dashboard verilerini çek
  useEffect(() => {
    if (!selectedLanguage) return;

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) return;

    const fetchDashboardData = async () => {
      try {
        const authConfig = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // UserProgress'ten seçilen dil için ilerlemeyi çek
        const progressResponse = await axios.get(
          `http://localhost:8080/api/progress/user/${userId}`,
          authConfig
        );

        // Seçilen dile göre filtrele
        const filteredProgress = progressResponse.data?.filter(
          progress => progress.lesson && 
          progress.lesson.language?.toUpperCase() === selectedLanguage.toUpperCase()
        ) || [];

        // Eğer ilerleme yoksa, o dil için dersleri çek
        if (filteredProgress.length === 0) {
          const userLevel = localStorage.getItem('userLevel') || 'Beginner';
          const lessonsResponse = await axios.get(
            `http://localhost:8080/api/lessons/language/${selectedLanguage}/level/${userLevel}`,
            authConfig
          );

          const roadmap = lessonsResponse.data.map((lesson, index) => ({
            lessonId: lesson.id,
            title: lesson.title,
            description: lesson.description,
            videoUrl: lesson.videoUrl,
            estimatedMinutes: lesson.estimatedMinutes || 30,
            language: lesson.language,
            topicId: lesson.topicId ? parseInt(lesson.topicId) : 0,
            lessonLevel: lesson.level || 'BEGINNER',
            status: index === 0 ? 'CURRENT' : 'LOCKED',
            progressPercentage: 0
          }));

          setDashboardData({
            userFullName: localStorage.getItem('userName') || 'Öğrenci',
            language: selectedLanguage,
            level: userLevel,
            score: 0,
            roadmapStartTopicId: 0,
            roadmap: roadmap
          });
        } else {
          // İlerleme varsa, roadmap'i oluştur
          const roadmap = filteredProgress.map(progress => {
            let status = 'LOCKED';
            let progressPercentage = 0;

            if (progress.completed) {
              status = 'COMPLETED';
              progressPercentage = 100;
            } else if (progress.progress > 0) {
              status = 'CURRENT';
              progressPercentage = progress.progress;
            } else {
              // İlk tamamlanmamış ders CURRENT olmalı
              const isFirstIncomplete = !filteredProgress.some(
                p => p.lesson.id < progress.lesson.id && !p.completed
              );
              if (isFirstIncomplete) {
                status = 'CURRENT';
              } else {
                status = 'LOCKED';
              }
            }

            return {
              lessonId: progress.lesson.id,
              title: progress.lesson.title,
              description: progress.lesson.description,
              videoUrl: progress.lesson.videoUrl,
              estimatedMinutes: progress.lesson.estimatedMinutes || 30,
              language: progress.lesson.language,
              topicId: progress.lesson.topicId ? parseInt(progress.lesson.topicId) : 0,
              lessonLevel: progress.lesson.level || 'BEGINNER',
              status: status,
              progressPercentage: progressPercentage
            };
          }).sort((a, b) => a.lessonId - b.lessonId);

          // Dashboard API'sinden genel bilgileri al
          try {
            const dashboardResponse = await axios.get(
              `http://localhost:8080/api/dashboard/${userId}`,
              authConfig
            );
            setDashboardData({
              ...dashboardResponse.data,
              roadmap: roadmap
            });
          } catch {
            // Dashboard API hatası durumunda sadece roadmap'i kullan
            setDashboardData({
              userFullName: localStorage.getItem('userName') || 'Öğrenci',
              language: selectedLanguage,
              level: localStorage.getItem('userLevel') || 'Beginner',
              score: 0,
              roadmapStartTopicId: 0,
              roadmap: roadmap
            });
          }
        }
      } catch (err) {
        setError('Dashboard verileri yüklenirken hata oluştu.');
        console.error('Dashboard API hatası:', err);
      }
    };

    fetchDashboardData();
  }, [selectedLanguage]);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircleIcon />;
      case 'CURRENT': return <PlayCircleIcon />;
      case 'AVAILABLE': return <PlayCircleIcon />;
      case 'LOCKED': return <LockIcon />;
      default: return null;
    }
  };

  const getRoadmapItemClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'roadmap-item-completed';
      case 'CURRENT': return 'roadmap-item-current';
      case 'AVAILABLE': return 'roadmap-item-current';
      case 'LOCKED': return 'roadmap-item-locked';
      default: return '';
    }
  };

  const handleRoadmapClick = (item) => {
    if (item.status !== 'LOCKED') {
      navigate(`/course/${item.lessonId}`);
    }
  };

  const handleLanguageCardClick = (language) => {
    setSelectedLanguage(language);
  };

  const handleContinueLearning = async (language) => {
    setSelectedLanguage(language);
    // Dil seçildikten sonra dashboard verilerini bekle
    // Kaldığı yerden devam etmek için ilk CURRENT veya AVAILABLE dersi bul
    setTimeout(() => {
      // Dashboard verileri yüklendikten sonra kontrol et
      const checkAndNavigate = () => {
        if (dashboardData && dashboardData.roadmap) {
          const nextLesson = dashboardData.roadmap.find(
            item => item.status === 'CURRENT' || item.status === 'AVAILABLE'
          );
          if (nextLesson) {
            navigate(`/course/${nextLesson.lessonId}`);
          }
        }
      };
      checkAndNavigate();
    }, 500);
  };

  const levelOrder = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const levelTitles = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
  };

  const groupedRoadmap = useMemo(() => {
    if (!dashboardData?.roadmap) return {};
    return dashboardData.roadmap.reduce((acc, item) => {
      const lvl = (item.lessonLevel || 'BEGINNER').toUpperCase();
      if (!acc[lvl]) acc[lvl] = [];
      acc[lvl].push(item);
      return acc;
    }, {});
  }, [dashboardData]);

  // İlerleme yüzdesini hesapla
  const getLanguageProgress = (language) => {
    return languageProgress[language] || 0;
  };

  if (isLoading && userLanguages.length === 0) {
    return <div className="loading-spinner">Yükleniyor...</div>;
  }
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <div className="header-section">
          <div className="welcome-title">
            <h1>👋 Tekrar Hoşgeldin, {dashboardData?.userFullName || localStorage.getItem('userName') || 'Öğrenci'}!</h1>
            <p>
              {selectedLanguage 
                ? `${getLanguageName(selectedLanguage)} dilinde öğrenmeye devam et.`
                : 'Çalıştığın dilleri seç ve kaldığın yerden devam et.'}
            </p>
          </div>

          {dashboardData && (
            <div className="stats-card">
              <TrophyIcon />
              <div>
                <h4>İlerleme Oranı</h4>
                <p>{formatScorePercent(dashboardData.score)}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Dil Kartları */}
        {!selectedLanguage && (
          <div className="languages-section">
            <h2 className="section-title">Çalıştığın Diller</h2>
            <p className="section-subtitle">Hangi dilde öğrenmeye devam etmek istersin?</p>
            <div className="language-cards-grid">
              {userLanguages.map((language) => (
                <div
                  key={language}
                  className="language-card"
                  onClick={() => handleLanguageCardClick(language)}
                  style={{ '--lang-color': getLanguageColor(language) }}
                >
                  <div className="language-card-icon" style={{ color: getLanguageColor(language) }}>
                    {getLanguageIcon(language)}
                  </div>
                  <div className="language-card-content">
                    <h3>{getLanguageName(language)}</h3>
                    <p className="language-card-progress">
                      İlerleme: {getLanguageProgress(language)}%
                    </p>
                    <button
                      className="continue-learning-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContinueLearning(language);
                      }}
                    >
                      Kaldığın Yerden Devam Et →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seçilen dil için roadmap */}
        {selectedLanguage && dashboardData && (
          <>
            <div className="selected-language-header">
              <button 
                className="back-to-languages-btn" 
                onClick={() => {
                  setSelectedLanguage(null);
                  setDashboardData(null); // Dashboard verilerini de temizle
                }}
              >
                ← Dillere Dön
              </button>
              <div className="selected-language-info">
                <div className="selected-language-icon" style={{ color: getLanguageColor(selectedLanguage) }}>
                  {getLanguageIcon(selectedLanguage)}
                </div>
                <div>
                  <h2>{getLanguageName(selectedLanguage)} Dersleri</h2>
                  <p>Kaldığın yerden devam et ve öğrenmeye devam et!</p>
                </div>
              </div>
            </div>

            <div className="roadmap-container">
              <div className="roadmap-list">
                {levelOrder
                  .filter((lvl) => groupedRoadmap[lvl] && groupedRoadmap[lvl].length > 0)
                  .map((lvl) => (
                    <div key={lvl} className="roadmap-level-group">
                      <h3 className="roadmap-level-title">{levelTitles[lvl]}</h3>

                      {groupedRoadmap[lvl].map((item) => (
                        <div
                          key={item.lessonId}
                          className={`roadmap-item ${getRoadmapItemClass(item.status)}`}
                          onClick={() => handleRoadmapClick(item)}
                        >
                          <div className="roadmap-icon">{getStatusIcon(item.status)}</div>

                          <div className="roadmap-details">
                            <span className="roadmap-title">{item.title}</span>
                            <span className="roadmap-language">{item.language}</span>
                          </div>

                          {item.status === 'COMPLETED' && <span className="roadmap-status-text">Tamamlandı</span>}

                          {(item.status === 'CURRENT' || item.status === 'AVAILABLE') && (
                            <button className="roadmap-action-btn">Derse Başla</button>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Hiç dil yoksa */}
        {!selectedLanguage && userLanguages.length === 0 && (
          <div className="no-languages-message">
            <p>Henüz çalıştığın bir dil yok. Dil seçimi yaparak başlayabilirsin.</p>
            <button className="select-language-btn" onClick={() => navigate('/language-selection')}>
              Dil Seç
            </button>
          </div>
        )}
      </main>

      <div className="ai-fab" title="AI Asistan'a Sor" onClick={() => setShowChat(true)}>
        <RobotIcon />
      </div>
      {showChat && <Chatbot onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default Dashboard;

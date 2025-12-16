import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chatbot from './Chatbot';

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

const Dashboard = () => {
  const [showChat, setShowChat] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ SADECE SAYI DÜZELTME: score kaç formatta gelirse gelsin 0-100 yap
  const formatScorePercent = (score) => {
    if (score === null || score === undefined) return 0;

    const n = Number(score);
    if (Number.isNaN(n)) return 0;

    // 0-1 arası (0.56) => 56
    if (n >= 0 && n <= 1) return Math.round(n * 100);

    // 0-100 arası (56) => 56
    if (n > 1 && n <= 100) return Math.round(n);

    // 5600 gibi gelirse => 56
    if (n > 100 && n <= 10000) return Math.round(n / 100);

    // uç durumlar
    return Math.max(0, Math.min(100, Math.round(n)));
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dashboardResponse = await axios.get(
          `http://localhost:8080/api/dashboard/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardData(dashboardResponse.data);
      } catch (err) {
        setError('Dashboard verileri yüklenirken hata oluştu.');
        console.error('Dashboard API hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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

  const levelOrder = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const levelTitles = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
  };

  const groupedRoadmap = useMemo(() => {
    const list = dashboardData?.roadmap ?? [];
    return list.reduce((acc, item) => {
      const lvl = (item.lessonLevel || 'BEGINNER').toUpperCase();
      if (!acc[lvl]) acc[lvl] = [];
      acc[lvl].push(item);
      return acc;
    }, {});
  }, [dashboardData]);

  if (isLoading) return <div className="loading-spinner">Yükleniyor...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <main className="main-content">
        {dashboardData && (
          <>
            <div className="header-section">
              <div className="welcome-title">
                <h1>👋 Tekrar Hoşgeldin, {dashboardData.userFullName}!</h1>
                <p>
                  Yapay zeka analizine göre seviyen:
                  <span className="highlight"> {dashboardData.level}</span>. Yol haritan hazır.
                </p>
              </div>

              <div className="stats-card">
                <TrophyIcon />
                <div>
                  <h4>Genel Başarı</h4>

                  {/* ✅ SADECE BU SATIR DEĞİŞTİ (tasarım aynı) */}
                  <p>{formatScorePercent(dashboardData.score)}%</p>
                </div>
              </div>
            </div>

            <div className="roadmap-container">
              <h2 className="section-title">Yol Haritan</h2>
              <p className="section-subtitle">Öğrenme yolculuğunda adım adım ilerle.</p>

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
      </main>

      <div className="ai-fab" title="AI Asistan'a Sor" onClick={() => setShowChat(true)}>
        <RobotIcon />
      </div>
      {showChat && <Chatbot onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default Dashboard;

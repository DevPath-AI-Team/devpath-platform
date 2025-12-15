
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Chatbot from "./Chatbot";
import './Dashboard.css';
import './Chatbot.css';

// --- ICONS ---
const RobotIcon = () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect x="4" y="12" width="16" height="8" rx="2" /><path d="M4 12v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" /><path d="M12 16h.01" /></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const PlayCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>;
const LockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const TrophyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-1 1.21-.6.25-1 .83-1 1.44s.4 1.19 1 1.44c.53.23 1 .81 1 1.4v.01"/><path d="M14 14.66V17c0 .55.47.98 1 1.21.6.25 1 .83 1 1.44s-.4 1.19-1 1.44c-.53.23-1 .81-1 1.4v.01"/><path d="M8 12a4 4 0 0 1 8 0H8Z"/></svg>;


const Dashboard = () => {
    const [showChat, setShowChat] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            navigate('/login'); // ID yoksa, doğrudan login'e yönlendir.
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // --- YENİ VE DOĞRU API ÇAĞRISI ---
                const response = await axios.get(`http://localhost:8080/api/dashboard/${userId}`);
                setDashboardData(response.data);
                console.log("Dashboard verisi başarıyla çekildi:", response.data);
            } catch (err) {
                setError("Yol haritanız yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
                console.error("Dashboard API hatası:", err);
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
            case 'LOCKED': return <LockIcon />;
            default: return null;
        }
    };

    const getRoadmapItemClass = (status) => {
        switch (status) {
            case 'COMPLETED': return 'roadmap-item-completed';
            case 'CURRENT': return 'roadmap-item-current';
            case 'LOCKED': return 'roadmap-item-locked';
            default: return '';
        }
    };

    const handleRoadmapClick = (item) => {
        if (item.status !== 'LOCKED') {
            navigate(`/course/${item.lessonId}`);
        }
    };

    return (
        <div className="dashboard-container">

            <main className="main-content">
                {isLoading && <div className="loading-spinner">Yükleniyor...</div>}
                {error && <div className="error-message">{error}</div>}

                {!isLoading && !error && dashboardData && (
                    <>
                        <div className="header-section">
                            <div className="welcome-title">
                                <h1>👋 Tekrar Hoşgeldin, {dashboardData.userName}!</h1>
                                <p>Yapay zeka analizine göre seviyen: <span className='highlight'>{dashboardData.userLevel}</span>. Yol haritan hazır.</p>
                            </div>
                            <div className="stats-card">
                                <TrophyIcon />
                                <div>
                                    <h4>Genel Başarı</h4>
                                    <p>{Math.round(dashboardData.userScore * 100)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="roadmap-container">
                            <h2 className='section-title'>Yol Haritan</h2>
                            <p className='section-subtitle'>Öğrenme yolculuğunda adım adım ilerle.</p>
                            <div className="roadmap-list">
                                {dashboardData.roadmap.map(item => (
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
                                        {item.status === 'COMPLETED' && <span className='roadmap-status-text'>Tamamlandı</span>}
                                        {item.status === 'CURRENT' && <button className='roadmap-action-btn'>Derse Başla</button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
            
            <div className="ai-fab" title="AI Asistan'a Sor" onClick={() => setShowChat(true)}><RobotIcon /></div>
            {showChat && <Chatbot onClose={() => setShowChat(false)} />}
        </div>
    );
};

export default Dashboard;

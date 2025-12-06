import './Dashboard.css';
import React, { useState } from "react";

import Chatbot from "./Chatbot";

// --- İKONLAR ---
const HomeIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const BookIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
const MapIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>;
const SettingsIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const RobotIcon = () => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>;
const CodeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const JavaIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
const PythonIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l10 10 10-10V2H12z" /><path d="M12 8v4" /><path d="M12 16v.01" /></svg>;
const DbIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>;

// --- MOCK DATA (Veritabanı gelene kadar) ---
const courses = [
  { id: 1, title: 'Java ile Nesne Yönelimli Programlama', desc: 'Sınıflar, nesneler ve kalıtım prensipleri.', progress: 75, icon: <JavaIcon />, color: '#ffe4e6', iconColor: '#e11d48' },
  { id: 2, title: 'Python: Veri Bilimine Giriş', desc: 'Pandas ve NumPy ile veri analizi temelleri.', progress: 30, icon: <PythonIcon />, color: '#fef9c3', iconColor: '#ca8a04' },
  { id: 3, title: 'Veritabanı Yönetimi (SQL)', desc: 'PostgreSQL ile verileri yönetmeyi öğrenin.', progress: 0, icon: <DbIcon />, color: '#dcfce7', iconColor: '#16a34a' },
];

const Dashboard = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="dashboard-container">
      {/* --- YAN MENÜ --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <CodeIcon />
          <span className="brand-text">DevPath AI</span>
        </div>

        <nav className="nav-menu">
          <div className="nav-item active">
            <HomeIcon /> <span>Ana Panel</span>
          </div>
          <div className="nav-item">
            <MapIcon /> <span>Yol Haritam</span>
          </div>
          <div className="nav-item">
            <BookIcon /> <span>Derslerim</span>
          </div>
          <div className="nav-item">
            <SettingsIcon /> <span>Ayarlar</span>
          </div>
        </nav>

        <div className="user-profile">
          <div className="user-avatar">İY</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>İlknur Yüksek</span>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Bilgisayar Mühendisliği Öğrencisi</span>
          </div>
          <div style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => window.location.href = '/login'}>
            <LogoutIcon />
          </div>
        </div>
      </aside>

      {/* --- ANA İÇERİK --- */}
      <main className="main-content">
        <div className="header-section">
          <div className="welcome-title">
            <h1>👋 Tekrar Hoşgeldin </h1>
            <p>Bugün öğrenmek için harika bir gün. Kaldığın yerden devam et.</p>
          </div>
        </div>

        {/* DERSLER GRID */}
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Devam Eden Derslerin</h3>
        <div className="courses-grid">
          {courses.map((course) => (
            <div className="course-card" key={course.id}>
              <div className="card-icon" style={{ backgroundColor: course.color }}>
                {course.icon}
              </div>
              <div className="card-title">{course.title}</div>
              <div className="card-desc">{course.desc}</div>

              <div className="progress-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px', color: '#6b7280' }}>
                  <span>İlerleme</span>
                  <span>%{course.progress}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>

              <button className="continue-btn">Derse Devam Et</button>
            </div>
          ))}
        </div>
      </main>

      {/* AI ASİSTAN BUTONU */}
      {/* AI ASİSTAN BUTONU */}
      <div className="ai-fab" title="AI Asistan'a Sor" onClick={() => setShowChat(true)}>
        <RobotIcon />
      </div>

      {showChat && <Chatbot onClose={() => setShowChat(false)} />}

    </div>
  );
};

export default Dashboard;
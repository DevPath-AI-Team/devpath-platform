
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css'; // Sidebar için özel CSS dosyası

// --- ICONS (Sidebar'da kullanılan ikonlar) ---
const HomeIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const BookIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
const MapIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>;
const SettingsIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const LogoutIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const CodeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const welcomeName = localStorage.getItem('userName') || 'Yazılımcı';

    const handleNavigate = (path) => navigate(path);

    // Aktif menü öğesini belirlemek için fonksiyon
    const getNavItemClass = (path) => {
        return `nav-item ${location.pathname === path ? 'active' : ''}`;
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <CodeIcon /> 
                <span className="brand-text">DevPath AI</span>
            </div>
            <nav className="nav-menu">
                <div className={getNavItemClass('/dashboard')} onClick={() => handleNavigate('/dashboard')}><HomeIcon /> <span>Ana Sayfa</span></div>
                <div className={getNavItemClass('/roadmap')} onClick={() => handleNavigate('/roadmap')}><MapIcon /> <span>Yol Haritam</span></div>
                <div className={getNavItemClass('/courses')} onClick={() => handleNavigate('/courses')}><BookIcon /> <span>Derslerim ve Notlarım</span></div>
                <div className={getNavItemClass('/settings')} onClick={() => handleNavigate('/settings')}><SettingsIcon /> <span>Ayarlar</span></div>
            </nav>
            <div className="user-profile">
                <div className="user-avatar">{welcomeName.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                    <span className="user-name">{welcomeName}</span>
                    <span className="user-role">Öğrenci</span>
                </div>
                <div className="logout-icon" title="Çıkış Yap" onClick={handleLogout}>
                    <LogoutIcon />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

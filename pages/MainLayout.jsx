
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar'; // Yan menümüz
import Chatbot from './Chatbot'; // Akıllı asistanımız
import './MainLayout.css'; // Layout için stiller

// Bu komponent, her sayfada görünen sabit elemanları (Sidebar, Chatbot ikonu) ve 
// dinamik olarak değişen sayfa içeriğini bir arada tutan ana iskelettir.

const MainLayout = ({ children }) => {
    const [isChatbotOpen, setChatbotOpen] = useState(false);
    const location = useLocation();

    // Sidebar'ın gösterileceği yolları burada tanımla
    const showSidebarOn = [
        '/dashboard',
        '/roadmap',
        '/courses',
        '/settings',
        '/course' // /course/:id gibi dinamik yolları da kapsar
    ];

    // Mevcut yolun sidebar gösterilecek yollardan biriyle başlayıp başlamadığını kontrol et
    const shouldShowSidebar = showSidebarOn.some(path => location.pathname.startsWith(path));

    return (
        <div className="main-layout">
            {shouldShowSidebar && <Sidebar />}

            <main className={`content ${shouldShowSidebar ? 'with-sidebar' : 'full-width'}`}>
                {children} 
            </main>

            {/* Chatbot ikonu ve penceresi */}
            {!isChatbotOpen ? (
                <button className="chatbot-toggler" onClick={() => setChatbotOpen(true)}>
                    🤖
                </button>
            ) : (
                <Chatbot onClose={() => setChatbotOpen(false)} />
            )}
        </div>
    );
};

export default MainLayout;

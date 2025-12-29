
import React, { useState, useEffect } from 'react';
import './Settings.css';
import Sidebar from './Sidebar'; // Kenar çubuğunu içe aktar
import BackButton from './BackButton'; // Geri butonunu import et

const Settings = () => {
    // Tema state'i, başlangıçta tarayıcının tercihini veya açık temayı kullanır
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [userName, setUserName] = useState('İlknur'); // Mock data
    const [userEmail, setUserEmail] = useState('ilknur@example.com'); // Mock data
    const [weeklyGoal, setWeeklyGoal] = useState(5); // Mock data

    // Tema değiştiğinde body elementine class ekle/kaldır ve localStorage'a kaydet
    useEffect(() => {
        document.body.className = ''; // Önceki class'ları temizle
        document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <div className="settings-container">
            <main className="settings-content">
                <div className="settings-header-container">
                    <BackButton />
                    <h1 className="settings-header">Ayarlar</h1>
                </div>

                {/* Profil Bilgileri Kartı */}
                <div className="settings-card">
                    <h2 className="card-title">Profil Bilgileri</h2>
                    <div className="form-group">
                        <label htmlFor="userName">İsim</label>
                        <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userEmail">E-posta</label>
                        <input type="email" id="userEmail" value={userEmail} readOnly />
                    </div>
                    <button className="card-button">Profili Güncelle</button>
                </div>

                {/* Öğrenme Tercihleri Kartı */}
                <div className="settings-card">
                    <h2 className="card-title">Öğrenme Tercihleri</h2>
                    <div className="form-group">
                        <label htmlFor="weeklyGoal">Haftalık Öğrenme Hedefi</label>
                        <select id="weeklyGoal" value={weeklyGoal} onChange={(e) => setWeeklyGoal(e.target.value)}>
                            <option value="3">3 Saat</option>
                            <option value="5">5 Saat</option>
                            <option value="7">7 Saat</option>
                            <option value="10">10 Saat</option>
                        </select>
                    </div>
                    <button className="card-button">Tercihleri Kaydet</button>
                </div>

                {/* Görünüm Ayarları Kartı */}
                <div className="settings-card">
                    <h2 className="card-title">Görünüm</h2>
                    <p>Uygulama genelinde kullanılacak temayı seçin.</p>
                    <div className="theme-selector">
                        <button 
                            className={`theme-button ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('light')}>
                            Açık Tema
                        </button>
                        <button 
                            className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('dark')}>
                            Koyu Tema
                        </button>
                    </div>
                </div>

                 {/* Hesap Ayarları Kartı */}
                 <div className="settings-card danger-zone">
                    <h2 className="card-title">Hesap Yönetimi</h2>
                    <p>Bu işlemler geri alınamaz. Lütfen dikkatli olun.</p>
                    <div className="danger-buttons">
                        <button className="card-button danger-button">Şifreyi Değiştir</button>
                        <button className="card-button danger-button">Hesabı Sil</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;

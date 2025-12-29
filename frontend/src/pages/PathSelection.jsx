import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Tasarım aynı kalsın diye

const PathSelection = () => {
    const navigate = useNavigate();

    const handleSelectPath = (path) => {
        if (path === 'web') {
            // Web seçilirse Dil Seçimine gönder
            navigate('/language-selection');
        } else {
            // Diğerleri için uyarı ver
            alert("Bu alan şu an geliştirme aşamasındadır. Lütfen Web Geliştirme ile devam edin.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="form-wrapper">
                    <h1 className="brand-title">Alanını Seç</h1>
                    <p className="welcome-text">Hangi alanda uzmanlaşmak istiyorsun?</p>
                    
                    <div style={{display:'flex', flexDirection:'column', gap:'15px', marginTop:'20px'}}>
                        <button className="login-btn" onClick={() => handleSelectPath('web')}>
                            🌐 Web Geliştirme (Full Stack)
                        </button>
                        <button className="login-btn" style={{backgroundColor:'#64748b'}} onClick={() => handleSelectPath('mobile')}>
                            📱 Mobil Uygulama (Yakında)
                        </button>
                        <button className="login-btn" style={{backgroundColor:'#64748b'}} onClick={() => handleSelectPath('data')}>
                            📊 Veri Bilimi (Yakında)
                        </button>
                    </div>
                </div>
            </div>
            <div className="login-right">
                <div className="right-content"><h2>Hedefini Belirle.</h2></div>
            </div>
        </div>
    );
};

export default PathSelection;
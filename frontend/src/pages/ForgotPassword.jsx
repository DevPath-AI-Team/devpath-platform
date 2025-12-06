import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

// --- İKONLAR ---
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const CodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>);

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Backend'e istek atıyoruz (Büşra bu adresi backend'de tanımlamalı)
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Sıfırlama bağlantısı e-posta adresine gönderildi! Lütfen kutunu kontrol et.' });
      } else {
        setMessage({ type: 'error', text: 'Bu e-posta adresi sistemde kayıtlı değil veya bir hata oluştu.' });
      }
    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı. Backend henüz bu özelliği desteklemiyor olabilir.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="form-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px' }}><CodeIcon /></div>
            <h1 className="brand-title" style={{marginBottom:0}}>Şifre Sıfırla</h1>
          </div>
          
          <p className="welcome-text">E-posta adresini gir, sana yeni bir şifre oluşturma bağlantısı gönderelim.</p>

          {/* Mesaj Kutusu */}
          {message.text && (
            <div style={{
                padding: '10px', 
                marginBottom: '15px', 
                borderRadius: '8px',
                fontSize: '0.9rem',
                backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                color: message.type === 'error' ? '#991b1b' : '#166534'
            }}>
                {message.text}
            </div>
          )}

          <form onSubmit={handleReset}>
            <div className="input-group">
              <label>E-posta Adresi</label>
              <div className="input-wrapper">
                <MailIcon />
                <input 
                    type="email" 
                    placeholder="ornek@email.com" 
                    className="styled-input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
            </button>
          </form>

          <div className="footer-links">
            <Link to="/login" className="link-text">← Giriş Ekranına Dön</Link>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="bg-pattern"></div>
        <div className="right-content">
          <h2>Endişelenme.</h2>
          <p>Hesabına tekrar erişebilmen için buradayız.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
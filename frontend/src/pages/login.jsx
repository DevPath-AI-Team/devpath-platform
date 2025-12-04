import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; 
// --- İKONLAR (Harici paket hatası vermesin diye kodun içine gömdüm) ---

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

// --- ASIL SAYFA KODU ---

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Sayfa yönlendirmesi için

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Giriş denemesi:", email, password);
    
    // --- GEÇİCİ GİRİŞ MANTIĞI ---
    // Şimdilik test etmek için şifre '123456' ise giriş başarılı sayalım.
    if(password === '123456') {
        alert("Giriş Başarılı! Hoşgeldin lider.");
        navigate('/dashboard'); // Seni Dashboard sayfasına atar
    } else {
        alert("Hatalı şifre! (Test şifresi: 123456)");
    }
  };

  return (
    <div className="login-container">
      {/* --- SOL TARAF (FORM) --- */}
      <div className="login-left">
        <div className="form-wrapper">
          
          {/* Logo ve Başlık */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px' }}>
                <CodeIcon />
            </div>
            <h1 className="brand-title" style={{marginBottom:0}}>DevPath AI</h1>
          </div>
          
          <p className="welcome-text">Yazılım öğrenme yolculuğuna kaldığın yerden devam et.</p>

          <form onSubmit={handleLogin}>
            {/* E-posta Alanı */}
            <div className="input-group">
              <label>E-posta Adresi</label>
              <div className="input-wrapper">
                <MailIcon /> {/* CSS'deki .input-icon sınıfı buraya etki eder */}
                <input 
                  type="email" 
                  placeholder="ogrenci@iste.edu.tr" 
                  className="styled-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Şifre Alanı */}
            <div className="input-group">
              <label>Şifre</label>
              <div className="input-wrapper">
                <LockIcon /> {/* CSS'deki .input-icon sınıfı buraya etki eder */}
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="styled-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Şifremi Unuttum */}
            <div style={{textAlign: 'right', marginBottom: '1.5rem'}}>
              <span className="link-text" style={{fontSize: '0.85rem', cursor:'pointer'}}>
                Şifremi Unuttum?
              </span>
            </div>

            {/* Giriş Butonu */}
            <button type="submit" className="login-btn">
              Giriş Yap
            </button>
          </form>

          {/* Kayıt Ol Linki */}
          <div className="footer-links">
            Hesabın yok mu? <Link to="/register" className="link-text">Hemen Kayıt Ol</Link>
          </div>
        </div>
      </div>

      {/* --- SAĞ TARAF (GÖRSEL) --- */}
      <div className="login-right">
        {/* CSS'deki .bg-pattern sınıfı burada desen oluşturacak */}
        <div className="bg-pattern"></div>
        <div className="right-content">
          <h2>Geleceği Kodla.</h2>
          <p>
            Yapay zeka destekli kişisel asistanın ve sana özel yol haritan ile
            yazılım öğrenmek artık çok daha kolay.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
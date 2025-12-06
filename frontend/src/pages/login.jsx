import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

// --- İKONLAR ---
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const CodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Hatayı temizle
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // --- DEĞİŞEN KISIM BURASI (HATA ÖNLEYİCİ) ---
      
      // 1. Cevabı önce düz yazı (text) olarak al. JSON olarak almaya çalışırsak ve boşsa patlar.
      const textData = await response.text();
      console.log("Backend Ham Cevap:", textData); // Konsola bak, ne geliyor görelim.

      if (response.ok) {
        // 2. Eğer backend "Tamam" dedi ama veri göndermediyse (Boşsa)
        if (!textData || textData.trim() === "") {
            console.log("Backend boş cevap döndü ama giriş başarılı sayıldı.");
            alert("Giriş Başarılı!");
            navigate('/dashboard'); 
            return;
        }

        // 3. Eğer veri varsa JSON'a çevir
        try {
            const data = JSON.parse(textData);
            console.log("Giriş Başarılı Verisi:", data);
            
            // Token varsa kaydet
            if (data.token) {
                localStorage.setItem('token', data.token); 
            }
            
            alert("Giriş Başarılı! Hoşgeldin.");
            navigate('/dashboard');
        } catch (parseError) {
            // JSON hatalı olsa bile response.ok olduğu için içeri alalım
            console.error("JSON Çevirme Hatası:", parseError);
            alert("Giriş Başarılı!");
            navigate('/dashboard');
        }
 
      } else {
        // Şifre yanlışsa veya backend hata kodu döndüyse
        setError("E-posta veya şifre hatalı!");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucuya bağlanılamadı. Backend çalışıyor mu?");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="form-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px' }}><CodeIcon /></div>
            <h1 className="brand-title" style={{marginBottom:0}}>DevPath AI</h1>
          </div>
          <p className="welcome-text">Yazılım öğrenme yolculuğuna kaldığın yerden devam et.</p>

          {error && (
            <div style={{padding: '10px', marginBottom: '15px', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#fee2e2', color: '#991b1b'}}>
                {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>E-posta Adresi</label>
              <div className="input-wrapper">
                <MailIcon />
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

            <div className="input-group">
              <label>Şifre</label>
              <div className="input-wrapper">
                <LockIcon />
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

            <div style={{textAlign: 'right', marginBottom: '1.5rem'}}>
              <Link to="/forgot-password" className="link-text" style={{fontSize: '0.85rem'}}>Şifremi Unuttum?</Link>
            </div>

            <button type="submit" className="login-btn">Giriş Yap</button>
          </form>

          <div className="footer-links">
            Hesabın yok mu? <Link to="/register" className="link-text">Hemen Kayıt Ol</Link>
          </div>
        </div>
      </div>
      <div className="login-right"><div className="bg-pattern"></div><div className="right-content"><h2>Geleceği Kodla.</h2><p>Yapay zeka destekli kişisel asistanın ile öğren.</p></div></div>
    </div>
  );
};

export default Login;
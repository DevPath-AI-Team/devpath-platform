import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Aynı CSS'i kullanıyoruz

// --- İKONLAR ---
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const CodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>);

const Register = () => {
  const navigate = useNavigate();
  
  // Form verilerini tutacak state'ler
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  // Hata veya Başarı mesajı için state
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.type === 'text' && e.target.name === undefined ? 'fullName' : e.target.type]: e.target.value });
    // Not: Aşağıdaki inputlarda name attribute'u ekleyerek daha temiz yapabiliriz ama şimdilik senin yapıya uyduruyorum.
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: 'info', text: 'Kayıt yapılıyor...' });

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Backend 200 OK döndü
        setMessage({ type: 'success', text: 'Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz...' });
        setTimeout(() => {
            navigate('/login');
        }, 1500);
      } else {
        // Backend hata döndü (Örn: Email kayıtlı)
        setMessage({ type: 'error', text: 'Kayıt başarısız. Lütfen bilgileri kontrol et.' });
      }
    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı! Backend açık mı?' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="form-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px' }}><CodeIcon /></div>
            <h1 className="brand-title" style={{marginBottom:0}}>Aramıza Katıl</h1>
          </div>
          
          <p className="welcome-text">Kendi öğrenme yolculuğunu başlatmak için hesap oluştur.</p>

          {/* Hata/Bilgi Mesajı Kutusu */}
          {message.text && (
            <div style={{
                padding: '10px', 
                marginBottom: '15px', 
                borderRadius: '8px',
                fontSize: '0.9rem',
                backgroundColor: message.type === 'error' ? '#fee2e2' : message.type === 'success' ? '#dcfce7' : '#e0f2fe',
                color: message.type === 'error' ? '#991b1b' : message.type === 'success' ? '#166534' : '#075985'
            }}>
                {message.text}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* Ad Soyad */}
            <div className="input-group">
              <label>Ad Soyad</label>
              <div className="input-wrapper">
                <UserIcon />
                <input 
                    type="text" 
                    placeholder="İlknur Yüksek" 
                    className="styled-input" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required 
                />
              </div>
            </div>

            {/* E-posta */}
            <div className="input-group">
              <label>E-posta</label>
              <div className="input-wrapper">
                <MailIcon />
                <input 
                    type="email" 
                    placeholder="ogrenci@iste.edu.tr" 
                    className="styled-input" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="input-group">
              <label>Şifre</label>
              <div className="input-wrapper">
                <LockIcon />
                <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="styled-input" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                />
              </div>
            </div>

            <button type="submit" className="login-btn">Kayıt Ol</button>
          </form>

          <div className="footer-links">
            Zaten hesabın var mı? <Link to="/login" className="link-text">Giriş Yap</Link>
          </div>
        </div>
      </div>
      <div className="login-right"><div className="bg-pattern"></div><div className="right-content"><h2>Sınırları Zorla.</h2><p>Yüzlerce yazılımcı adayı ile birlikte öğren.</p></div></div>
    </div>
  );
};

export default Register;
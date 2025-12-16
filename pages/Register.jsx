import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Login CSS'lerini kullanabiliriz

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor!');
            return;
        }

        try {
            // Backend'e kayıt isteği
            const response = await axios.post('http://localhost:8080/api/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            });
            
            console.log("Kayıt Başarılı:", response.data);

            // Kullanıcı ID'sini ve Token'ı hemen kaydedelim ki sistem onu tanısın
            // (Backend'den userId, id veya token ne gelirse hepsini kontrol ediyoruz)
            if(response.data.userId) localStorage.setItem('userId', response.data.userId);
            else if(response.data.id) localStorage.setItem('userId', response.data.id);

            if(response.data.token) localStorage.setItem('token', response.data.token);
            if(response.data.fullName) localStorage.setItem('userName', response.data.fullName);

            alert("Kayıt başarılı! Şimdi öğrenmek istediğin dili seç.");
            
            // DÜZELTME BURADA: Girişe değil, Dil Seçimine yönlendiriyoruz
navigate('/path-selection');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="form-wrapper">
                    <h1 className="brand-title">DevPath AI</h1>
                    <p className="welcome-text">Hemen aramıza katıl.</p>
                    {error && <div className="error-message" style={{color:'red', marginBottom:'10px'}}>{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Ad Soyad</label>
                            <input type="text" name="fullName" className="styled-input" onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>E-posta</label>
                            <input type="email" name="email" className="styled-input" onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Şifre</label>
                            <input type="password" name="password" className="styled-input" onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Şifre Tekrar</label>
                            <input type="password" name="confirmPassword" className="styled-input" onChange={handleChange} required />
                        </div>
                        <button type="submit" className="login-btn">Kayıt Ol</button>
                    </form>
                    <div className="footer-links">
                        Zaten hesabın var mı? <Link to="/login" className="link-text">Giriş Yap</Link>
                    </div>
                </div>
            </div>
            <div className="login-right">
                <div className="right-content"><h2>Başlamak için sabırsızlanıyoruz.</h2></div>
            </div>
        </div>
    );
};

export default Register;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // DÜZELTME BURADA: Backend @RequestParam beklediği için email'i URL'ye ekliyoruz
            // ?email=kullanici@mail.com şeklinde gönderiyoruz
            await axios.post(`http://localhost:8080/api/auth/forgot-password?email=${email}`);
            
            setMessage('Şifre sıfırlama talimatları e-posta adresinize gönderildi.');
            
            // 3 saniye sonra girişe yönlendir
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error(err);
            // Hata mesajını backend'den alabilirsek gösterelim
            setError(err.response?.data?.message || 'Bu e-posta adresi sistemde bulunamadı veya bir hata oluştu.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="form-wrapper">
                    <h1 className="brand-title">Şifremi Unuttum</h1>
                    <p className="welcome-text">E-posta adresini gir, sana yardımcı olalım.</p>

                    {message && <div style={{color: 'green', marginBottom: '10px'}}>{message}</div>}
                    {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>E-posta Adresi</label>
                            <input 
                                type="email" 
                                className="styled-input" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="login-btn">Bağlantı Gönder</button>
                    </form>

                    <div className="footer-links">
                        <Link to="/login" className="link-text">Girişe Dön</Link>
                    </div>
                </div>
            </div>
            <div className="login-right">
                 <div className="bg-pattern"></div>
                 <div className="right-content"><h2>Endişelenme, biz buradayız.</h2></div>
            </div>
        </div>
    );
};

export default ForgotPassword;
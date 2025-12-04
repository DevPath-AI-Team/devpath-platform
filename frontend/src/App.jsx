import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // Yeni eklendi
import ForgotPassword from './pages/ForgotPassword'; // Yeni eklendi

// Basit Dashboard (Geçici)
const Dashboard = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6' }}>
    <h1 style={{ color: '#2563eb', fontSize: '3rem' }}>🎉 Hoşgeldin !</h1>
    <p style={{ fontSize: '1.2rem', color: '#555' }}>DevPath AI Paneline Giriş Başarılı.</p>
    <button onClick={() => window.location.href='/'} style={{marginTop: 20, padding: '10px 20px', cursor:'pointer'}}>Çıkış Yap</button>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Auth Sayfaları */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Ana Uygulama */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
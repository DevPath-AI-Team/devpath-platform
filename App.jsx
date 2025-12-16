
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './pages/MainLayout'; // Yeni ana iskeletimiz

// Sayfa Komponentleri
import Login from './pages/login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import PathSelection from './pages/PathSelection';
import LanguageSelection from './pages/LanguageSelection';
import Quiz from './pages/Quiz';
import Roadmap from './pages/Roadmap';
import Courses from './pages/Courses';
import Settings from './pages/Settings';

// Bu fonksiyon, MainLayout (Sidebar + Chatbot) içinde render edilecek sayfaları gruplar.
const AppLayout = () => (
  <MainLayout>
    <Outlet /> {/* Bu kısım, iç içe geçmiş Route'ların (Dashboard, Settings vb.) render edileceği yerdir */}
  </MainLayout>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* MainLayout KULLANILMAYACAK Rotalar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Geçiş Sayfaları (İsteğe bağlı olarak Layout'a dahil edilebilir veya edilmeyebilir) */}
        <Route path="/path-selection" element={<PathSelection />} />
        <Route path="/language-selection" element={<LanguageSelection />} />
        <Route path="/quiz/:language" element={<Quiz />} />

        {/* MainLayout KULLANILACAK Rotalar (Ana Uygulama Ekranları) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/course/:id" element={<Lesson />} />
        </Route>

        {/* Varsayılan Rota */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}

export default App;


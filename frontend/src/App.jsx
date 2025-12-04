import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard'; 
import Lesson from './pages/Lesson';


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


                <Route path="/course/:id" element={<Lesson />} /> 


        
        <Route path="*" element={<Navigate to="/login" />} />
        
      </Routes>
    </Router>
  );
}

export default App;
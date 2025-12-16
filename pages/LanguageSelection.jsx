
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LanguageSelection.css';
import BackButton from './BackButton';

// --- ICONS (Using placeholders for now, can be updated later) ---
const PythonIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M10.05 16.94v-4.03a2.98 2.98 0 0 1-1.02-2.12c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3h-1.97v4.03h4.03v-1.97c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3v2.98h-4.03v-1.97c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3z"></path></svg>;
const JavaIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M8 11v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-5"></path><path d="M8 11h8"></path><path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"></path><path d="M10 11a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path></svg>;
const JSIcon = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm4.146 3.854a.5.5 0 1 0-.708.708L6.293 8l-1.854 1.446a.5.5 0 1 0 .708.708L7.707 8 5.146 5.854zm3 0a.5.5 0 0 0-.708.708L9.293 8l-1.854 1.446a.5.5 0 1 0 .708.708L10.707 8 8.146 5.854z"></path></svg>;


const LanguageSelection = () => {
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const navigate = useNavigate();

    const languages = [
        { id: 'python', name: 'Python', icon: <PythonIcon/> },
        { id: 'java', name: 'Java', icon: <JavaIcon/> },
        { id: 'javascript', name: 'JavaScript', icon: <JSIcon/> },
    ];

    const handleStartQuiz = () => {
        if (selectedLanguage) {
            // The path is stored from the previous step, here we just save the language.
            localStorage.setItem('userLanguage', selectedLanguage);
            navigate(`/quiz/${selectedLanguage}`);
        }
    };

    return (
        <div className="selection-container">
            <BackButton />
            <div className="selection-box">
                <div className="progress-indicator">Adım 2 / 2</div>
                <h1 className="selection-title">Dilini Seç</h1>
                <p className="selection-subtitle">Web geliştirme yolculuğuna hangi teknolojiyle başlamak istersin?</p>

                <h2 className="step-title">Hangi Programlama Diliyle Başlamak İstersin?</h2>
                <div className="options-grid">
                    {languages.map(lang => (
                        <div 
                            key={lang.id} 
                            className={`option-card ${selectedLanguage === lang.id ? 'selected' : ''}`}
                            onClick={() => setSelectedLanguage(lang.id)}
                        >
                            {lang.icon}
                            <span>{lang.name}</span>
                        </div>
                    ))}
                </div>

                <button 
                    className="start-quiz-btn" 
                    disabled={!selectedLanguage}
                    onClick={handleStartQuiz}
                >
                    Seviye Tespit Sınavına Başla
                </button>
            </div>
        </div>
    );
};

export default LanguageSelection;

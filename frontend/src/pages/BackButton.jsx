
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const BackButton = () => {
    const navigate = useNavigate();

    // Bir önceki sayfaya git
    const goBack = () => {
        navigate(-1);
    };

    return (
        <button className="back-button" onClick={goBack} title="Geri Dön">
            <BackArrowIcon />
        </button>
    );
};

export default BackButton;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Quiz.css';

const LanguageSelection = () => {
    const navigate = useNavigate();
    const handleSelect = (language) => {
        navigate(`/quiz/${language.toLowerCase()}`);
    };
    return (
        <div className="quiz-container">
            <div className="quiz-card" style={{ maxWidth: '600px', textAlign: 'center' }}>
                <div className="quiz-content">
                    <h1 className="question-text" style={{ fontSize: '2rem' }}>Öğrenme Yolculuğuna Hoş Geldin!</h1>
                    <p style={{ color: '#6b7280', marginTop: '-2rem', marginBottom: '3rem' }}>
                        Başlamadan önce, hangi programlama diline odaklanmak istediğini seçerek ilk adımını at.
                    </p>
                    <div className="options-container" style={{ gap: '20px' }}>
                        <div className="option" onClick={() => handleSelect('JAVA')} style={{ padding: '30px' }}>
                            <span style={{ fontSize: '2.5rem', marginRight: '20px' }}>☕</span>
                            <div>
                                <h3 style={{ margin: 0, color: '#1f2937' }}>Java</h3>
                                <p style={{ margin: 0, color: '#6b7280' }}>Kurumsal uygulamalar ve sağlam backend sistemleri.</p>
                            </div>
                        </div>
                        <div className="option" onClick={() => handleSelect('PYTHON')} style={{ padding: '30px' }}>
                            <span style={{ fontSize: '2.5rem', marginRight: '20px' }}>🐍</span>
                            <div>
                                <h3 style={{ margin: 0, color: '#1f2937' }}>Python</h3>
                                <p style={{ margin: 0, color: '#6b7280' }}>Veri bilimi, yapay zeka ve hızlı prototipleme.</p>
                            </div>
                        </div>
                    </div>
                    
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '3rem', lineHeight: '1.6' }}>
                        Seçimini yaptıktan sonra, sana en uygun yol haritasını çizebilmemiz için
                        kısa bir seviye belirleme testi yapacağız. <br/> Hazır mısın?
                    </p>

                </div>
            </div>
        </div>
    );
};
export default LanguageSelection;
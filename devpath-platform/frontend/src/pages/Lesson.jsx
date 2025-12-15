import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import BackButton from './BackButton';
import './Lesson.css';

// Basit bir Kod Editörü Bileşeni (Daha sonra geliştirilebilir)
const CodeEditor = ({ value, onChange }) => {
    return (
        <textarea 
            className="code-editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Kodunuzu buraya yazın..."
        />
    );
};

const Lesson = () => {
    const { id: lessonId } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const [lessonData, setLessonData] = useState(null);
    const [noteContent, setNoteContent] = useState('');
    const [codeContent, setCodeContent] = useState(''); // Online editör için state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveStatus, setSaveStatus] = useState(''); // Not kaydetme durumu için

    const noteSaveTimeout = useRef(null);

    // 1. Ders ve Not Verilerini Yükle
    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        const fetchLessonAndNote = async () => {
            setIsLoading(true);
            try {
                // İki isteği aynı anda yap
                const [lessonResponse, noteResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/api/lessons/${lessonId}`), // Ders detayları için
                    axios.get(`http://localhost:8080/api/notes/user/${userId}/lesson/${lessonId}`) // Notları almak için
                ]);

                setLessonData(lessonResponse.data);
                if (noteResponse.data) {
                    setNoteContent(noteResponse.data.content);
                }

            } catch (err) {
                 // Not bulunamazsa 404 hatası normaldir, bunu ayrıca ele al
                if (err.response && err.response.status === 404) {
                    // Ders bulundu ama not bulunamadı, bu bir hata değil.
                    // Sadece ders verisini set et
                    try {
                       const lessonResponse = await axios.get(`http://localhost:8080/api/lessons/${lessonId}`);
                       setLessonData(lessonResponse.data);
                    } catch (lessonErr) {
                       setError('Ders bilgileri yüklenemedi.');
                    }
                } else {
                    setError('Veriler yüklenirken bir hata oluştu.');
                    console.error("Hata:", err);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessonAndNote();
    }, [lessonId, userId, navigate]);

    // 2. Notu Kaydetme Fonksiyonu
    const handleSaveNote = async () => {
        if (noteSaveTimeout.current) {
            clearTimeout(noteSaveTimeout.current);
        }
        
        try {
            const response = await axios.post('http://localhost:8080/api/notes', {
                userId: userId,
                lessonId: lessonId,
                content: noteContent
            });
            console.log('Not kaydedildi:', response.data);
            setSaveStatus('Notlar başarıyla kaydedildi!');
        } catch (error) {
            console.error('Not kaydedilemedi:', error);
            setSaveStatus('Hata: Notlar kaydedilemedi.');
        } finally {
             noteSaveTimeout.current = setTimeout(() => {
                setSaveStatus('');
            }, 3000); // 3 saniye sonra mesajı temizle
        }
    };
    
    // YouTube URL'ini embed formatına çeviren yardımcı fonksiyon
    const getEmbedUrl = (url) => {
        if (!url) return '';
        // Standart YouTube linkini embed linkine dönüştür
        const videoId = url.split('v=')[1];
        if (videoId) {
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
            }
            return `https://www.youtube.com/embed/${videoId}`;
        }
        // Zaten embed linki ise veya format farklıysa olduğu gibi bırak
        return url;
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <div style={{ padding: '2rem' }}>
                    <BackButton />
                    {isLoading && <div>Yükleniyor...</div>}
                    {error && <div className="error-message">{error}</div>}
                    {lessonData && (
                        <div className="lesson-layout">
                            {/* Sol Sütun: Video ve Açıklama */}
                            <div className="lesson-left-column">
                                <h1 className='lesson-title'>{lessonData.title}</h1>
                                <p className='lesson-description'>{lessonData.description}</p>
                                <div className="video-player-wrapper">
                                    <iframe 
                                        src={getEmbedUrl(lessonData.videoUrl)} 
                                        title={lessonData.title}
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>

                            {/* Sağ Sütun: Online Kod Editörü */}
                            <div className="lesson-right-column">
                                <div className="editor-container">
                                    <h3 className='editor-header'>Online Kod Editörü</h3>
                                    <CodeEditor value={codeContent} onChange={setCodeContent} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alt Kısım: Not Alma Alanı */}
                     {!isLoading && (
                        <div className="notes-section">
                            <h3 className='notes-header'>Derse Özel Notların</h3>
                            <textarea 
                                className='notes-textarea'
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder='Bu dersle ilgili notlarınızı buraya yazın...'
                            />
                            <div className='notes-footer'>
                                <button className='save-note-btn' onClick={handleSaveNote}>Notları Kaydet</button>
                                {saveStatus && <span className='save-status-message'>{saveStatus}</span>}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Lesson;

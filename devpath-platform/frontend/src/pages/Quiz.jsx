import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Quiz.css';

// --- BİRLEŞTİRİLMİŞ VE GÜNCELLENMİŞ SORU BANKASI ---
const placementTestData = {
  "python": {
    "test_info": { "title": "Python Seviye Belirleme Testi", "total_questions": 5 },
    "questions": [
      { "id": 1, "question": "Python'da bir değişkene değer atamak için hangi operatör kullanılır?", "options": ["A) ==", "B) =", "C) :=", "D) =>"], "correct_answer": "B", "topic": "variables", "difficulty": "beginner" },
      { "id": 2, "question": "print(type(3.14)) ifadesinin çıktısı nedir?", "options": ["A) <class 'int'>", "B) <class 'float'>", "C) <class 'double'>", "D) <class 'decimal'>"], "correct_answer": "B", "topic": "data_types", "difficulty": "beginner" },
      { "id": 3, "question": "'Hello' + ' ' + 'World' ifadesinin sonucu nedir?", "options": ["A) HelloWorld", "B) Hello World", "C) Hello + World", "D) Hata verir"], "correct_answer": "B", "topic": "strings", "difficulty": "beginner" },
      { "id": 4, "question": "if x > 5: ifadesinden sonra ne gelmelidir?", "options": ["A) Süslü parantez {}", "B) Girinti (indentation)", "C) Noktalı virgül ;", "D) then anahtar kelimesi"], "correct_answer": "B", "topic": "conditionals", "difficulty": "beginner" },
      { "id": 5, "question": "for i in range(3): print(i) çıktısı nedir?", "options": ["A) 1 2 3", "B) 0 1 2", "C) 0 1 2 3", "D) 1 2"], "correct_answer": "B", "topic": "loops", "difficulty": "beginner" }
    ]
  },
  "java": {
      "test_info": { "title": "Java Seviye Belirleme Testi", "total_questions": 15 },
      "questions": [
        { "id": 1, "question": "Java'da hangisi doğru bir değişken ismidir?", "options": ["A) 123variable", "B) _variable", "C) variable-name", "D) class"], "correct_answer": "B", "topic": "variables", "difficulty": "beginner" },
        { "id": 2, "question": "Java'da '==' operatörü neyi karşılaştırır? (Nesneler için)", "options": ["A) Değerleri", "B) Referansları (Hafıza Adreslerini)", "C) Hem değerleri hem referansları", "D) İçeriklerini"], "correct_answer": "B", "topic": "operators", "difficulty": "beginner" },
        { "id": 3, "question": "Aşağıdaki döngülerden hangisi en az bir kere çalışır?", "options": ["A) for", "B) while", "C) do-while", "D) Hepsi"], "correct_answer": "C", "topic": "loops", "difficulty": "beginner" },
        { "id": 4, "question": "Java'da bir metodun geri dönüş değeri yoksa hangi keyword kullanılır?", "options": ["A) null", "B) void", "C) empty", "D) none"], "correct_answer": "B", "topic": "methods", "difficulty": "beginner" },
        { "id": 5, "question": "int[] numbers = new int[5]; dizisinde kaç eleman vardır?", "options": ["A) 4", "B) 5", "C) 6", "D) Belirsiz"], "correct_answer": "B", "topic": "arrays", "difficulty": "beginner" },
        { "id": 6, "question": "Hangisi OOP'nin temel prensiplerinden biri DEĞİLDİR?", "options": ["A) Encapsulation", "B) Inheritance", "C) Polymorphism", "D) Iteration"], "correct_answer": "D", "topic": "oop", "difficulty": "intermediate" },
        { "id": 7, "question": "'private' access modifier ne anlama gelir?", "options": ["A) Sadece aynı class içinden erişilebilir", "B) Aynı package içinden erişilebilir", "C) Tüm class'lardan erişilebilir", "D) Sadece alt sınıflardan erişilebilir"], "correct_answer": "A", "topic": "encapsulation", "difficulty": "intermediate" },
        { "id": 8, "question": "Hangisi Java'da exception handling için kullanılan keyword'lerden biri DEĞİLDİR?", "options": ["A) try", "B) catch", "C) finally", "D) error"], "correct_answer": "D", "topic": "exceptions", "difficulty": "intermediate" },
        { "id": 9, "question": "ArrayList ve LinkedList arasındaki temel fark nedir?", "options": ["A) ArrayList synchronized'dır", "B) LinkedList daha hızlıdır (her zaman)", "C) ArrayList array tabanlıdır, LinkedList node tabanlıdır", "D) LinkedList daha az hafıza kullanır"], "correct_answer": "C", "topic": "collections", "difficulty": "intermediate" },
        { "id": 10, "question": "'final' keyword'ü bir class'ın önünde kullanılırsa ne olur?", "options": ["A) Değiştirilemez", "B) Override edilemez", "C) O class'tan kalıtım alınamaz (extend edilemez)", "D) Hiçbir şey olmaz"], "correct_answer": "C", "topic": "oop", "difficulty": "intermediate" },
        { "id": 11, "question": "HashMap'te null key kabul edilir mi?", "options": ["A) Evet, sadece bir tane", "B) Evet, birden fazla", "C) Hayır, hiç kabul edilmez", "D) Sadece value'lar null olabilir"], "correct_answer": "A", "topic": "collections", "difficulty": "advanced" },
        { "id": 12, "question": "Thread'ler arasında senkronizasyon için hangisi kullanılmaz?", "options": ["A) volatile", "B) synchronized", "C) transient", "D) AtomicInteger"], "correct_answer": "C", "topic": "multithreading", "difficulty": "advanced" },
        { "id": 13, "question": "Java'da memory leak nasıl oluşabilir?", "options": ["A) Static collection'lara sürekli eleman ekleyip çıkarmamak", "B) Kapatılmayan veritabanı bağlantıları", "C) Kaydı silinmeyen listener'lar", "D) Hepsi"], "correct_answer": "D", "topic": "memory", "difficulty": "advanced" },
        { "id": 14, "question": "Java 8 Stream API'de map() ve flatMap() arasındaki fark nedir?", "options": ["A) map bir-e-bir, flatMap bir-e-çok dönüşüm yapar", "B) flatMap() daha yavaştır", "C) map() sadece sayılarla çalışır", "D) Fark yoktur"], "correct_answer": "A", "topic": "streams", "difficulty": "advanced" },
        { "id": 15, "question": "JVM'de PermGen ve Metaspace arasındaki fark nedir?", "options": ["A) PermGen Java 8'de Metaspace ile değiştirilmiştir", "B) Metaspace native memory kullanır", "C) Metaspace dinamik olarak büyüyebilir", "D) Hepsi"], "correct_answer": "D", "topic": "jvm", "difficulty": "advanced" }
    ]
  },
  "javascript": {
    "test_info": { "title": "JavaScript Seviye Belirleme Testi", "total_questions": 10 },
    "questions": [
      { "id": 1, "question": "JavaScript'te bir değişken tanımlamak için kullanılan anahtar kelimelerden hangisi yeniden atanamaz (non-reassignable)?", "options": ["A) var", "B) let", "C) const", "D) static"], "correct_answer": "C", "topic": "variables", "difficulty": "beginner" },
      { "id": 2, "question": "console.log(typeof 42) ifadesinin çıktısı nedir?", "options": ["A) number", "B) integer", "C) float", "D) int"], "correct_answer": "A", "topic": "data_types", "difficulty": "beginner" },
      { "id": 3, "question": "Bir string'i bir sayıya dönüştürmek için hangi fonksiyon kullanılır?", "options": ["A) String()", "B) Number()", "C) toInteger()", "D) parseFloat()"], "correct_answer": "B", "topic": "type_conversion", "difficulty": "beginner" },
      { "id": 4, "question": "'5' == 5 ifadesinin sonucu nedir?", "options": ["A) true", "B) false", "C) undefined", "D) Hata verir"], "correct_answer": "A", "topic": "operators", "difficulty": "beginner" },
      { "id": 5, "question": "'5' === 5 ifadesinin sonucu nedir?", "options": ["A) true", "B) false", "C) null", "D) Hata verir"], "correct_answer": "B", "topic": "operators", "difficulty": "beginner" },
      { "id": 6, "question": "Bir dizi (array) oluşturmak için hangi sözdizimi doğrudur?", "options": ["A) {1, 2, 3}", "B) (1, 2, 3)", "C) [1, 2, 3]", "D) <1, 2, 3>"], "correct_answer": "C", "topic": "arrays", "difficulty": "beginner" },
      { "id": 7, "question": "Bir fonksiyon tanımlamak için en yaygın anahtar kelime hangisidir?", "options": ["A) func", "B) method", "C) def", "D) function"], "correct_answer": "D", "topic": "functions", "difficulty": "beginner" },
      { "id": 8, "question": "DOM'da bir elementi ID'sine göre seçmek için hangi metod kullanılır?", "options": ["A) getElementByName()", "B) querySelector()", "C) getElementById()", "D) findElement()"], "correct_answer": "C", "topic": "dom", "difficulty": "beginner" },
      { "id": 9, "question": "for (let i = 0; i < 3; i++) { console.log(i); } kodunun çıktısı nedir?", "options": ["A) 1 2 3", "B) 0 1 2", "C) 1 2", "D) 0 1 2 3"], "correct_answer": "B", "topic": "loops", "difficulty": "beginner" },
      { "id": 10, "question": "Bir yorum satırı oluşturmak için hangi karakterler kullanılır?", "options": ["A) //", "B) ##", "C) <!-- -->", "D) /* */ "], "correct_answer": "A", "topic": "syntax", "difficulty": "beginner" }
    ]
  }
};


const Quiz = () => {
    const { language } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const [questions, setQuestions] = useState([]);
    const [testTitle, setTestTitle] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // Cevapları {soruId: cevap} formatında sakla
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        const testData = placementTestData[language.toLowerCase()];

        if (testData) {
            setQuestions(testData.questions);
            setTestTitle(testData.test_info.title);
        } else {
            console.error("Geçersiz dil seçimi veya test verisi bulunamadı!");
            navigate('/language-selection');
        }
    }, [language, navigate, userId]);

    const handleOptionSelect = (questionId, option) => {
        // Cevabı A, B, C, D formatında sakla
        const answerLetter = option.substring(0, 1);
        setAnswers({ ...answers, [questionId]: answerLetter });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // --- KUSURSUZ Hale Getirilmiş handleSubmit Fonksiyonu ---
    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        // Backend'in ve AI modülünün beklediği payload'ı oluştur
        const payload = {
            userId: userId,
            language: language.toUpperCase(),
            answers: answers // {soruId: cevap} formatındaki cevap nesnesi
        };

        try {
            const response = await axios.post('http://localhost:8080/api/progress/analyze', payload);
            console.log("AI Analiz Sonucu Başarıyla Alındı:", response.data);
            
            alert("Test tamamlandı! Size özel yol haritanız başarıyla oluşturuldu.");
            navigate('/dashboard');

        } catch (err) {
            console.error("Test sonuçları gönderilirken bir hata oluştu:", err);
            setError('Analiz sunucusuna bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
            setIsLoading(false);
        }
    };

    if (questions.length === 0) {
        return <div>Test Yükleniyor...</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    return (
        <div className="quiz-container">
            <div className="quiz-card">
                <h2 className="quiz-title">{testTitle}</h2>
                {error && <p className="quiz-error">{error}</p>}
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
                <div className="quiz-content">
                    <p className="question-counter">Soru {currentQuestionIndex + 1} / {questions.length}</p>
                    <h3 className="question-text">{currentQuestion.question}</h3>
                    <div className="options-container">
                        {currentQuestion.options.map((option, index) => (
                            <div 
                                key={index} 
                                className={`option ${answers[currentQuestion.id] === option.substring(0,1) ? 'selected' : ''}`} 
                                onClick={() => handleOptionSelect(currentQuestion.id, option)}
                            >
                                <span className="option-letter">{option.substring(0, 2)}</span>
                                <span>{option.substring(3)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="quiz-footer">
                    <button className="nav-button prev-button" onClick={handlePrev} disabled={currentQuestionIndex === 0}>Önceki</button>
                    {currentQuestionIndex < questions.length - 1 ? (
                        <button className="nav-button next-button" onClick={handleNext}>Sonraki</button>
                    ) : (
                        <button className="nav-button submit-button" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? "Sonuçlar Analiz Ediliyor..." : "Testi Bitir ve Yol Haritanı Gör"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quiz;

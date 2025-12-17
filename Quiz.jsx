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
        "test_info": { "title": "Java Seviye Belirleme Testi", "total_questions": 30 },
        "questions": [
            { "id": 1, "question": "Java'da hangisi doğru bir değişken ismidir?", "options": ["A) 123variable", "B) _variable", "C) variable-name", "D) class"], "correct_answer": "B", "topic": "variables", "difficulty": "beginner" },
            { "id": 2, "question": "Java'da '==' operatörü nesnelerde neyi karşılaştırır?", "options": ["A) Değerleri", "B) Referansları", "C) İçerikleri", "D) Tipleri"], "correct_answer": "B", "topic": "operators", "difficulty": "beginner" },
            { "id": 3, "question": "Hangi döngü en az bir kez çalışır?", "options": ["A) for", "B) while", "C) do-while", "D) foreach"], "correct_answer": "C", "topic": "loops", "difficulty": "beginner" },
            { "id": 4, "question": "Geri dönüş değeri olmayan metod için hangi keyword kullanılır?", "options": ["A) null", "B) void", "C) empty", "D) none"], "correct_answer": "B", "topic": "methods", "difficulty": "beginner" },
            { "id": 5, "question": "int[] arr = new int[5]; dizisinin boyu kaçtır?", "options": ["A) 4", "B) 5", "C) 6", "D) 0"], "correct_answer": "B", "topic": "arrays", "difficulty": "beginner" },
            { "id": 6, "question": "OOP'nin temel prensiplerinden biri değildir?", "options": ["A) Encapsulation", "B) Inheritance", "C) Polymorphism", "D) Compilation"], "correct_answer": "D", "topic": "oop", "difficulty": "beginner" },
            { "id": 7, "question": "private erişim belirleyicisi ne anlama gelir?", "options": ["A) Her yerden erişilir", "B) Aynı package", "C) Aynı class", "D) Alt class"], "correct_answer": "C", "topic": "encapsulation", "difficulty": "beginner" },
            { "id": 8, "question": "Java programı hangi metodla başlar?", "options": ["A) start()", "B) run()", "C) main()", "D) init()"], "correct_answer": "C", "topic": "syntax", "difficulty": "beginner" },
            { "id": 9, "question": "char veri tipi ne tutar?", "options": ["A) Metin", "B) Karakter", "C) Boolean", "D) Nesne"], "correct_answer": "B", "topic": "datatypes", "difficulty": "beginner" },
            { "id": 10, "question": "String sınıfı mutable mıdır?", "options": ["A) Evet", "B) Hayır", "C) Bazen", "D) JVM'e bağlı"], "correct_answer": "B", "topic": "string", "difficulty": "beginner" },

            { "id": 11, "question": "for döngüsü genellikle ne için kullanılır?", "options": ["A) Sonsuz döngü", "B) Sayaç kontrollü", "C) Koşulsuz", "D) Event"], "correct_answer": "B", "topic": "loops", "difficulty": "intermediate" },
            { "id": 12, "question": "Array ve ArrayList arasındaki temel fark nedir?", "options": ["A) Hız", "B) Boyut", "C) Tip", "D) Thread"], "correct_answer": "B", "topic": "collections", "difficulty": "intermediate" },
            { "id": 13, "question": "Method overloading neye dayanır?", "options": ["A) Return type", "B) Parametre sayısı/tipi", "C) Access modifier", "D) Class adı"], "correct_answer": "B", "topic": "methods", "difficulty": "intermediate" },
            { "id": 14, "question": "this anahtar kelimesi neyi temsil eder?", "options": ["A) Class", "B) Metod", "C) Mevcut nesne", "D) Parent"], "correct_answer": "C", "topic": "oop", "difficulty": "intermediate" },
            { "id": 15, "question": "Static metodlar neye aittir?", "options": ["A) Nesne", "B) Class", "C) Interface", "D) JVM"], "correct_answer": "B", "topic": "static", "difficulty": "intermediate" },
            { "id": 16, "question": "final keyword'ü değişkende ne yapar?", "options": ["A) Silinir", "B) Değiştirilemez", "C) Gizlenir", "D) Override"], "correct_answer": "B", "topic": "final", "difficulty": "intermediate" },
            { "id": 17, "question": "Exception handling için hangisi kullanılmaz?", "options": ["A) try", "B) catch", "C) throw", "D) error"], "correct_answer": "D", "topic": "exceptions", "difficulty": "intermediate" },
            { "id": 18, "question": "Constructor'ın return type'ı var mıdır?", "options": ["A) Evet", "B) Hayır", "C) void", "D) Class"], "correct_answer": "B", "topic": "constructors", "difficulty": "intermediate" },
            { "id": 19, "question": "Abstract class'ta ne olabilir?", "options": ["A) Sadece abstract metod", "B) Sadece concrete", "C) İkisi de", "D) Constructor yok"], "correct_answer": "C", "topic": "abstraction", "difficulty": "intermediate" },
            { "id": 20, "question": "Interface içinde değişkenler nasıldır?", "options": ["A) private", "B) protected", "C) public static final", "D) local"], "correct_answer": "C", "topic": "interfaces", "difficulty": "intermediate" },

            { "id": 21, "question": "HashMap null key kabul eder mi?", "options": ["A) Hayır", "B) 1 tane", "C) Birden fazla", "D) Sadece value"], "correct_answer": "B", "topic": "collections", "difficulty": "advanced" },
            { "id": 22, "question": "ConcurrentHashMap neden kullanılır?", "options": ["A) Hız", "B) Thread safety", "C) Memory", "D) IO"], "correct_answer": "B", "topic": "multithreading", "difficulty": "advanced" },
            { "id": 23, "question": "volatile keyword ne sağlar?", "options": ["A) Atomicity", "B) Visibility", "C) Lock", "D) Speed"], "correct_answer": "B", "topic": "multithreading", "difficulty": "advanced" },
            { "id": 24, "question": "Stream API map() ne yapar?", "options": ["A) Filtreler", "B) Dönüştürür", "C) Sıralar", "D) Toplar"], "correct_answer": "B", "topic": "streams", "difficulty": "advanced" },
            { "id": 25, "question": "flatMap() ne zaman kullanılır?", "options": ["A) Nested yapı", "B) Sayılar", "C) String", "D) Null"], "correct_answer": "A", "topic": "streams", "difficulty": "advanced" },
            { "id": 26, "question": "JVM hangi bileşeni içermez?", "options": ["A) ClassLoader", "B) GC", "C) JIT", "D) Compiler"], "correct_answer": "D", "topic": "jvm", "difficulty": "advanced" },
            { "id": 27, "question": "Memory leak Java'da nasıl oluşur?", "options": ["A) GC yok", "B) Referans bırakılmaz", "C) Referans silinmez", "D) Stack"], "correct_answer": "C", "topic": "memory", "difficulty": "advanced" },
            { "id": 28, "question": "Checked exception ne zaman yakalanır?", "options": ["A) Runtime", "B) Compile time", "C) JVM", "D) GC"], "correct_answer": "B", "topic": "exceptions", "difficulty": "advanced" },
            { "id": 29, "question": "Optional sınıfının amacı nedir?", "options": ["A) Hız", "B) Null safety", "C) Thread", "D) IO"], "correct_answer": "B", "topic": "java8", "difficulty": "advanced" },
            { "id": 30, "question": "Metaspace neyi saklar?", "options": ["A) Nesneler", "B) Class metadata", "C) Stack", "D) Heap"], "correct_answer": "B", "topic": "jvm", "difficulty": "advanced" }
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
                                className={`option ${answers[currentQuestion.id] === option.substring(0, 1) ? 'selected' : ''}`}
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

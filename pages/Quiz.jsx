import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Quiz.css';

// ✅ placementTestData artık kendi kendini referanslamıyor
const placementTestData = {
  python: {
    test_info: { title: 'Python Seviye Belirleme Testi', total_questions: 15 },
    questions: [
      { id: 1, question: "Python'da bir değişkene değer atamak için hangi operatör kullanılır?", options: ["A) ==", "B) =", "C) :=", "D) =>"], correct_answer: "B", topic: "variables", difficulty: "beginner" },
      { id: 2, question: "print(type(3.14)) ifadesinin çıktısı nedir?", options: ["A) <class 'int'>", "B) <class 'float'>", "C) <class 'double'>", "D) <class 'decimal'>"], correct_answer: "B", topic: "data_types", difficulty: "beginner" },
      { id: 3, question: "'Hello' + ' ' + 'World' ifadesinin sonucu nedir?", options: ["A) HelloWorld", "B) Hello World", "C) Hello + World", "D) Hata verir"], correct_answer: "B", topic: "strings", difficulty: "beginner" },
      { id: 4, question: "if x > 5: ifadesinden sonra ne gelmelidir?", options: ["A) Süslü parantez {}", "B) Girinti (indentation)", "C) Noktalı virgül ;", "D) then anahtar kelimesi"], correct_answer: "B", topic: "conditionals", difficulty: "beginner" },
      { id: 5, question: "for i in range(3): print(i) çıktısı nedir?", options: ["A) 1 2 3", "B) 0 1 2", "C) 0 1 2 3", "D) 1 2"], correct_answer: "B", topic: "loops", difficulty: "beginner" },

      { id: 6, question: "Aşağıdakilerden hangisi list comprehension örneğidir?", options: ["A) for i in range(5): print(i)", "B) [i for i in range(5)]", "C) list(range(5))", "D) print(range(5))"], correct_answer: "B", topic: "list_comprehension", difficulty: "intermediate" },
      { id: 7, question: "Exception yakalama için doğru kullanım hangisidir?", options: ["A) try: x=1/0", "B) catch ZeroDivisionError", "C) try: x=1/0 except ZeroDivisionError: pass", "D) try:\n    x=1/0\nexcept ZeroDivisionError:\n    pass"], correct_answer: "D", topic: "exceptions", difficulty: "intermediate" },
      { id: 8, question: "Dosya güvenli şekilde nasıl açılır?", options: ["A) open('a.txt')", "B) with open('a.txt') as f:", "C) file('a.txt')", "D) open file a.txt"], correct_answer: "B", topic: "file_handling", difficulty: "intermediate" },
      { id: 9, question: "self neyi temsil eder?", options: ["A) Sınıfı", "B) Fonksiyonu", "C) Nesnenin kendisini", "D) Static alanı"], correct_answer: "C", topic: "oop", difficulty: "intermediate" },
      { id: 10, question: "json.load() ne yapar?", options: ["A) JSON’u stringe çevirir", "B) JSON’u dosyaya yazar", "C) JSON dosyasını Python objesine çevirir", "D) JSON doğrular"], correct_answer: "C", topic: "json", difficulty: "intermediate" },
      { id: 11, question: "*args ne için kullanılır?", options: ["A) Zorunlu parametre", "B) Anahtar parametre", "C) Değişken sayıda argüman almak", "D) Decorator tanımlamak"], correct_answer: "C", topic: "functions", difficulty: "intermediate" },

      { id: 12, question: "Aşağıdakilerden hangisi generator’dür?", options: ["A) [x for x in range(5)]", "B) (x for x in range(5))", "C) list(range(5))", "D) range(5)"], correct_answer: "B", topic: "generators", difficulty: "advanced" },
      { id: 13, question: "async/await ne amaçla kullanılır?", options: ["A) Çok çekirdekli işlem", "B) Paralel thread", "C) Asenkron I/O", "D) Bellek yönetimi"], correct_answer: "C", topic: "async", difficulty: "advanced" },
      { id: 14, question: "Python’da GIL neyi etkiler?", options: ["A) Bellek kullanımı", "B) Thread’lerin CPU paralelliği", "C) Dosya okuma", "D) Garbage collection"], correct_answer: "B", topic: "threading", difficulty: "advanced" },
      { id: 15, question: "Decorator ne yapar?", options: ["A) Sınıf oluşturur", "B) Fonksiyon davranışını sarmalar/değiştirir", "C) Hata yakalar", "D) Thread başlatır"], correct_answer: "B", topic: "decorators", difficulty: "advanced" }
    ]
  }
};

const normalizeOptions = (options) => {
  if (Array.isArray(options)) return options;
  if (options && typeof options === 'object') {
    return Object.entries(options).map(([k, v]) => `${k}) ${v}`);
  }
  return [];
};

const Quiz = () => {
  const { language } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [questions, setQuestions] = useState([]);
  const [testTitle, setTestTitle] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const langKey = (language || '').toLowerCase();
    const testData = placementTestData[langKey];

    if (testData) {
      setQuestions(testData.questions);
      setTestTitle(testData.test_info.title);
      setCurrentQuestionIndex(0);
      setAnswers({});
    } else {
      console.error('Geçersiz dil seçimi veya test verisi bulunamadı!');
      navigate('/language-selection');
    }
  }, [language, navigate, userId]);

  const currentQuestion = questions[currentQuestionIndex];

  const currentOptions = useMemo(() => {
    return normalizeOptions(currentQuestion?.options);
  }, [currentQuestion]);

  const handleOptionSelect = (questionId, optionText) => {
    const answerLetter = (optionText || '').trim().substring(0, 1).toUpperCase();
    setAnswers((prev) => ({ ...prev, [questionId]: answerLetter }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    const payload = {
      userId,
      language: (language || '').toUpperCase(),
      answers
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/progress/analyze', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Analiz Sonucu:', response.data);
      alert('Test tamamlandı! Size özel yol haritanız oluşturuldu.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Test sonuçları gönderilirken hata oluştu:', err);
      setError('Analiz sunucusuna bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!questions || questions.length === 0) return <div>Test Yükleniyor...</div>;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2 className="quiz-title">{testTitle}</h2>
        {error && <p className="quiz-error">{error}</p>}

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="quiz-content">
          <p className="question-counter">
            Soru {currentQuestionIndex + 1} / {questions.length}
          </p>

          <h3 className="question-text">{currentQuestion.question}</h3>

          <div className="options-container">
            {currentOptions.map((option, index) => {
              const letter = option.substring(0, 1);
              const isSelected = answers[currentQuestion.id] === letter;

              return (
                <div
                  key={index}
                  className={`option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(currentQuestion.id, option)}
                >
                  <span className="option-letter">{option.substring(0, 2)}</span>
                  <span>{option.substring(3)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="quiz-footer">
          <button className="nav-button prev-button" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
            Önceki
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button className="nav-button next-button" onClick={handleNext}>
              Sonraki
            </button>
          ) : (
            <button className="nav-button submit-button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Sonuçlar Analiz Ediliyor...' : 'Testi Bitir ve Yol Haritanı Gör'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;

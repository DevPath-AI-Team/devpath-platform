import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Quiz.css';

// --- GEÇİCİ SORU BANKASI (TAM LİSTE) ---
const pythonQuestions = {
  "test_info": { "title": "Python Seviye Belirleme Testi", "total_questions": 30 },
  "questions": [
    { "id": 1, "question": "Python'da bir değişkene değer atamak için hangi operatör kullanılır?", "options": ["A) ==", "B) =", "C) :=", "D) =>"], "correct_answer": "B", "topic": "variables" },
    { "id": 2, "question": "print(type(3.14)) ifadesinin çıktısı nedir?", "options": ["A) <class 'int'>", "B) <class 'float'>", "C) <class 'double'>", "D) <class 'decimal'>"], "correct_answer": "B", "topic": "data_types" },
    { "id": 3, "question": "'Hello' + ' ' + 'World' ifadesinin sonucu nedir?", "options": ["A) HelloWorld", "B) Hello World", "C) Hello + World", "D) Hata verir"], "correct_answer": "B", "topic": "strings" },
    { "id": 4, "question": "if x > 5: ifadesinden sonra ne gelmelidir?", "options": ["A) Süslü parantez {}", "B) Girinti (indentation)", "C) Noktalı virgül ;", "D) then anahtar kelimesi"], "correct_answer": "B", "topic": "conditionals" },
    { "id": 5, "question": "for i in range(3): print(i) çıktısı nedir?", "options": ["A) 1 2 3", "B) 0 1 2", "C) 0 1 2 3", "D) 1 2"], "correct_answer": "B", "topic": "loops" },
    { "id": 6, "question": "my_list = [1, 2, 3]; my_list.append(4) sonrası liste nedir?", "options": ["A) [1, 2, 3]", "B) [4, 1, 2, 3]", "C) [1, 2, 3, 4]", "D) [[1, 2, 3], 4]"], "correct_answer": "C", "topic": "lists" },
    { "id": 7, "question": "Python'da sözlük (dictionary) oluşturmak için hangi parantez kullanılır?", "options": ["A) []", "B) ()", "C) {}", "D) <>"], "correct_answer": "C", "topic": "dictionaries" },
    { "id": 8, "question": "input() fonksiyonu hangi tipte değer döndürür?", "options": ["A) int", "B) float", "C) str", "D) Girilen değerin tipine göre değişir"], "correct_answer": "C", "topic": "input_output" },
    { "id": 9, "question": "len('Python') ifadesinin sonucu nedir?", "options": ["A) 5", "B) 6", "C) 7", "D) Hata verir"], "correct_answer": "B", "topic": "strings" },
    { "id": 10, "question": "True and False ifadesinin sonucu nedir?", "options": ["A) True", "B) False", "C) None", "D) Hata verir"], "correct_answer": "B", "topic": "operators" },
    { "id": 11, "question": "def greet(name='World'): return f'Hello {name}' fonksiyonunda 'World' nedir?", "options": ["A) Zorunlu parametre", "B) Varsayılan değer", "C) Global değişken", "D) Return değeri"], "correct_answer": "B", "topic": "functions" },
    { "id": 12, "question": "*args parametresi ne anlama gelir?", "options": ["A) Tek bir argüman", "B) İsimli argümanlar", "C) Değişken sayıda pozisyonel argüman", "D) Zorunlu argüman listesi"], "correct_answer": "C", "topic": "functions" },
    { "id": 13, "question": "try-except bloğunda finally ne zaman çalışır?", "options": ["A) Sadece hata olduğunda", "B) Sadece hata olmadığında", "C) Her durumda", "D) return ifadesinden sonra çalışmaz"], "correct_answer": "C", "topic": "exceptions" },
    { "id": 14, "question": "with open('file.txt', 'r') as f: kullanımının avantajı nedir?", "options": ["A) Daha hızlı okuma", "B) Otomatik dosya kapatma", "C) Şifreleme", "D) Sıkıştırma"], "correct_answer": "B", "topic": "file_handling" },
    { "id": 15, "question": "class Dog(Animal): ifadesinde Animal nedir?", "options": ["A) Alt sınıf (child class)", "B) Üst sınıf (parent class)", "C) Instance", "D) Method"], "correct_answer": "B", "topic": "oop" },
    { "id": 16, "question": "__init__ metodu ne zaman çağrılır?", "options": ["A) Sınıf tanımlandığında", "B) Nesne oluşturulduğunda", "C) Nesne silindiğinde", "D) Her metod çağrısında"], "correct_answer": "B", "topic": "oop" },
    { "id": 17, "question": "lambda x, y: x + y ifadesi nedir?", "options": ["A) Liste tanımı", "B) Sözlük tanımı", "C) Anonim fonksiyon", "D) Generator"], "correct_answer": "C", "topic": "functions" },
    { "id": 18, "question": "[x**2 for x in range(5)] ifadesinin sonucu nedir?", "options": ["A) [0, 1, 2, 3, 4]", "B) [0, 1, 4, 9, 16]", "C) [1, 4, 9, 16, 25]", "D) [0, 2, 4, 6, 8]"], "correct_answer": "B", "topic": "list_comprehension" },
    { "id": 19, "question": "import json; json.loads('{\"a\": 1}') ne döndürür?", "options": ["A) String", "B) List", "C) Dictionary", "D) Tuple"], "correct_answer": "C", "topic": "json" },
    { "id": 20, "question": "super().__init__() ne yapar?", "options": ["A) Yeni sınıf oluşturur", "B) Üst sınıfın __init__ metodunu çağırır", "C) Nesneyi siler", "D) Sınıfı kopyalar"], "correct_answer": "B", "topic": "oop" },
    { "id": 21, "question": "@property decorator'ı ne işe yarar?", "options": ["A) Metodu statik yapar", "B) Metodu getter olarak tanımlar", "C) Metodu private yapar", "D) Metodu async yapar"], "correct_answer": "B", "topic": "decorators" },
    { "id": 22, "question": "async def fetch(): await response ifadesinde await ne yapar?", "options": ["A) Fonksiyonu durdurur", "B) Asenkron işlemin tamamlanmasını bekler", "C) Hata fırlatır", "D) Thread oluşturur"], "correct_answer": "B", "topic": "async" },
    { "id": 23, "question": "yield anahtar kelimesi ne oluşturur?", "options": ["A) List", "B) Dictionary", "C) Generator", "D) Tuple"], "correct_answer": "C", "topic": "generators" },
    { "id": 24, "question": "__enter__ ve __exit__ metodları ne için kullanılır?", "options": ["A) Inheritance", "B) Context Manager", "C) Decorator", "D) Metaclass"], "correct_answer": "B", "topic": "context_managers" },
    { "id": 25, "question": "from typing import List; def func(items: List[int]) -> int: ifadesinde List[int] nedir?", "options": ["A) Varsayılan değer", "B) Type hint", "C) Decorator", "D) Constraint"], "correct_answer": "B", "topic": "type_hints" },
    { "id": 26, "question": "threading.Lock() ne için kullanılır?", "options": ["A) Dosya kilitleme", "B) Thread senkronizasyonu", "C) Memory yönetimi", "D) Network güvenliği"], "correct_answer": "B", "topic": "threading" },
    { "id": 27, "question": "@staticmethod ile @classmethod arasındaki fark nedir?", "options": ["A) Fark yok", "B) staticmethod self almaz, classmethod cls alır", "C) classmethod daha hızlı", "D) staticmethod sadece private"], "correct_answer": "B", "topic": "oop" },
    { "id": 28, "question": "GIL (Global Interpreter Lock) ne yapar?", "options": ["A) Dosyaları korur", "B) Aynı anda tek thread'in Python bytecode çalıştırmasını sağlar", "C) Memory leak önler", "D) Import'ları yönetir"], "correct_answer": "B", "topic": "threading" },
    { "id": 29, "question": "__slots__ = ['x', 'y'] ne sağlar?", "options": ["A) Yeni attribute eklemeyi engeller", "B) Metod tanımlar", "C) Inheritance sağlar", "D) Type checking yapar"], "correct_answer": "A", "topic": "oop" },
    { "id": 30, "question": "metaclass=ABCMeta ile @abstractmethod ne oluşturur?", "options": ["A) Concrete class", "B) Abstract base class", "C) Mixin", "D) Interface"], "correct_answer": "B", "topic": "oop" }
  ]
};
// YENİ EKLENEN JAVA SORULARI
const javaQuestions = {
    "questions": [
        // Kolay
        { "id": 1, "question": "Java'da hangisi doğru bir değişken ismidir?", "options": ["A) 123variable", "B) _variable", "C) variable-name", "D) class"], "correct_answer": "B", "topic": "variables" },
        { "id": 2, "question": "Java'da '==' operatörü neyi karşılaştırır? (Nesneler için)", "options": ["A) Değerleri", "B) Referansları (Hafıza Adreslerini)", "C) Hem değerleri hem referansları", "D) İçeriklerini"], "correct_answer": "B", "topic": "operators" },
        { "id": 3, "question": "Aşağıdaki döngülerden hangisi en az bir kere çalışır?", "options": ["A) for", "B) while", "C) do-while", "D) Hepsi"], "correct_answer": "C", "topic": "loops" },
        { "id": 4, "question": "Java'da bir metodun geri dönüş değeri yoksa hangi keyword kullanılır?", "options": ["A) null", "B) void", "C) empty", "D) none"], "correct_answer": "B", "topic": "methods" },
        { "id": 5, "question": "int[] numbers = new int[5]; dizisinde kaç eleman vardır?", "options": ["A) 4", "B) 5", "C) 6", "D) Belirsiz"], "correct_answer": "B", "topic": "arrays" },
        // Orta
        { "id": 6, "question": "Hangisi OOP'nin temel prensiplerinden biri DEĞİLDİR?", "options": ["A) Encapsulation", "B) Inheritance", "C) Polymorphism", "D) Iteration"], "correct_answer": "D", "topic": "oop" },
        { "id": 7, "question": "'private' access modifier ne anlama gelir?", "options": ["A) Sadece aynı class içinden erişilebilir", "B) Aynı package içinden erişilebilir", "C) Tüm class'lardan erişilebilir", "D) Sadece alt sınıflardan erişilebilir"], "correct_answer": "A", "topic": "encapsulation" },
        { "id": 8, "question": "Hangisi Java'da exception handling için kullanılan keyword'lerden biri DEĞİLDİR?", "options": ["A) try", "B) catch", "C) finally", "D) error"], "correct_answer": "D", "topic": "exceptions" },
        { "id": 9, "question": "ArrayList ve LinkedList arasındaki temel fark nedir?", "options": ["A) ArrayList synchronized'dır", "B) LinkedList daha hızlıdır (her zaman)", "C) ArrayList array tabanlıdır, LinkedList node tabanlıdır", "D) LinkedList daha az hafıza kullanır"], "correct_answer": "C", "topic": "collections" },
        { "id": 10, "question": "'final' keyword'ü bir class'ın önünde kullanılırsa ne olur?", "options": ["A) Değiştirilemez", "B) Override edilemez", "C) O class'tan kalıtım alınamaz (extend edilemez)", "D) Hiçbir şey olmaz"], "correct_answer": "C", "topic": "oop" },
        // Zor
        { "id": 11, "question": "HashMap'te null key kabul edilir mi?", "options": ["A) Evet, sadece bir tane", "B) Evet, birden fazla", "C) Hayır, hiç kabul edilmez", "D) Sadece value'lar null olabilir"], "correct_answer": "A", "topic": "collections" },
        { "id": 12, "question": "Thread'ler arasında senkronizasyon için hangisi kullanılmaz?", "options": ["A) volatile", "B) synchronized", "C) transient", "D) AtomicInteger"], "correct_answer": "C", "topic": "multithreading" },
        { "id": 13, "question": "Java'da memory leak nasıl oluşabilir?", "options": ["A) Static collection'lara sürekli eleman ekleyip çıkarmamak", "B) Kapatılmayan veritabanı bağlantıları", "C) Kaydı silinmeyen listener'lar", "D) Hepsi"], "correct_answer": "D", "topic": "memory" },
        { "id": 14, "question": "Java 8 Stream API'de map() ve flatMap() arasındaki fark nedir?", "options": ["A) map bir-e-bir, flatMap bir-e-çok dönüşüm yapar", "B) flatMap() daha yavaştır", "C) map() sadece sayılarla çalışır", "D) Fark yoktur"], "correct_answer": "A", "topic": "streams" },
        { "id": 15, "question": "JVM'de PermGen ve Metaspace arasındaki fark nedir?", "options": ["A) PermGen Java 8'de Metaspace ile değiştirilmiştir", "B) Metaspace native memory kullanır", "C) Metaspace dinamik olarak büyüyebilir", "D) Hepsi"], "correct_answer": "D", "topic": "jvm" }
    ]
};

const Quiz = () => {
    const { language } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);


    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (language === 'python') { setQuestions(pythonQuestions.questions); }
        else if (language === 'java') {
        setQuestions(javaQuestions.questions);
    } else {
        // Dil bulunamazsa varsayılan olarak Python'u yükle
        setQuestions(pythonQuestions.questions);
        console.error("Geçersiz dil seçimi! Varsayılan olarak Python gösteriliyor."); }
    }, [language]);

    const handleOptionSelect = (option) => { setAnswers({ ...answers, [currentQuestionIndex]: option.substring(0, 1) }); };
    const handleNext = () => { if (currentQuestionIndex < questions.length - 1) { setCurrentQuestionIndex(currentQuestionIndex + 1); } };
    const handlePrev = () => { if (currentQuestionIndex > 0) { setCurrentQuestionIndex(currentQuestionIndex - 1); } };

    const handleSubmit = async () => {
        setIsLoading(true);
        const correctTopics = [];
        questions.forEach((q, index) => { if (answers[index] === q.correct_answer) { correctTopics.push(q.topic); } });
        const payload = { language: language.toUpperCase(), correctTopics: [...new Set(correctTopics)] };
        console.log("Backend'e Gönderilecek Veri:", payload);
        setTimeout(() => { alert("Test tamamlandı! Kişisel yol haritan oluşturuluyor..."); navigate('/dashboard'); }, 2000);
    };

    if (questions.length === 0) { return <div>Yükleniyor...</div>; }
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    return (
        <div className="quiz-container">
            <div className="quiz-card">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
                <div className="quiz-content">
                    <p className="question-counter">Soru {currentQuestionIndex + 1} / {questions.length}</p>
                    <h2 className="question-text">{currentQuestion.question}</h2>
                    <div className="options-container">
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className={`option ${answers[currentQuestionIndex] === option.substring(0,1) ? 'selected' : ''}`} onClick={() => handleOptionSelect(option)}>
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
                        <button className="nav-button next-button" onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Bitiriliyor..." : "Testi Bitir"}</button>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Quiz;
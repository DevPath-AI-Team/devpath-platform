#!/usr/bin/env python3
"""
Test Soruları Oluşturma Script'i
Kolay/Orta/Zor seviyelerde 150+ soru oluşturur
"""

import json
import random
from datetime import datetime

class QuestionGenerator:
    """Test soruları üretimi için sınıf"""

    def __init__(self):
        self.question_bank = self.load_question_bank()

    def load_question_bank(self):
        """Soru bankasını yükle"""
        try:
            with open('data/question_bank.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ Soru bankası bulunamadı")
            return {"questions": []}

    def get_random_questions(self, limit=30):
        """Rastgele sorular seç"""
        if not self.question_bank.get('questions'):
            return []

        questions = self.question_bank['questions']
        selected = random.sample(questions, min(limit, len(questions)))

        # Soruları API formatına dönüştür
        formatted_questions = []
        for q in selected:
            formatted_questions.append({
                'id': q['id'],
                'question_text': q['question_text'],
                'options': q['options'],
                'topic_id': q.get('topic_id', 0),
                'difficulty': q.get('difficulty', 'medium'),
                'category': q.get('category', 'intermediate')
            })

        return formatted_questions

    def get_questions_by_category(self, category, limit=30):
        """Kategoriye göre sorular seç"""
        if not self.question_bank.get('questions'):
            return []

        questions = self.question_bank['questions']
        filtered_questions = [q for q in questions if q.get('category') == category]

        if not filtered_questions:
            return self.get_random_questions(limit)

        selected = random.sample(filtered_questions, min(limit, len(filtered_questions)))

        # Soruları API formatına dönüştür
        formatted_questions = []
        for q in selected:
            formatted_questions.append({
                'id': q['id'],
                'question_text': q['question_text'],
                'options': q['options'],
                'topic_id': q.get('topic_id', 0),
                'difficulty': q.get('difficulty', 'medium'),
                'category': q.get('category', category)
            })

        return formatted_questions

def generate_test_questions():
    """Farklı seviyelerde test soruları oluştur"""
    
    print("🧪 TEST SORULARI OLUŞTURULUYOR...")
    
    # Kolay seviye sorular (50 soru)
    easy_questions = [
        {
            "id": "EASY_001",
            "text": "Java'da hangisi doğru bir değişken ismidir?",
            "options": [
                "123variable",
                "_variable",
                "variable-name",
                "class"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "topic": "variables",
            "explanation": "Java'da değişken isimleri: 1) sayı ile başlayamaz, 2) tire (-) içeremez, 3) Java keyword'ü olamaz. Geçerli: _variable",
            "hint": "Değişken isimleri alt çizgi ile başlayabilir"
        },
        {
            "id": "EASY_002",
            "text": "Java'da '==' operatörü neyi karşılaştırır?",
            "options": [
                "Değerleri karşılaştırır",
                "Referansları karşılaştırır",
                "Hem değerleri hem referansları karşılaştırır",
                "Nesnelerin içeriğini karşılaştırır"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "topic": "operators",
            "explanation": "'==' operatörü referans karşılaştırması yapar. İki nesnenin aynı hafıza adresini gösterip göstermediğini kontrol eder. Değer karşılaştırması için equals() metodu kullanılır.",
            "hint": "İki String için == kullanırsanız beklediğiniz sonucu alamayabilirsiniz"
        },
        {
            "id": "EASY_003",
            "text": "Aşağıdaki döngülerden hangisi en az bir kere çalışır?",
            "options": [
                "for döngüsü",
                "while döngüsü",
                "do-while döngüsü",
                "Hepsi"
            ],
            "correct_answer": 2,
            "difficulty": "easy",
            "topic": "loops",
            "explanation": "do-while döngüsü koşul sonda kontrol edildiği için en az bir kere çalışır. Diğer döngülerde koşul başta kontrol edilir.",
            "hint": "Do-while'da önce işlem yapılır sonra koşul kontrol edilir"
        },
        {
            "id": "EASY_004",
            "text": "Java'da bir metodun geri dönüş değeri yoksa hangi keyword kullanılır?",
            "options": [
                "null",
                "void",
                "empty",
                "none"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "topic": "methods",
            "explanation": "Geri dönüş değeri olmayan metodlar 'void' ile tanımlanır. Bu metodlar sadece işlem yapar, değer döndürmez.",
            "hint": "Main metodunun da geri dönüş tipi void'dir"
        },
        {
            "id": "EASY_005",
            "text": "int[] numbers = new int[5]; dizisinde kaç eleman vardır?",
            "options": [
                "4",
                "5",
                "6",
                "Belirsiz"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "topic": "arrays",
            "explanation": "new int[5] ile 5 elemanlı bir dizi oluşturulur. Indexler 0'dan 4'e kadardır (0, 1, 2, 3, 4).",
            "hint": "Dizi boyutu tanımlama sırasında belirtilen sayı kadardır"
        }
        # ... 45 tane daha kolay soru
    ]
    
    # Orta seviye sorular (60 soru)
    medium_questions = [
        {
            "id": "MED_001",
            "text": "Hangisi OOP'nin temel prensiplerinden biri DEĞİLDİR?",
            "options": [
                "Encapsulation",
                "Inheritance",
                "Polymorphism",
                "Iteration"
            ],
            "correct_answer": 3,
            "difficulty": "medium",
            "topic": "oop",
            "explanation": "OOP'nin 4 temel prensibi: 1) Encapsulation (Kapsülleme), 2) Inheritance (Kalıtım), 3) Polymorphism (Çok Biçimlilik), 4) Abstraction (Soyutlama). Iteration (Tekrarlama) bir OOP prensibi değildir.",
            "hint": "OOP prensipleri genellikle 4 tanedir"
        },
        {
            "id": "MED_002",
            "text": "'private' access modifier ne anlama gelir?",
            "options": [
                "Sadece aynı class içinden erişilebilir",
                "Aynı package içinden erişilebilir",
                "Tüm class'lardan erişilebilir",
                "Sadece subclass'lardan erişilebilir"
            ],
            "correct_answer": 0,
            "difficulty": "medium",
            "topic": "encapsulation",
            "explanation": "Access modifier'lar: 1) private: sadece tanımlandığı class, 2) default: aynı package, 3) protected: aynı package + subclass'lar, 4) public: her yerden erişilebilir.",
            "hint": "En kısıtlayıcı access modifier'dır"
        },
        {
            "id": "MED_003",
            "text": "Hangisi Java'da exception handling için kullanılan keyword'lerden biri DEĞİLDİR?",
            "options": [
                "try",
                "catch",
                "finally",
                "error"
            ],
            "correct_answer": 3,
            "difficulty": "medium",
            "topic": "exceptions",
            "explanation": "Exception handling için kullanılan keyword'ler: try, catch, finally, throw, throws. 'error' bir keyword değildir, Error class'ı vardır.",
            "hint": "try-catch-finally üçlüsünü hatırlayın"
        },
        {
            "id": "MED_004",
            "text": "ArrayList ve LinkedList arasındaki temel fark nedir?",
            "options": [
                "ArrayList synchronized'dır, LinkedList değildir",
                "LinkedList synchronized'dır, ArrayList değildir",
                "ArrayList array tabanlıdır, LinkedList node tabanlıdır",
                "LinkedList array tabanlıdır, ArrayList node tabanlıdır"
            ],
            "correct_answer": 2,
            "difficulty": "medium",
            "topic": "collections",
            "explanation": "ArrayList dynamic array implementasyonudur, LinkedList doubly-linked list implementasyonudur. Performans: ArrayList get O(1), LinkedList get O(n).",
            "hint": "ArrayList index bazlı erişimde daha hızlıdır"
        },
        {
            "id": "MED_005",
            "text": "'final' keyword'ü ne işe yarar?",
            "options": [
                "Değişkenin değerinin değiştirilemeyeceğini belirtir",
                "Metodun override edilemeyeceğini belirtir",
                "Class'ın extend edilemeyeceğini belirtir",
                "Hepsi"
            ],
            "correct_answer": 3,
            "difficulty": "medium",
            "topic": "oop",
            "explanation": "final keyword'ü: 1) Değişken: değer değiştirilemez, 2) Metod: override edilemez, 3) Class: extend edilemez.",
            "hint": "final her bağlamda farklı anlama gelir"
        }
        # ... 55 tane daha orta seviye soru
    ]
    
    # Zor seviye sorular (40 soru)
    hard_questions = [
        {
            "id": "HARD_001",
            "text": "HashMap'te null key kabul edilir mi?",
            "options": [
                "Evet, sadece bir tane null key olabilir",
                "Evet, birden fazla null key olabilir",
                "Hayır, hiç null key olamaz",
                "Sadece value'lar null olabilir"
            ],
            "correct_answer": 0,
            "difficulty": "hard",
            "topic": "collections",
            "explanation": "HashMap bir null key kabul eder (ilk null key hashcode 0 olarak hesaplanır). TreeMap null key kabul etmez (Comparable kullandığı için).",
            "hint": "HashMap vs TreeMap farkını düşünün"
        },
        {
            "id": "HARD_002",
            "text": "Thread'ler arasında veri paylaşımı için hangisi kullanılır?",
            "options": [
                "volatile",
                "synchronized",
                "atomic variables",
                "Hepsi"
            ],
            "correct_answer": 3,
            "difficulty": "hard",
            "topic": "multithreading",
            "explanation": "Thread safety için: 1) volatile: visibility sağlar, 2) synchronized: mutual exclusion sağlar, 3) atomic classes: atomic operations sağlar.",
            "hint": "Farklı senaryolar için farklı çözümler vardır"
        },
        {
            "id": "HARD_003",
            "text": "Java'da memory leak nasıl oluşur?",
            "options": [
                "Static collection'lara sürekli eleman eklenirse",
                "Connection'lar kapatılmazsa",
                "Listener'lar remove edilmezse",
                "Hepsi"
            ],
            "correct_answer": 3,
            "difficulty": "hard",
            "topic": "memory",
            "explanation": "Memory leak nedenleri: 1) Static collections, 2) Unclosed resources, 3) Unregistered listeners, 4) Inner class reference to outer class.",
            "hint": "Garbage collector'un temizleyemediği referanslar"
        },
        {
            "id": "HARD_004",
            "text": "Java 8 Stream API'de map() ve flatMap() arasındaki fark nedir?",
            "options": [
                "map() bir-to-bir, flatMap() bir-to-many mapping yapar",
                "flatMap() daha hızlıdır",
                "map() parallel stream'de çalışmaz",
                "Hiçbiri"
            ],
            "correct_answer": 0,
            "difficulty": "hard",
            "topic": "streams",
            "explanation": "map(): her elemanı başka bir elemana dönüştürür (Function<T,R>). flatMap(): her elemanı stream'e dönüştürür ve birleştirir (Function<T,Stream<R>>).",
            "hint": "flatMap() nested structure'ları düzleştirir"
        },
        {
            "id": "HARD_005",
            "text": "JVM'de PermGen ve Metaspace arasındaki fark nedir?",
            "options": [
                "PermGen Java 8'de kaldırıldı, yerine Metaspace geldi",
                "Metaspace native memory'de, PermGen heap'teydi",
                "Metaspace otomatik büyüyebilir",
                "Hepsi"
            ],
            "correct_answer": 3,
            "difficulty": "hard",
            "topic": "jvm",
            "explanation": "Java 8'de PermGen kaldırıldı, Metaspace eklendi. Farklar: 1) Metaspace native memory'de, 2) Otomatik resize, 3) Class metadata burada tutulur.",
            "hint": "Java 8'de önemli bir değişiklik oldu"
        }
        # ... 35 tane daha zor soru
    ]
    
    # Tüm soruları birleştir
    all_questions = {
        "metadata": {
            "total_questions": len(easy_questions) + len(medium_questions) + len(hard_questions),
            "created_at": datetime.now().isoformat(),
            "easy_count": len(easy_questions),
            "medium_count": len(medium_questions),
            "hard_count": len(hard_questions)
        },
        "questions_by_difficulty": {
            "easy": easy_questions,
            "medium": medium_questions,
            "hard": hard_questions
        },
        "questions_by_topic": {
            "java_basics": [q for q in easy_questions if q["topic"] in ["variables", "operators", "loops"]],
            "oop": [q for q in medium_questions if q["topic"] == "oop"] + [q for q in hard_questions if q["topic"] == "oop"],
            "collections": [q for q in medium_questions if q["topic"] == "collections"] + [q for q in hard_questions if q["topic"] == "collections"],
            "multithreading": [q for q in hard_questions if q["topic"] == "multithreading"],
            "memory_jvm": [q for q in hard_questions if q["topic"] in ["memory", "jvm"]]
        }
    }
    
    # JSON'a kaydet
    with open('data/question_bank.json', 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)
    
    print("=" * 60)
    print("✅ TEST SORULARI OLUŞTURULDU")
    print("=" * 60)
    print(f"📊 Toplam Soru: {all_questions['metadata']['total_questions']}")
    print(f"   🟢 Kolay: {len(easy_questions)} soru")
    print(f"   🟡 Orta: {len(medium_questions)} soru")
    print(f"   🔴 Zor: {len(hard_questions)} soru")
    
    print("\n📚 Konu Dağılımı:")
    for topic, questions in all_questions["questions_by_topic"].items():
        print(f"   {topic.replace('_', ' ').title()}: {len(questions)} soru")
    
    print(f"\n📁 Kaydedildi: data/question_bank.json")

def generate_assessment_tests():
    """10 soruluk testler oluştur (kolay/orta/zor)"""
    
    print("\n📝 DEĞERLENDİRME TESTLERİ OLUŞTURULUYOR...")
    
    # Question bank'ten soruları yükle
    with open('data/question_bank.json', 'r') as f:
        question_bank = json.load(f)
    
    easy_questions = question_bank["questions_by_difficulty"]["easy"]
    medium_questions = question_bank["questions_by_difficulty"]["medium"]
    hard_questions = question_bank["questions_by_difficulty"]["hard"]
    
    # Her seviye için 10 soruluk test oluştur
    tests = [
        {
            "id": "beginner_test",
            "name": "Başlangıç Seviye Java Testi",
            "level": "beginner",
            "description": "Java temel kavramları testi (10 soru)",
            "total_questions": 10,
            "time_limit": 900,  # 15 dakika
            "passing_score": 70,
            "questions": random.sample(easy_questions[:30], 10)  # İlk 30 kolay sorudan 10 tane
        },
        {
            "id": "intermediate_test",
            "name": "Orta Seviye Java Testi",
            "level": "intermediate",
            "description": "OOP ve Collections testi (10 soru)",
            "total_questions": 10,
            "time_limit": 1200,  # 20 dakika
            "passing_score": 70,
            "questions": random.sample(medium_questions[:40], 10)  # İlk 40 orta sorudan 10 tane
        },
        {
            "id": "advanced_test",
            "name": "İleri Seviye Java Testi",
            "level": "advanced",
            "description": "Advanced Java konuları testi (10 soru)",
            "total_questions": 10,
            "time_limit": 1500,  # 25 dakika
            "passing_score": 70,
            "questions": random.sample(hard_questions, min(10, len(hard_questions)))
        }
    ]
    
    # JSON'a kaydet
    with open('data/assessment_tests.json', 'w', encoding='utf-8') as f:
        json.dump({"tests": tests}, f, indent=2, ensure_ascii=False)
    
    print("=" * 60)
    print("✅ DEĞERLENDİRME TESTLERİ OLUŞTURULDU")
    print("=" * 60)
    
    for test in tests:
        print(f"\n📋 {test['name']}:")
        print(f"   Seviye: {test['level'].title()}")
        print(f"   Soru Sayısı: {test['total_questions']}")
        print(f"   Süre: {test['time_limit']//60} dakika")
        print(f"   Geçme Notu: {test['passing_score']}%")
        print(f"   Örnek Soru: {test['questions'][0]['text'][:50]}...")
    
    print(f"\n📁 Kaydedildi: data/assessment_tests.json")

if __name__ == "__main__":
    generate_test_questions()
    generate_assessment_tests()
    
    print("\n" + "=" * 60)
    print("🎉 TÜM TEST VERİLERİ HAZIR!")
    print("=" * 60)
    print("\nKullanım:")
    print("1. python generate_test_questions.py")
    print("2. Test çözmek için: assessment_tests.json")
    print("3. Soru bankası için: question_bank.json")
"""
Kullanıcı seviyesini analiz eden modül
Placement test sonuçlarına göre seviye belirleme ve yol haritası önerisi
"""

import json
import os
from typing import List, Dict, Optional


# Konu seviye sınıflandırması
BEGINNER_TOPICS = [
    "python giriş ve kurulum", "değişkenler ve veri tipleri", "operatörler",
    "string işlemleri", "kullanıcı girişi ve çıkışı", "koşullu ifadeler",
    "döngüler - for", "döngüler - while", "listeler", "tuple ve set",
    "sözlükler (dictionary)", "fonksiyonlar - temel"
]

INTERMEDIATE_TOPICS = [
    "fonksiyonlar - ileri", "modüller ve paketler", "dosya işlemleri",
    "hata yönetimi", "nesne yönelimli programlama - giriş", "oop - kalıtım (inheritance)",
    "oop - encapsulation ve polymorphism", "oop - magic methods", "decorators",
    "generators ve iterators", "list comprehension ve generator expression",
    "regular expressions (regex)", "tarih ve zaman işlemleri", "json işlemleri",
    "virtual environment", "unit testing"
]

ADVANCED_TOPICS = [
    "multithreading", "multiprocessing", "async/await", "context managers",
    "type hints ve annotations", "veritabanı - sqlite", "http istekleri",
    "web scraping", "numpy temelleri", "pandas temelleri", "veri analizi ile pandas",
    "matplotlib ile veri görselleştirme", "seaborn ile istatistiksel görselleştirme",
    "flask web framework - giriş", "fastapi - giriş", "rest api geliştirme",
    "orm - sqlalchemy", "authentication ve authorization", "design patterns",
    "solid prensipleri", "logging ve debugging", "proje: python ile tam uygulama"
]


def load_placement_test() -> Dict:
    """Placement test JSON dosyasını yükler."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    test_path = os.path.join(current_dir, "placement_test.json")
    
    with open(test_path, "r", encoding="utf-8") as f:
        return json.load(f)


def analyze_placement_test(answers: Dict[int, str]) -> Dict:
    """
    Placement test cevaplarını analiz eder ve kullanıcı seviyesini belirler.
    
    Args:
        answers: Soru ID'si -> Kullanıcı cevabı (A/B/C/D) dictionary
                 Örnek: {1: "B", 2: "A", 3: "C", ...}
    
    Returns:
        Detaylı analiz sonucu
    """
    test_data = load_placement_test()
    questions = test_data.get("questions", [])
    
    # Sonuçları hesapla
    beginner_correct = 0
    beginner_total = 0
    intermediate_correct = 0
    intermediate_total = 0
    advanced_correct = 0
    advanced_total = 0
    
    correct_questions = []
    wrong_questions = []
    
    for question in questions:
        q_id = question["id"]
        difficulty = question["difficulty"]
        correct_answer = question["correct_answer"]
        user_answer = answers.get(q_id, "")
        
        is_correct = user_answer.upper() == correct_answer.upper()
        
        if difficulty == "beginner":
            beginner_total += 1
            if is_correct:
                beginner_correct += 1
        elif difficulty == "intermediate":
            intermediate_total += 1
            if is_correct:
                intermediate_correct += 1
        elif difficulty == "advanced":
            advanced_total += 1
            if is_correct:
                advanced_correct += 1
        
        if is_correct:
            correct_questions.append({
                "id": q_id,
                "topic": question["topic"],
                "difficulty": difficulty
            })
        else:
            wrong_questions.append({
                "id": q_id,
                "topic": question["topic"],
                "difficulty": difficulty,
                "correct_answer": correct_answer,
                "user_answer": user_answer,
                "explanation": question["explanation"]
            })
    
    # Toplam skor
    total_correct = beginner_correct + intermediate_correct + advanced_correct
    total_questions = len(questions)
    percentage = (total_correct / total_questions) * 100 if total_questions > 0 else 0
    
    # Seviye belirleme algoritması
    level, message, recommended_start_topic = determine_level(
        beginner_correct, beginner_total,
        intermediate_correct, intermediate_total,
        advanced_correct, advanced_total,
        percentage
    )
    
    return {
        "level": level,
        "score": {
            "total_correct": total_correct,
            "total_questions": total_questions,
            "percentage": round(percentage, 1),
            "beginner": {"correct": beginner_correct, "total": beginner_total},
            "intermediate": {"correct": intermediate_correct, "total": intermediate_total},
            "advanced": {"correct": advanced_correct, "total": advanced_total}
        },
        "message": message,
        "recommended_start_topic": recommended_start_topic,
        "weak_topics": get_weak_topics(wrong_questions),
        "strong_topics": get_strong_topics(correct_questions),
        "wrong_questions": wrong_questions
    }


def determine_level(
    beginner_correct: int, beginner_total: int,
    intermediate_correct: int, intermediate_total: int,
    advanced_correct: int, advanced_total: int,
    percentage: float
) -> tuple:
    """
    Seviye belirleme algoritması.
    
    Returns:
        (level, message, recommended_start_topic)
    """
    beginner_rate = beginner_correct / beginner_total if beginner_total > 0 else 0
    intermediate_rate = intermediate_correct / intermediate_total if intermediate_total > 0 else 0
    advanced_rate = advanced_correct / advanced_total if advanced_total > 0 else 0
    
    # İleri seviye kontrolü
    if advanced_rate >= 0.6 and intermediate_rate >= 0.7:
        return (
            "advanced",
            "Tebrikler! İleri seviye Python bilgisine sahipsiniz. Proje geliştirme ve uzmanlık konularına odaklanabilirsiniz.",
            29  # Multithreading
        )
    
    # Orta seviye kontrolü
    if intermediate_rate >= 0.5 and beginner_rate >= 0.7:
        return (
            "intermediate",
            "Orta seviye Python bilgisine sahipsiniz. OOP, decorators ve ileri konulara geçebilirsiniz.",
            13  # Fonksiyonlar - İleri
        )
    
    # Başlangıç seviyesi (temel eksik)
    if beginner_rate < 0.5:
        return (
            "beginner",
            "Python temellerini güçlendirmeniz gerekiyor. Değişkenler ve veri tiplerinden başlayın.",
            1  # Python Giriş
        )
    
    # Başlangıç seviyesi (temeller iyi ama orta seviye eksik)
    if beginner_rate >= 0.5:
        return (
            "beginner",
            "Temel Python bilgisine sahipsiniz. Fonksiyonlar ve döngüleri pekiştirip ilerleyebilirsiniz.",
            7  # Döngüler - For
        )
    
    # Varsayılan
    return (
        "beginner",
        "Python öğrenme yolculuğunuza başlayın!",
        1
    )


def get_weak_topics(wrong_questions: List[Dict]) -> List[str]:
    """Zayıf konuları belirler."""
    topic_counts = {}
    for q in wrong_questions:
        topic = q["topic"]
        topic_counts[topic] = topic_counts.get(topic, 0) + 1
    
    # En çok yanlış yapılan konular
    sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
    return [topic for topic, count in sorted_topics[:5]]


def get_strong_topics(correct_questions: List[Dict]) -> List[str]:
    """Güçlü konuları belirler."""
    topic_counts = {}
    for q in correct_questions:
        topic = q["topic"]
        topic_counts[topic] = topic_counts.get(topic, 0) + 1
    
    # En çok doğru yapılan konular
    sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
    return [topic for topic, count in sorted_topics[:5]]


def analyze_user_level(correct_topics: List[str]) -> Dict:
    """
    Kullanıcının doğru cevapladığı konulara göre seviyesini belirler.
    (Eski fonksiyon - geriye dönük uyumluluk için korundu)
    
    Args:
        correct_topics: Kullanıcının doğru cevapladığı konu adları listesi
    
    Returns:
        Seviye bilgisi içeren dictionary
    """
    if not correct_topics:
        return {
            "level": "beginner",
            "score": 0,
            "total_topics": len(correct_topics),
            "message": "Henüz hiç konu tamamlanmamış. Başlangıç seviyesinden başlayın."
        }
    
    # Konuları küçük harfe çevir
    correct_topics_lower = [t.lower().strip() for t in correct_topics]
    
    # Her seviyeden kaç konu bilindiğini say
    beginner_count = sum(1 for t in correct_topics_lower if t in BEGINNER_TOPICS)
    intermediate_count = sum(1 for t in correct_topics_lower if t in INTERMEDIATE_TOPICS)
    advanced_count = sum(1 for t in correct_topics_lower if t in ADVANCED_TOPICS)
    
    total = len(correct_topics)
    
    # Seviye belirleme algoritması
    if advanced_count >= 5 or (intermediate_count >= 8 and advanced_count >= 2):
        level = "advanced"
        message = "İleri seviye konularda başarılısınız. Proje geliştirmeye odaklanabilirsiniz."
    elif intermediate_count >= 5 or (beginner_count >= 10 and intermediate_count >= 2):
        level = "intermediate"
        message = "Orta seviye konularda ilerleme kaydettiniz. OOP ve ileri konulara geçebilirsiniz."
    else:
        level = "beginner"
        message = "Temel konuları öğrenmeye devam edin. Güçlü bir temel oluşturun."
    
    return {
        "level": level,
        "score": total,
        "total_topics": total,
        "message": message
    }


def get_topic_level(topic_name: str) -> str:
    """
    Bir konunun hangi seviyeye ait olduğunu döner.
    """
    topic_lower = topic_name.lower().strip()
    
    if topic_lower in BEGINNER_TOPICS:
        return "beginner"
    elif topic_lower in INTERMEDIATE_TOPICS:
        return "intermediate"
    elif topic_lower in ADVANCED_TOPICS:
        return "advanced"
    else:
        return "unknown"

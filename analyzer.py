
import json
import os
from typing import List, Dict

# ==================== PYTHON KONU SEVİYE SINIFLANDIRMASI ====================
PYTHON_BEGINNER_TOPICS = [
    "variables", "data_types", "strings", "conditionals", "loops", "lists", 
    "dictionaries", "input_output", "operators", "functions"
]
PYTHON_INTERMEDIATE_TOPICS = [
    "exceptions", "file_handling", "oop", "list_comprehension", "json", 
    "decorators", "generators", "async", "context_managers", "type_hints"
]
PYTHON_ADVANCED_TOPICS = [
    "threading", "metaclasses", "descriptors", "coroutines"
]

# ==================== JAVA KONU SEVİYE SINIFLANDIRMASI ======================
JAVA_BEGINNER_TOPICS = ["java_giris","ide_kurulumu","jdk_kurulumu","hello_world","degiskenler","veri_tipleri","if_kosullari","switch_kosullari"]

JAVA_INTERMEDIATE_TOPICS = ["for_donguleri","while_donguleri","do_while_donguleri","diziler","cok_boyutlu_diziler","stringler","metotlar","parametreli_metotlar","degisken_parametreler","temel_algoritmalar"]

JAVA_ADVANCED_TOPICS = ["siniflar","deger_ve_referans","alanlar_ve_ozellikler","kapsulleme","getter_setter","yapici_metotlar","metot_overloading","kalitim","polimorfizm","metot_overriding","abstract_siniflar","interfaceler","composition","ic_siniflar","static_anahtar_kelime"]


# ==================== TEST VERİSİ YÜKLEME ======================

def load_placement_test(language: str) -> Dict:
    """Belirtilen dil için placement test JSON dosyasını yükler."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_name = f"{language.lower()}_placement_test.json"
    test_path = os.path.join(current_dir, file_name)
    
    if not os.path.exists(test_path):
        raise FileNotFoundError(f"Test file not found for language: {language}")

    with open(test_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data.get(language.lower(), {})

# ==================== ANA ANALİZ FONKSİYONU ======================

def analyze_placement_test(language: str, answers: Dict[int, str]) -> Dict:
    """
    Placement test cevaplarını analiz eder ve kullanıcı seviyesini belirler.
    Gelen dile göre doğru analiz mantığını çalıştırır.
    
    Args:
        language: 'PYTHON' veya 'JAVA'
        answers: Soru ID'si -> Kullanıcı cevabı (A/B/C/D) dictionary
    
    Returns:
        Detaylı analiz sonucu
    """
    try:
        test_data = load_placement_test(language)
    except FileNotFoundError as e:
        return {"error": str(e)}

    questions = test_data.get("questions", [])
    
    # Skorları hesapla
    scores = {"beginner": {"correct": 0, "total": 0}, 
              "intermediate": {"correct": 0, "total": 0}, 
              "advanced": {"correct": 0, "total": 0}}
    
    wrong_questions = []

    for q in questions:
        difficulty = q["difficulty"]
        q_id = q["id"]
        user_answer = answers.get(str(q_id), "") # Gelen key'ler string olabilir
        is_correct = user_answer.upper() == q["correct_answer"].upper()

        if difficulty in scores:
            scores[difficulty]["total"] += 1
            if is_correct:
                scores[difficulty]["correct"] += 1
        
        if not is_correct:
            wrong_questions.append({
                "id": q_id,
                "topic": q["topic"],
                "difficulty": difficulty,
                "correct_answer": q["correct_answer"],
                "user_answer": user_answer,
                "explanation": q["explanation"]
            })

    total_correct = sum(s["correct"] for s in scores.values())
    total_questions = len(questions)
    percentage = (total_correct / total_questions) * 100 if total_questions > 0 else 0
    
    # Dile göre seviye belirleme ve mesaj oluşturma
    if language.upper() == 'PYTHON':
        level, message, recommended_start_topic_id = determine_python_level(scores)
    elif language.upper() == 'JAVA':
        level, message, recommended_start_topic_id = determine_java_level(scores)
    elif language.upper() == 'JAVASCRIPT':
        level, message, recommended_start_topic_id = determine_javascript_level(scores)
    else:
        level, message, recommended_start_topic_id = ("unknown", "Dil desteklenmiyor.", None)

    return {
        "level": level,
        "message": message,
        "recommended_start_topic_id": recommended_start_topic_id,
        "score": {
            "total_correct": total_correct,
            "total_questions": total_questions,
            "percentage": round(percentage, 1),
            "details": scores
        },
        "wrong_questions": wrong_questions
    }

# ==================== PYTHON SEVİYE BELİRLEME ======================

def determine_python_level(scores: Dict) -> tuple:
    """Python test sonuçlarına göre seviye ve başlangıç konusu belirler."""
    beginner_rate = scores["beginner"]["correct"] / scores["beginner"]["total"] if scores["beginner"]["total"] > 0 else 0
    intermediate_rate = scores["intermediate"]["correct"] / scores["intermediate"]["total"] if scores["intermediate"]["total"] > 0 else 0
    
    if beginner_rate < 0.6:
        return ("Başlangıç", "Python temellerini sağlamlaştırmalısın. Değişkenler ve döngüler gibi temel konularla başlayalım.", 1)
    elif intermediate_rate < 0.5:
        return ("Temel Düzey", "Harika bir başlangıç! Temelleri anladın. Şimdi OOP ve dosya işlemleri gibi orta düzey konulara geçebilirsin.", 11)
    else:
        return ("Orta Düzey", "Çok iyi durumdasın! Artık ileri seviye konulara, veri bilimine veya web geliştirmeye yönelebilirsin.", 21)

# ==================== JAVA SEVİYE BELİRLEME (GELİŞTİRİLMİŞ) ======================

def determine_java_level(scores: Dict) -> tuple:
    """Java test sonuçlarına göre seviye ve başlangıç konusu belirler."""

    beginner_rate = scores["beginner"]["correct"] / scores["beginner"]["total"] if scores["beginner"]["total"] > 0 else 0
    intermediate_rate = scores["intermediate"]["correct"] / scores["intermediate"]["total"] if scores["intermediate"]["total"] > 0 else 0
    advanced_rate = scores["advanced"]["correct"] / scores["advanced"]["total"] if scores["advanced"]["total"] > 0 else 0

    if beginner_rate < 0.6:
        return ("Başlangıç", "Java temellerini sağlamlaştırmalısın. Değişkenler, veri tipleri ve kontrol yapılarıyla başlayalım.", 1)

    elif intermediate_rate < 0.6 or advanced_rate < 0.5:
        return ("Orta", "Temelleri anladın. Şimdi Nesne Yönelimli Programlama (OOP), diziler ve koleksiyonlara odaklanabilirsin.", 6)

    return ("İleri", "Harika! Java'ya hakimsin. Multithreading, Stream API ve JVM konularına geçebilirsin.", 12)

# ==================== JAVASCRIPT SEVİYE BELİRLEME ======================

def determine_javascript_level(scores: Dict) -> tuple:
    """JavaScript test sonuçlarına göre seviye ve başlangıç konusu belirler."""
    beginner_rate = scores["beginner"]["correct"] / scores["beginner"]["total"] if scores["beginner"]["total"] > 0 else 0
    
    if beginner_rate < 0.6:
        return ("Başlangıç", "JavaScript temellerini sağlamlaştırmalısın. Değişkenler, veri tipleri ve kontrol yapılarıyla başlayalım.", 1)
    else:
        return ("Temel Düzey", "Harika! JavaScript temellerini anladın. DOM manipülasyonu, fonksiyonlar ve olaylarla devam edebilirsin.", 6)

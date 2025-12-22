
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
JAVA_BEGINNER_TOPICS = [
    "variables", "operators", "loops", "methods", "arrays"
]
JAVA_INTERMEDIATE_TOPICS = [
    "oop_concepts", "access_modifiers", "exceptions", "collections", "final_keyword"
]
JAVA_ADVANCED_TOPICS = [
    "multithreading", "memory_management", "streams_api", "jvm_internals"
]

# ==================== TEST VERİSİ YÜKLEME ======================

def load_placement_test(language: str) -> Dict:
    """Belirtilen dil için placement test JSON dosyasını yükler."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_name = f"{language.lower()}_placement_test.json"
    test_path = os.path.join(current_dir, file_name)
    
    if not os.path.exists(test_path):
        raise FileNotFoundError(f"Test file not found for language: {language}")

    with open(test_path, "r", encoding="utf-8") as f:
        return json.load(f)

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
    beginner_correct = scores["beginner"]["correct"]
    beginner_total = scores["beginner"]["total"]
    beginner_rate = beginner_correct / beginner_total if beginner_total > 0 else 0
    
    intermediate_rate = scores["intermediate"]["correct"] / scores["intermediate"]["total"] if scores["intermediate"]["total"] > 0 else 0
    advanced_rate = scores["advanced"]["correct"] / scores["advanced"]["total"] if scores["advanced"]["total"] > 0 else 0

    # 1. Kural: Başlangıç seviyesinde %60'ın altındaysa (0, 1, 2 doğru)
    if beginner_rate < 0.6:
        return ("Başlangıç", "Java'nın temellerini öğrenerek sağlam bir başlangıç yapalım. Değişkenler, operatörler ve temel kontrol yapıları ilk adımların olacak.", 1)
    
    # 2. Kural: Orta seviyeye hazır değilse (Orta seviyeden %50'den az yaptıysa) ve temelleri %80'den az biliyorsa
    if beginner_rate < 0.8 and intermediate_rate < 0.5: # 3 doğru başlangıç sorusu bu bloğa girer
        return ("Başlangıç", "Temellerde fena değilsin ama henüz tam oturmamış. Nesne Yönelimli Programlama'ya geçmeden önce temel konuları tekrar etmen en iyisi.", 1)

    # 3. Kural: Temelleri sağlam ama ileri seviyeye hazır değilse
    if intermediate_rate < 0.6 and advanced_rate < 0.5: # 4-5 başlangıç ve 0-2 orta seviye sorusu bu bloğa girer
        return ("Temel Düzey", "Temelleri başarıyla geçtin! Şimdi Java'nın gücünü ortaya çıkaran Nesne Yönelimli Programlama (OOP) dünyasına dalalım.", 6)
        
    # 4. Kural: Orta seviyeyi de geçtiyse ama ileri seviyede eksikleri varsa
    if advanced_rate < 0.6:
        return ("Orta Düzey", "OOP konseptlerini iyi anlamışsın. Artık Collections Framework ve thread yönetimi gibi daha karmaşık konulara hazırsın.", 9)

    # 5. Kural: Her şeye hakimse
    return ("İleri Düzey", "Tebrikler! Java'ya hakimsin. Artık Stream API, bellek yönetimi ve JVM'in incelikleri gibi uzmanlık konularına odaklanabilirsin.", 12)


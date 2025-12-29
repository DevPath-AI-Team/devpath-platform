import json
import os
import re
from typing import Dict, Any, Tuple, Optional


# ==================== HELPER: SEVİYE & ZORLUK NORMALİZASYONU ======================

def normalize_level(level: Any) -> str:
    """
    Seviye bilgisini standart büyük harfli formata (BEGINNER, BASIC, INTERMEDIATE, ADVANCED) normalize eder.
    Ayrıca Türkçe karşılıkları da içerir.
    """
    if level is None:
        return "BEGINNER"
    s = str(level).lower()
    mapping = {
        "beginner": "BEGINNER",
        "basic": "BASIC",
        "intermediate": "INTERMEDIATE",
        "advanced": "ADVANCED",
        
        # Türkçe eklemeler
        "başlangıç": "BEGINNER",
        "baslangic": "BEGINNER",
        "temel": "BASIC",
        "temel düzey": "BASIC",
        "temel duzey": "BASIC",
        "orta": "INTERMEDIATE",
        "orta düzey": "INTERMEDIATE",
        "orta duzey": "INTERMEDIATE",
        "ileri": "ADVANCED",
        "ileri düzey": "ADVANCED",
        "ileri duzey": "ADVANCED",
    }
    # Eğer doğrudan bir eşleşme yoksa, normalize_difficulty'den gelen küçük harfli 
    # değerleri (beginner, intermediate, advanced) de eşleştirebilir.
    return mapping.get(s, s.upper() if s in ["beginner", "intermediate", "advanced"] else "BEGINNER")


def normalize_difficulty(raw: Optional[Any]) -> Optional[str]:
    """
    Zorluk seviyesini ana 3 kategoriye (beginner, intermediate, advanced) küçük harfle normalize eder.
    CEFR ve çeşitli eş anlamlıları destekler.
    """
    if raw is None:
        return None

    s = str(raw).strip().lower()

    mapping = {
        # Standart İngilizce (Çıktı değerleri)
        "beginner": "beginner",
        "intermediate": "intermediate",
        "advanced": "advanced",

        # Eş anlamlı İngilizce (Girdi değerleri)
        "basic": "beginner",
        "foundation": "beginner",
        "intro": "beginner",
        "introductory": "beginner",
        "easy": "beginner",

        "mid": "intermediate",
        "medium": "intermediate",
        "normal": "intermediate",

        "hard": "advanced",
        "expert": "advanced",
        "pro": "advanced",

        # Türkçe (Girdi değerleri)
        "başlangıç": "beginner",
        "baslangic": "beginner",
        "temel": "beginner",
        "temel düzey": "beginner",
        "temel duzey": "beginner",
        "orta": "intermediate",
        "orta düzey": "intermediate",
        "orta duzey": "intermediate",
        "ileri": "advanced",
        "ileri düzey": "advanced",
        "ileri duzey": "advanced",

        # CEFR
        "a1": "beginner",
        "a2": "beginner",
        "b1": "intermediate",
        "b2": "intermediate",
        "c1": "advanced",
        "c2": "advanced",
    }

    return mapping.get(s)

# ==================== TEST VERİSİ YÜKLEME ======================

def load_placement_test(language: str) -> Tuple[Dict[str, Any], str]:
    """Belirtilen dil için placement test JSON dosyasını yükler ve path döndürür."""
    # Bu kısmın, dosya sistemi bağlamına göre çalışması beklenir.
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_name = f"{language.lower()}_placement_test.json"
    test_path = os.path.join(current_dir, file_name)

    if not os.path.exists(test_path):
        # Gerçek bir dosyaya erişilemediği için bu kısım burada yorumlanamaz, 
        # ancak varsayımsal olarak dosya var gibi devam edilir.
        # Bu kodun test edilmesi için, Python'ın sanal dosya sisteminde bu dosyanın olması gerekir.
        # Geçici çözüm: Test için varsayımsal bir dosya yolu döndürme veya bu hatayı yakalama.
        # Şu anki ortamda gerçek dosya sistemine erişilemediği için varsayılan bir yol döndürüyoruz.
        return {}, test_path # Hata fırlatmak yerine boş döndürüp, çağıran fonksiyonda hata yakalama

    try:
        with open(test_path, "r", encoding="utf-8") as f:
            return json.load(f), test_path
    except Exception as e:
        # Dosya okunamaması durumunda, örneğin Jupyter/Colab ortamında
        raise FileNotFoundError(f"Test file not found or could not be read for language: {language} (expected: {test_path}). Error: {e}")


# ==================== HELPER: JSON KEY OKUMA ======================

def first_non_empty(q: Dict[str, Any], keys) -> Optional[Any]:
    for k in keys:
        if k in q and q[k] is not None and str(q[k]).strip() != "":
            return q[k]
    return None


def _extract_choice_letter(s: str) -> str:
    """
    String içinden A/B/C/D harfini yakalamaya çalışır.
    Örn: "B)" -> B, "Correct: C" -> C, "Option D - ..." -> D
    """
    if not s:
        return ""
    s_up = s.strip().upper()

    # direkt ilk karakter A/B/C/D ise
    if s_up and s_up[0] in "ABCD":
        return s_up[0]

    # string içinde A/B/C/D geçiyorsa (örn: "option B" / "(C)" / "Answer: D")
    m = re.search(r"\b([ABCD])\b", s_up)
    if m:
        return m.group(1)

    # "(B)" veya "B)" gibi
    m2 = re.search(r"([ABCD])\)", s_up)
    if m2:
        return m2.group(1)

    return ""


def normalize_answer(raw: Optional[Any], options: Optional[Any] = None) -> str:
    """
    Cevabı A/B/C/D formatına normalize eder.

    Ayrıca correct_answer harf değilse (örn: 2 ya da option text) onu da yakalamaya çalışır.
    """
    if raw is None:
        return ""

    # sayı ise: 0-3 veya 1-4 gibi index olabilir
    if isinstance(raw, int):
        if raw in [0, 1, 2, 3]:
            return "ABCD"[raw]
        if raw in [1, 2, 3, 4]:
            return "ABCD"[raw - 1]

    s = str(raw).strip()
    letter = _extract_choice_letter(s)
    if letter:
        return letter

    # Eğer raw bir option text ise ve options varsa, seçeneklerde eşleştir
    # options: ["A) ...", "B) ..."] gibi
    if options:
        try:
            if isinstance(options, dict):
                # {"A": "...", "B": "..."} gibi olabilir
                for k, v in options.items():
                    if str(v).strip().lower() == s.lower():
                        k2 = _extract_choice_letter(str(k))
                        if k2:
                            return k2
                return ""
            if isinstance(options, list):
                for opt in options:
                    if str(opt).strip().lower() == s.lower():
                        # option stringinden harfi çek
                        return _extract_choice_letter(str(opt))
        except Exception:
            pass

    return ""


# ==================== ANA ANALİZ ======================

def analyze_placement_test(language: str, answers: Dict) -> Dict[str, Any]:
    try:
        test_data, loaded_path = load_placement_test(language)
    except FileNotFoundError as e:
        # Dosya bulunamazsa veya okunamayasa hata mesajı döndürülür.
        return {"error": str(e), "level": "UNKNOWN", "message": "Test verisi yüklenemedi."}

    questions = test_data.get("questions", [])

    # Test verisi boşsa
    if not questions:
        return {"error": "Test verisi (questions) boş veya hatalı.", "level": "UNKNOWN", "message": "Test verisi (questions) boş veya hatalı."}


    scores = {
        "beginner": {"correct": 0, "total": 0},
        "intermediate": {"correct": 0, "total": 0},
        "advanced": {"correct": 0, "total": 0},
    }

    wrong_questions = []

    unknown_difficulties = []
    missing_keys = {"difficulty": 0, "correct_answer": 0, "id": 0, "user_answer_missing": 0}

    # İlk birkaç sorudan örnek debug için
    sample_checks = []

    for q in questions:
        q_id = first_non_empty(q, ["id", "question_id", "questionId"])
        raw_diff = first_non_empty(q, ["difficulty", "difficulty_level", "difficultyLevel", "level"])
        difficulty = normalize_difficulty(raw_diff)
        raw_correct = first_non_empty(q, ["correct_answer", "correctAnswer", "answer", "correct", "correct_option"])
        
        if q_id is None:
            missing_keys["id"] += 1
            continue

        if difficulty is None:
            missing_keys["difficulty"] += 1
            unknown_difficulties.append(raw_diff)
            # Bilinmeyen zorlukta soruyu sayma
            continue

        options = q.get("options")

        correct_answer = normalize_answer(raw_correct, options=options)
        if correct_answer == "":
            missing_keys["correct_answer"] += 1
            continue

        # kullanıcı cevabı
        user_raw = answers.get(str(q_id), answers.get(int(q_id) if isinstance(q_id, (str, int)) else q_id, None))
        user_answer = normalize_answer(user_raw)

        if user_answer == "":
            # hiç cevap gelmediyse (ID uyuşmuyor olabilir)
            missing_keys["user_answer_missing"] += 1

        is_correct = (user_answer == correct_answer)
        
        # Sadece zorluk seviyesi geçerli olan soruları say
        if difficulty in scores:
            scores[difficulty]["total"] += 1
            if is_correct:
                scores[difficulty]["correct"] += 1
            else:
                wrong_questions.append({
                    "id": q_id,
                    "topic": q.get("topic"),
                    "difficulty": difficulty,
                    "correct_answer": correct_answer,
                    "user_answer": user_answer,
                    "explanation": q.get("explanation"),
                })
        
        # ilk 8 soruyu örnek olarak kaydet
        if len(sample_checks) < 8:
            sample_checks.append({
                "id": q_id,
                "diff_raw": raw_diff,
                "diff_norm": difficulty,
                "correct_raw": raw_correct,
                "correct_norm": correct_answer,
                "user_raw": user_raw,
                "user_norm": user_answer,
                "ok": is_correct
            })

    total_correct = sum(s["correct"] for s in scores.values())
    total_counted = sum(s["total"] for s in scores.values())
    percentage = (total_correct / total_counted) * 100 if total_counted > 0 else 0.0

    # oranlar
    b_total = scores["beginner"]["total"]
    i_total = scores["intermediate"]["total"]
    a_total = scores["advanced"]["total"]

    b_rate = (scores["beginner"]["correct"] / b_total) if b_total else 0.0
    i_rate = (scores["intermediate"]["correct"] / i_total) if i_total else 0.0
    a_rate = (scores["advanced"]["correct"] / a_total) if a_total else 0.0

    # Level Belirleme
    if language.upper() == "PYTHON":
        raw_level, message, recommended_start_topic_id = determine_python_level(scores)
    elif language.upper() == "JAVA":
        raw_level, message, recommended_start_topic_id = determine_java_level(scores)
    else:
        raw_level, message, recommended_start_topic_id = ("UNKNOWN", "Dil desteklenmiyor.", None)
        
    # Level'ı büyük harfli ve tutarlı yapmak için normalize_level kullanılır
    level = normalize_level(raw_level)

    return {
        "level": level,
        "message": message,
        "recommended_start_topic": recommended_start_topic_id,
        "score": round(float(percentage), 1),

        "wrong_questions": wrong_questions,

        # DEBUG
        "debug": {
            "loaded_test_path": loaded_path,
            "missing_keys_counts": missing_keys,
            "unknown_difficulties_sample": unknown_difficulties[:10],

            "total_questions_in_file": len(questions),
            "total_questions_counted": total_counted,
            "total_correct": total_correct,
            "percentage": round(float(percentage), 1),

            "beginner_total": b_total,
            "beginner_correct": scores["beginner"]["correct"],
            "beginner_rate": round(b_rate, 3),

            "intermediate_total": i_total,
            "intermediate_correct": scores["intermediate"]["correct"],
            "intermediate_rate": round(i_rate, 3),

            "advanced_total": a_total,
            "advanced_correct": scores["advanced"]["correct"],
            "advanced_rate": round(a_rate, 3),

            "sample_checks": sample_checks,
        }
    }


# ==================== LEVEL LOGIC ======================

def determine_python_level(scores: Dict[str, Dict[str, int]]) -> Tuple[str, str, int]:
    beginner_total = scores["beginner"]["total"]
    intermediate_total = scores["intermediate"]["total"]

    beginner_rate = scores["beginner"]["correct"] / beginner_total if beginner_total > 0 else 0
    intermediate_rate = scores["intermediate"]["correct"] / intermediate_total if intermediate_total > 0 else 0

    # Fallback: Eğer beginner soruları yoksa, ancak diğer seviyelerde doğru cevaplar varsa
    if beginner_total == 0 and (scores["intermediate"]["total"] + scores["advanced"]["total"]) > 0:
        # Temel Düzey (normalize_level -> BASIC)
        return (
            "Temel Düzey",
            "Test verisinde beginner soruları sayılmadı (muhtemelen JSON difficulty alanı uyumsuz). Yine de sonuçlara göre Temel Düzeyden devam edebiliriz.",
            11
        )

    # ✅ GÜNCELLENMİŞ MANTIK: Büyük harfli İngilizce seviyeler döndürülür (Java enum'ları ile uyum için)

    if beginner_rate < 0.6:
        return ("BEGINNER", # normalize_level -> BEGINNER
                "Python temellerini sağlamlaştırmalısın. Değişkenler ve döngüler gibi temel konularla başlayalım.",
                1)
    # Temel Düzey (BASIC) atlanarak bir sonraki ana seviye olan INTERMEDIATE'e geçiliyor
    elif intermediate_rate < 0.5:
        return ("INTERMEDIATE", # normalize_level -> INTERMEDIATE
                "Harika bir başlangıç! Temelleri anladın. Şimdi OOP ve dosya işlemleri gibi orta düzey konulara geçebilirsin.",
                11)
    else:
        # Geriye kalanlar (intermediate_rate >= 0.5) ADVANCED kabul ediliyor
        return ("ADVANCED", # normalize_level -> ADVANCED
                "Çok iyi durumdasın! Artık ileri seviye konulara, veri bilimine veya web geliştirmeye yönelebilirsin.",
                21)


def determine_java_level(scores: Dict[str, Dict[str, int]]) -> Tuple[str, str, int]:
    beginner_total = scores["beginner"]["total"]
    intermediate_total = scores["intermediate"]["total"]
    advanced_total = scores["advanced"]["total"]

    beginner_rate = scores["beginner"]["correct"] / beginner_total if beginner_total > 0 else 0
    intermediate_rate = scores["intermediate"]["correct"] / intermediate_total if intermediate_total > 0 else 0
    advanced_rate = scores["advanced"]["correct"] / advanced_total if advanced_total > 0 else 0

    if beginner_rate < 0.6:
        return ("Başlangıç",
                "Java'nın temellerini öğrenerek sağlam bir başlangıç yapalım.",
                1)

    if beginner_rate < 0.8 and intermediate_rate < 0.5:
        return ("Başlangıç",
                "Temellerde fena değilsin ama henüz tam oturmamış.",
                1)

    if intermediate_rate < 0.6 and advanced_rate < 0.5:
        return ("Temel Düzey", # normalize_level -> BASIC
                "Temelleri başarıyla geçtin! Şimdi OOP dünyasına dalalım.",
                6)

    if advanced_rate < 0.6:
        return ("Orta Düzey", # normalize_level -> INTERMEDIATE
                "OOP konseptlerini iyi anlamışsın. Collections ve thread yönetimine hazırsın.",
                9)

    return ("İleri Düzey", # normalize_level -> ADVANCED
            "Tebrikler! Java'ya hakimsin.",
            12)
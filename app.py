import os
import json
from typing import Dict, Any, Optional, Union, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# 'analyzer.py' dosyasından içe aktarılması gereken fonksiyon
# (Bu örnekte bu dosya sağlanmadığı için varsayımsal olarak mevcuttur)
from analyzer import analyze_placement_test

# -----------------------------
# MODELLER
# -----------------------------
class Answer(BaseModel):
    questionId: int
    answer: Optional[str] = None

class AnalyzeRequest(BaseModel):
    userId: int
    language: str
    path: Optional[str] = "web"
    answers: Union[Dict[str, str], List[Answer]]

# -----------------------------
# APP
# -----------------------------
app = FastAPI(
    title="DevPath AI Module",
    description="Placement + Analyze API",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# -----------------------------
# HELPER: ROADMAP OLUŞTURMA (roadmap.py'dan taşındı)
# -----------------------------
def generate_roadmap_from_placement(
    level: str,
    recommended_start_topic: int,
    weak_topics: List[str],
    strong_topics: List[str]
) -> Dict[str, Any]:
    """
    Yol haritası oluşturma. Dersleri tekrar etmemesi için düzeltildi.
    """
    
    roadmap_items = []
    
    # Seviyeye göre ders sayısı belirle
    lesson_counts = {
        "BEGINNER": 5,
        "BASIC": 6, # normalize_level'dan gelebilecek BASIC için de tanımlayalım
        "INTERMEDIATE": 8,
        "ADVANCED": 10
    }
    
    # Seviye bulunamazsa varsayılan 5 ders
    count = lesson_counts.get(level.upper(), 5)
    
    # Her ders için benzersiz ID'ler oluştur
    for i in range(1, count + 1):
        # topic_id'yi recommended_start_topic'ten başlatıp artırıyoruz.
        topic_id = recommended_start_topic + i - 1
        
        roadmap_items.append({
            "id": i,  # Benzersiz ID (sadece bu yol haritası için)
            "title": f"Python Dersleri #{i} | Konu {topic_id}",
            "description": f"Python {level} seviyesi ders {i}",
            "estimated_minutes": 30,
            "order_index": i,
            "topic_id": topic_id # Derslerin tekrar etmesini engellemek için topic ID'ler ardışık olarak ayarlanmıştır.
        })
    
    return {
        "level": level,
        "total_lessons": len(roadmap_items),
        "lessons": roadmap_items,
        "weak_topics": weak_topics,
        "strong_topics": strong_topics
    }


# -----------------------------
# HEALTH
# -----------------------------
@app.get("/health")
def health():
    return {"status": "ok"}

# -----------------------------
# PLACEMENT TEST - FRONTEND ÇEKER
# -----------------------------
def load_test(language: str):
    # BASE_DIR'in bu ortamda gerçek bir dosya yolu sağlaması beklenir.
    path = os.path.join(BASE_DIR, "data", "tests", f"{language.lower()}.json")
    
    # Bu kısmı, çalıştığınız ortamda dosyanın varlığını kontrol edecek şekilde bırakıyorum.
    # Genellikle bu tür ortamlarda dosya erişimi sınırlıdır ve bu kısım bir uyarı verebilir.
    # Gerçek ortamda çalışırken bu kontrol doğru çalışacaktır.
    if not os.path.exists(path):
        # Dosya yoksa, muhtemelen bir test ortamında çalışıyordur.
        # Yer tutucu olarak boş bir test verisi döndürmek yerine hata fırlatalım.
        raise HTTPException(status_code=404, detail=f"Test bulunamadı: {path}")
        
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/placement-test/{language}")
def get_placement_test(language: str):
    data = load_test(language)

    # ❗ correct_answer FRONTEND'E GİTMESİN
    for q in data["questions"]:
        q.pop("correct_answer", None)
        # Ek olarak, analyze.py'daki anahtar eşleşmeleri için olası diğer cevap anahtarlarını da kaldıralım
        q.pop("correctAnswer", None)
        q.pop("answer", None)
        q.pop("correct", None)
        q.pop("correct_option", None)


    return JSONResponse(content=data)

# -----------------------------
# ANALYZE - JAVA ÇAĞIRIR
# -----------------------------
# analyzer.py'daki normalize_level ile çakışmaması için basit bir eşleyici tanımlayalım
# Ancak analyze_placement_test'ten gelen seviyeyi doğrudan haritalamak daha güvenlidir.

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    answers = {}

    if isinstance(req.answers, list):
        for a in req.answers:
            answers[str(a.questionId)] = (a.answer or "").strip()
    else:
        answers = {str(k): (v or "").strip() for k, v in req.answers.items()}

    # analyze_placement_test, normalize_level'dan geçmiş (veya Java enum'larına ayarlanmış)
    # bir 'level' (str) döndürür (örneğin "BEGINNER", "Temel Düzey", "ADVANCED")
    try:
        result = analyze_placement_test(req.language, answers)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analiz sırasında hata oluştu: {e}")

    # ✅ DÜZELTİLDİ: analyzer.py'dan gelen ham seviye değerlerini Java enum'larıyla tam eşleştirme
    # NOT: analyzer.py artık doğrudan BEGINNER/INTERMEDIATE/ADVANCED döndürdüğü için,
    # bu eşleştirme adımına gerek kalmamıştır. Ancak eski Türkçe çıktılar için tutmak güvenlidir.
    level_map = {
        # analyzer.py'dan gelen Türkçe/İngilizce çıktıları eşleştirir
        "BEGINNER": "BEGINNER",
        "Başlangıç": "BEGINNER",

        "BASIC": "BASIC", # analyzer.py normalize_level'da hala var
        "Temel Düzey": "BASIC",
        
        # Java tarafı BASIC'i atlayıp INTERMEDIATE kullanıyorsa:
        # "Temel Düzey": "INTERMEDIATE",

        "INTERMEDIATE": "INTERMEDIATE",
        "Orta Düzey": "INTERMEDIATE",

        "ADVANCED": "ADVANCED",
        "İleri Düzey": "ADVANCED"
    }
    
    # analyze_placement_test'ten gelen seviyeyi al
    raw_level = result.get("level", "BEGINNER")
    
    # Eşleme yaparak nihai büyük harfli seviyeyi al
    level = level_map.get(raw_level, raw_level.upper())
    
    # Eğer Java BASIC yerine INTERMEDIATE bekliyorsa bu kontrolü ekle:
    if level == "BASIC":
        level = "INTERMEDIATE" # Java uyumu için BASIC'i INTERMEDIATE'e yükselt

    score = float(result.get("score", 0))
    recommended_start_topic_id = result.get("recommended_start_topic", 1)

    weak_topics = list({
        q.get("topic")
        for q in result.get("wrong_questions", [])
        if q.get("topic")
    })

    # ✅ DÜZELTİLDİ: Tekrar eden dersleri engelleyen fonksiyon çağrısı
    roadmap = generate_roadmap_from_placement(
        level=level,
        recommended_start_topic=recommended_start_topic_id, # Analizden gelen başlangıç topic ID'sini kullan
        weak_topics=weak_topics,
        strong_topics=[]
    )

    return {
        "level": level,
        "score": score,
        "weak_topics": weak_topics,
        "strong_topics": [],
        "recommended_start_topic": recommended_start_topic_id,
        "roadmap_details": roadmap
    }

# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    # uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
    # Çalışma ortamına uygun olarak yorum satırına alıyorum, gerektiğinde uvicorn ile çalıştırılabilir.
    print("FastAPI uygulaması hazır. Çalıştırmak için 'uvicorn app:app --reload' komutunu kullanın.")
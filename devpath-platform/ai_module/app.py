import os
import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# .env dosyasını yükle (API anahtarı için)
load_dotenv()

# --- DÜZELTME BURADA ---
# Dosyalarındaki GERÇEK fonksiyon isimlerini çağırıyoruz
# Eğer yine hata alırsan bu dosyaların (roadmap.py, analyzer.py) ai_module klasöründe olduğundan emin ol.
from roadmap import generate_roadmap_from_placement
from analyzer import analyze_placement_test 

# Chat fonksiyonunu güvenli şekilde çağıralım
try:
    from chat import model # chat.py dosyasından modeli alıyoruz
except ImportError:
    model = None
    print("UYARI: chat.py bulunamadı veya model yüklenemedi.")

# -----------------------------
#  Veri Modelleri (Gelen/Giden Veri Tipleri)
# -----------------------------

class Answer(BaseModel):
    questionId: int
    answer: str | None

# Java Backend'den gelen veriyi karşılayacak yapı
class AnalyzeRequest(BaseModel):
    userId: int
    language: str
    path: Optional[str] = "web" 
    answers: Dict[str, str] | List[Answer] 

class ChatRequest(BaseModel):
    prompt: str 

# -----------------------------
#  Uygulama Ayarları
# -----------------------------

app = FastAPI(
    title="DevPath AI Module",
    description="Java Backend ve Frontend ile tam uyumlu AI Servisi",
    version="2.2.0"
)

# Frontend ve Backend'in rahatça erişmesi için izinler
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------
#  API Adresleri (Endpoints)
# -------------------------------------

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "DevPath AI Module"}

# 1. ANALİZ İŞLEMİ (Java Buraya İstek Atıyor)
@app.post("/analyze")
async def analyze_endpoint(request: AnalyzeRequest):
    print(f"📩 ANALİZ İSTEĞİ GELDİ: Kullanıcı {request.userId}, Dil: {request.language}")
    
    try:
        # A) Cevapları Düzenle: Liste gelirse sözlüğe çeviriyoruz
        formatted_answers = {}
        if isinstance(request.answers, list):
            for ans in request.answers:
                formatted_answers[str(ans.questionId)] = ans.answer
        else:
            formatted_answers = request.answers

        # B) Analiz Yap (analyzer.py dosyasını kullanır)
        # Fonksiyon adı: analyze_placement_test
        analysis_result = analyze_placement_test(request.language, formatted_answers)
        
        if "error" in analysis_result:
            print(f"Analiz Hatası: {analysis_result['error']}")
            return default_response()

        # C) Yol Haritası Oluştur (roadmap.py dosyasını kullanır)
        # Fonksiyon adı: generate_roadmap_from_placement
        level = analysis_result.get("level", "beginner")
        start_topic = analysis_result.get("recommended_start_topic_id", 1)
        
        # Yanlış sorulardan zayıf konuları bulalım
        weak_topics = []
        if "wrong_questions" in analysis_result:
            weak_topics = list(set([q["topic"] for q in analysis_result["wrong_questions"]]))
        
        strong_topics = [] 

        roadmap_result = generate_roadmap_from_placement(
            level=level,
            recommended_start_topic=start_topic,
            weak_topics=weak_topics,
            strong_topics=strong_topics
        )

        print("✅ Analiz ve Yol Haritası Başarıyla Oluşturuldu.")
        
        # D) Sonucu Java'ya Gönder
        return {
            "level": level.upper(), 
            "score": analysis_result.get("score", {}).get("percentage", 0),
            "recommended_start_topic": start_topic,
            "weak_topics": weak_topics,
            "strong_topics": strong_topics,
            "roadmap_details": roadmap_result 
        }
        
    except Exception as e:
        print(f"❌ BEKLENMEYEN HATA: {e}")
        return default_response()

def default_response():
    """Hata durumunda sistemin çökmemesi için boş bir cevap döner."""
    return {
        "level": "BEGINNER",
        "score": 0,
        "weak_topics": [],
        "strong_topics": [],
        "recommended_start_topic": 1
    }

# 2. CHATBOT İŞLEMİ (Frontend Buraya İstek Atıyor)
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        if not model:
            return {"answer": "AI Modeli yüklenemedi, lütfen API anahtarınızı kontrol edin."}
            
        response = model.generate_content(request.prompt)
        return {"answer": response.text}
        
    except Exception as e:
        print(f"Chat Hatası: {e}")
        return {"answer": "Üzgünüm, şu an bağlantı kuramıyorum."}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Python AI Sunucusu Başlatılıyor (Port 8000)...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
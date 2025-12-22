import os
import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# .env dosyasını yükle (Gemini API anahtarı için)
load_dotenv()

# Analiz ve Yol Haritası modüllerini içe aktar
from roadmap import generate_roadmap_from_placement
from analyzer import analyze_placement_test 

# Chat modülü kontrolü
try:
    from chat import model 
except ImportError:
    model = None
    print("UYARI: chat.py bulunamadı veya model yüklenemedi.")

# -----------------------------
#  Veri Modelleri
# -----------------------------

class Answer(BaseModel):
    questionId: int
    answer: str | None

class AnalyzeRequest(BaseModel):
    userId: int
    language: str  # "JAVA" veya "PYTHON"
    answers: Dict[str, str] | List[Answer] 

class ChatRequest(BaseModel):
    prompt: str 

# -----------------------------
#  Uygulama Ayarları
# -----------------------------

app = FastAPI(
    title="DevPath AI Hub",
    description="Java ve Python Analizlerini gerçekleştiren merkezi AI Servisi",
    version="2.6.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------
#  API Endpoints
# -------------------------------------

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "DevPath AI Hub"}

@app.post("/analyze")
async def analyze_endpoint(request: AnalyzeRequest):
    print(f"📩 ANALİZ İSTEĞİ: Kullanıcı {request.userId}, Dil: {request.language}")
    
    try:
        # 1. Cevapları Sözlük Formatına Dönüştür
        formatted_answers = {}
        if isinstance(request.answers, list):
            for ans in request.answers:
                formatted_answers[str(ans.questionId)] = ans.answer
        else:
            formatted_answers = request.answers

        # 2. İlgili Dilin Soru Bankasını JSON Dosyasından Yükle
        lang_lower = request.language.lower()
        file_path = f"{lang_lower}_placement_test.json"
        
        if not os.path.exists(file_path):
            print(f"❌ Dosya bulunamadı: {file_path}")
            return default_response()

        with open(file_path, "r", encoding="utf-8") as f:
            full_data = json.load(f)
            questions = full_data[lang_lower]["questions"]

        # 3. Analiz Yap (analyzer.py)
        analysis_result = analyze_placement_test(request.language, formatted_answers, questions)
        
        if "error" in analysis_result:
            return default_response()

        # 4. Yol Haritası Oluştur (roadmap.py)
        level = analysis_result.get("level", "Başlangıç")
        start_topic_id = analysis_result.get("recommended_start_topic_id", 1)
        
        # Yanlış sorulardan zayıf konuları tespit et
        weak_topics = list(set([q["topic"] for q in analysis_result.get("wrong_questions", [])]))

        # DÜZELTME: language parametresi roadmap fonksiyonuna gönderiliyor
        roadmap_result = generate_roadmap_from_placement(
            level=level,
            recommended_start_topic=start_topic_id,
            weak_topics=weak_topics,
            strong_topics=[],
            language=request.language
        )

        print(f"✅ {request.language} Analizi Başarılı. Seviye: {level}")
        
        # 5. Sonuçları Geri Dön
        return {
            "level": level.upper(), 
            "score": analysis_result.get("score", {}).get("percentage", 0),
            "recommended_start_topic": start_topic_id,
            "weak_topics": weak_topics,
            "roadmap_details": roadmap_result 
        }
        
    except Exception as e:
        print(f"❌ ANALİZ HATASI: {str(e)}")
        return default_response()

def default_response():
    return {
        "level": "BEGINNER",
        "score": 0,
        "weak_topics": [],
        "strong_topics": [],
        "recommended_start_topic": 1,
        "roadmap_details": {}
    }

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        if not model:
            return {"answer": "AI Modeli şu an aktif değil."}
        response = model.generate_content(request.prompt)
        return {"answer": response.text}
    except Exception as e:
        return {"answer": "Bağlantı hatası oluştu."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
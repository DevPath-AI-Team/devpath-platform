"""
Python AI Module - FastAPI Application
Java Spring Boot backend ile entegrasyon için ana uygulama dosyası.

Çalıştırma:
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import time
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Beyza'nın modüllerini import ediyoruz
from main import router as python_ai_router
from analyzer import analyze_answer
from schemas import AnswerAnalyzeRequest, AnswerAnalyzeResponse

# -----------------------------
# Ortam değişkenlerini yükle (Chatbot için)
# -----------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.0-flash-exp" 
# Not: Model ismini .env içinde değiştirebilirsin veya burayı güncelleyebilirsin.

# -----------------------------
# FastAPI Uygulaması Başlatma
# -----------------------------
app = FastAPI(
    title="Python AI Module",
    description="Python öğrenme platformu için yapay zeka modülü (Chatbot + Roadmap)",
    version="1.4.0"
)

# ---------------------------------------
# CORS AYARLARI - Java Backend ve Frontend Erişimi
# ---------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tüm origin'lere izin ver
    allow_credentials=True,
    allow_methods=["*"],  # Tüm HTTP metodlarına izin ver
    allow_headers=["*"],  # Tüm header'lara izin ver
)

# ---------------------------------------
# ROUTER ENTEGRASYONU (Roadmap & Quiz)
# ---------------------------------------
# Beyza'nın yazdığı router'ı ana uygulamaya ekliyoruz
app.include_router(python_ai_router)

# ---------------------------------------
# CHATBOT MODÜLÜ (İlknur'un Eklediği Kısım)
# ---------------------------------------

class UserPrompt(BaseModel):
    prompt: str

def make_api_request_with_retry(prompt: str, max_retries: int = 3) -> str:
    """Gemini API'ye üstel geri çekilme ile güvenli istek gönderir."""
    if not GEMINI_API_KEY:
        return "HATA: GEMINI_API_KEY ortam değişkeni ayarlanmamış. Lütfen .env dosyasını kontrol edin."

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {
            "parts": [
                {
                    "text": "Sen programlama öğrencileri için yardımcı ve öz bir yapay zekâ asistanısın. Teknik soruları açık ve kısa şekilde Türkçe yanıtla."
                }
            ]
        }
    }

    for attempt in range(max_retries):
        try:
            response = requests.post(api_url, json=payload, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            # Yanıtı al
            candidate = data.get('candidates', [{}])[0]
            answer_text = candidate.get('content', {}).get('parts', [{}])[0].get('text')
            
            if answer_text:
                return answer_text
            return "API'den geçerli bir yanıt alınamadı. İçerik filtrelenmiş olabilir."

        except requests.exceptions.RequestException as err:
            print(f"[Deneme {attempt + 1}] Hata: {err}")

        # Üstel geri çekilme
        if attempt < max_retries - 1:
            wait_time = 2 ** attempt
            print(f"Yeniden deneme için {wait_time} saniye bekleniyor...")
            time.sleep(wait_time)

    return "API'ye birden fazla denemeye rağmen ulaşılamadı veya geçerli yanıt alınamadı."

@app.post("/chat")
def chat_endpoint(user_prompt: UserPrompt):
    """Kullanıcı mesajını alır ve Gemini yanıtını döndürür."""
    gemini_response = make_api_request_with_retry(user_prompt.prompt)

    if gemini_response.startswith("HATA:"):
        raise HTTPException(status_code=500, detail=gemini_response)

    return {"answer": gemini_response}

# ---------------------------------------
# JAVA INTEGRATION (Analyze Endpoint)
# ---------------------------------------
# Java Backend'in çağırdığı analiz endpoint'i

@app.post("/analyze", response_model=AnswerAnalyzeResponse)
async def analyze_answer_endpoint(request: AnswerAnalyzeRequest):
    """
    Java backend'den gelen cevap analiz isteği.
    """
    result = analyze_answer(
        question=request.question,
        user_answer=request.user_answer,
        correct_answer=request.correct_answer
    )
    return AnswerAnalyzeResponse(**result)

# ---------------------------------------
# SAĞLIK KONTROLÜ
# ---------------------------------------
@app.get("/health")
def health_check():
    """Servis sağlık kontrolü."""
    return {
        "status": "healthy",
        "service": "DevPath AI Module (Combined)",
        "version": "1.4.0",
        "features": ["Chatbot", "Roadmap", "Placement Test", "Analysis"]
    }

# ---------------------------------------
# STANDALONE ÇALIŞTIRMA
# ---------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
import os
import time
import requests
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# -----------------------------
# Ortam değişkenlerini yükle
# -----------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.5-flash-preview-09-2025"

# -----------------------------
# FastAPI uygulaması
# -----------------------------
app = FastAPI(title="DevPath AI Backend")

# Frontend ile iletişim için CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme aşamasında tüm kaynaklara izin
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Kullanıcıdan gelen veri modeli
# -----------------------------
class UserPrompt(BaseModel):
    prompt: str

# -----------------------------
# Gemini API'ye güvenli istek fonksiyonu
# -----------------------------
def make_api_request_with_retry(prompt: str, max_retries: int = 3) -> str:
    """Gemini API'ye üstel geri çekilme ile güvenli istek gönderir."""
    if not GEMINI_API_KEY:
        return "HATA: GEMINI_API_KEY ortam değişkeni ayarlanmamış."

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

# -----------------------------
# Chat endpoint
# -----------------------------
@app.post("/chat")
def chat_endpoint(user_prompt: UserPrompt):
    """Kullanıcı mesajını alır ve Gemini yanıtını döndürür."""
    gemini_response = make_api_request_with_retry(user_prompt.prompt)

    if gemini_response.startswith("HATA:"):
        raise HTTPException(status_code=500, detail=gemini_response)

    return {"answer": gemini_response}


import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

# Pydantic modelleri, API istek ve cevap gövdelerini tanımlar
class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    answer: str

# API anahtarını ortam değişkeninden al
# Güvenlik için anahtarı doğrudan koda yazmıyoruz
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Eğer API anahtarı bulunamazsa, konsola bir uyarı yaz.
    # Bu, uygulamanın çökmesini engeller ama chat özelliği çalışmaz.
    print("UYARI: GEMINI_API_KEY ortam değişkeni bulunamadı. Chatbot çalışmayacak.")
    genai.configure(api_key="DUMMY_KEY_FOR_INITIALIZATION") # Geçici anahtar ile başlat
else:
    genai.configure(api_key=api_key)

# Router tanımı
# Bu router, main.py dosyasına import edilecek
router = APIRouter()

# Gemini Pro modelini başlat
model = genai.GenerativeModel('gemini-pro')

@router.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    """
    Frontend'den gelen sohbet isteklerini karşılar.

    - Gelen "prompt"u alır.
    - Gemini API'sine gönderir.
    - Gelen cevabı "answer" olarak geri döner.
    """
    if not api_key or api_key == "DUMMY_KEY_FOR_INITIALIZATION":
        raise HTTPException(
            status_code=500, 
            detail="Gemini API anahtarı sunucuda ayarlanmamış."
        )

    try:
        # Gemini modelinden cevap üret
        response = model.generate_content(request.prompt)
        
        # Cevabı al ve JSON olarak döndür
        return ChatResponse(answer=response.text)

    except Exception as e:
        # Hata durumunda logla ve bir hata mesajı döndür
        print(f"Gemini API hatası: {e}")
        raise HTTPException(status_code=500, detail="AI asistanına ulaşılırken bir sorun oluştu.")

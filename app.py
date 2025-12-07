"""
Java AI Module - FastAPI Application
Java Spring Boot backend ile entegrasyon için ana uygulama.

Çalıştırma:
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(
    title="Python AI Module",
    description="DevPath için seviye belirleme yapay zeka modülü",
    version="1.0.0"
)

# ---------------------------------------
# CORS AYARLARI - Java Backend Erişimi
# ---------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Tüm origin'lere izin ver
    allow_credentials=True,
    allow_methods=["*"],        # Tüm HTTP metodlarına izin ver
    allow_headers=["*"],        # Tüm header'lara izin ver
)


# ---------------------------------------
# MODELLER
# ---------------------------------------

class AnalyzeRequest(BaseModel):
    userId: int
    language: str                     # "JAVA", "PYTHON" vb.
    answers: Dict[str, Any] | None    # {"q1": "A", "q2": "B"} gibi


class AnalyzeResponse(BaseModel):
    userId: int
    language: str
    level: str        # "BEGINNER" / "INTERMEDIATE" / "ADVANCED"
    score: int        # 0–100 arası


# ---------------------------------------
# ENDPOINT
# ---------------------------------------

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    """
    Java backend'den gelen analiz isteğini işler.

    Request:
    {
        "userId": 1,
        "language": "JAVA",
        "answers": { "q1": "A", "q2": "B" }
    }

    Response:
    {
        "userId": 1,
        "language": "JAVA",
        "level": "BEGINNER",
        "score": 35
    }
    """

    user_id = req.userId
    language = req.language
    answers = req.answers or {}

    # 1) Basit skor hesaplama (şimdilik her cevabı doğru kabul ediyoruz)
    total_questions = len(answers)
    correct_count = total_questions  # ileride burada gerçek kontrol yaparsın

    score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0

    # 2) Skora göre seviye belirleme
    if score < 40:
        level = "BEGINNER"
    elif score < 70:
        level = "INTERMEDIATE"
    else:
        level = "ADVANCED"

    # 3) Cevabı oluştur
    return AnalyzeResponse(
        userId=user_id,
        language=language,
        level=level,
        score=score
    )


@app.get("/health")
def health_check():
    """Servis sağlık kontrolü."""
    return {
        "status": "healthy",
        "service": "python-ai-module",
        "version": "1.0.0"
    }


# ---------------------------------------
# STANDALONE ÇALIŞTIRMA
# ---------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
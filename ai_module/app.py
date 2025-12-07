"""
Python AI Module - FastAPI Application
Java Spring Boot backend ile entegrasyon için ana uygulama dosyası.

Çalıştırma:
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI(
    title="Python AI Module",
    description="Python öğrenme platformu için yapay zeka modülü",
    version="1.0.0"
)

# ---------------------------------------
# CORS AYARLARI - Java Backend Erişimi
# ---------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tüm origin'lere izin ver
    allow_credentials=True,
    allow_methods=["*"],  # Tüm HTTP metodlarına izin ver
    allow_headers=["*"],  # Tüm header'lara izin ver
)


# ---------------------------------------
# MODELLER
# ---------------------------------------

class LessonResult(BaseModel):
    lessonId: int
    progress: int
    completed: bool


class AnalyzeRequest(BaseModel):
    userId: int
    answers: Dict[str, Any]  # Kullanıcının verdiği cevaplar {"q1": "A", "q2": "B"}


class AnalyzeResponse(BaseModel):
    lessons: List[LessonResult]


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
        "answers": { "q1": "A", "q2": "B" }
    }
    
    Response:
    {
        "lessons": [
            { "lessonId": 1, "progress": 100, "completed": true }
        ]
    }
    """
    
    # Kullanıcı cevaplarını analiz et
    user_id = req.userId
    answers = req.answers
    
    # Cevap sayısına göre ilerleme hesapla
    total_questions = len(answers) if answers else 0
    correct_count = 0
    
    # Basit analiz algoritması
    # (Gerçek uygulamada placement_test.json ile karşılaştırılabilir)
    for question_id, user_answer in answers.items():
        # Şimdilik her cevabı doğru kabul edelim
        # Backend ekibi burayı kendi mantığıyla değiştirebilir
        if user_answer:
            correct_count += 1
    
    # İlerleme yüzdesi
    progress = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
    completed = progress >= 70  # %70 ve üzeri tamamlanmış sayılır
    
    # Sonuçları oluştur
    results = []
    
    # Her soru için bir ders sonucu oluştur
    for i, (q_id, answer) in enumerate(answers.items(), start=1):
        lesson_progress = 100 if answer else 0
        results.append(
            LessonResult(
                lessonId=i,
                progress=lesson_progress,
                completed=lesson_progress == 100
            )
        )
    
    # Eğer hiç cevap yoksa varsayılan sonuç döndür
    if not results:
        results = [
            LessonResult(lessonId=1, progress=0, completed=False)
        ]
    
    return AnalyzeResponse(lessons=results)


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

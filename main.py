
"""
FastAPI Python AI Modülü
"""

import json
import os
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Yerel modülleri ve şemaları import et
from schemas import (
    CurriculumResponse, Topic,
    AnalyzeRequest, AnalyzeResponse,
    AnswerAnalyzeRequest, AnswerAnalyzeResponse,
    RoadmapRequest, RoadmapResponse, Lesson,
    PlacementTestResponse, PlacementTestInfo, PlacementQuestion,
    PlacementTestSubmitRequest, PlacementTestResultResponse,
    PlacementScore, ScoreBreakdown, WrongQuestion,
    DetailedRoadmapResponse, DetailedLesson, LearningPathItem
)
from analyzer import analyze_user_level, analyze_placement_test, analyze_answer
from roadmap import generate_roadmap

# --- YENİ EKLENEN CHAT ROUTER ---
from chat import router as chat_router

# Ana router - /python-ai öneki ile gruplanmış endpoint'ler
router = APIRouter(prefix="/python-ai", tags=["Python AI Module"])

# Dosya yolları
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CURRICULUM_PATH = os.path.join(CURRENT_DIR, "curriculum.json")
PLACEMENT_TEST_PATH = os.path.join(CURRENT_DIR, "placement_test.json")

# Yardımcı Fonksiyon
def load_json_file(filepath: str) -> dict:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Dosya bulunamadı: {filepath}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"JSON parse hatası: {filepath}")

# ==================== MEVCUT ENDPOINT'LER (/python-ai altında) ====================

@router.get("/curriculum", response_model=CurriculumResponse)
async def get_curriculum():
    data = load_json_file(CURRICULUM_PATH)
    return CurriculumResponse(topics=[Topic(**t) for t in data.get("topics", [])])

@router.get("/placement-test", response_model=PlacementTestResponse)
async def get_placement_test():
    data = load_json_file(PLACEMENT_TEST_PATH)
    test_info = PlacementTestInfo(**data.get("test_info", {}))
    questions = [PlacementQuestion(**q) for q in data.get("questions", [])]
    return PlacementTestResponse(test_info=test_info, questions=questions)

# ... (main.py dosyasındaki diğer mevcut endpoint'ler buraya gelecek) ...

@router.post("/placement-test/submit", response_model=PlacementTestResultResponse)
async def submit_placement_test(request: PlacementTestSubmitRequest):
    answers = {int(k): v for k, v in request.answers.items()}
    result = analyze_placement_test(answers)
    score = PlacementScore(
        total_correct=result["score"]["total_correct"],
        total_questions=result["score"]["total_questions"],
        percentage=result["score"]["percentage"],
        beginner=ScoreBreakdown(**result["score"]["beginner"]),
        intermediate=ScoreBreakdown(**result["score"]["intermediate"]),
        advanced=ScoreBreakdown(**result["score"]["advanced"])
    )
    wrong_questions = [WrongQuestion(**wq) for wq in result["wrong_questions"]]
    return PlacementTestResultResponse(
        level=result["level"],
        score=score,
        message=result["message"],
        recommended_start_topic=result["recommended_start_topic"],
        weak_topics=result["weak_topics"],
        strong_topics=result["strong_topics"],
        wrong_questions=wrong_questions
    )

@router.post("/roadmap", response_model=RoadmapResponse)
async def create_roadmap(request: RoadmapRequest):
    result = generate_roadmap(request.level.value, request.completedTopics or [])
    lessons = [Lesson(id=l["id"], name=l["name"], status=l["status"]) for l in result["lessons"]]
    return RoadmapResponse(
        lessons=lessons,
        recommended_start=result["recommended_start"],
        total_lessons=result["total_lessons"]
    )


# ==================== UYGULAMA KURULUMU ve ANA ENDPOINT'LER ====================

# Standalone çalıştırma için ana uygulama ve ayarlar
if __name__ == "__main__":
    app = FastAPI(
        title="DevPath AI Module",
        description="Python öğrenme platformu için yapay zeka modülü.",
        version="1.4.0" # Sürüm güncellendi
    )

    # CORS ayarları (Frontend erişimi için)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Tüm kaynaklara izin ver (geliştirme için)
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    # --- ROUTER'LARI UYGULAMAYA DAHİL ETME ---
    # 1. Chatbot endpoint'leri (ana dizinde, örn: /chat)
    app.include_router(chat_router, tags=["Chatbot"])
    
    # 2. Diğer AI endpoint'leri (/python-ai öneki ile, örn: /python-ai/curriculum)
    app.include_router(router)

    # Java Backend entegrasyonu için root seviyesinde /analyze endpoint'i
    @app.post("/analyze", response_model=AnswerAnalyzeResponse, tags=["Java Integration"])
    async def analyze_answer_endpoint(request: AnswerAnalyzeRequest):
        result = analyze_answer(
            question=request.question,
            user_answer=request.user_answer,
            correct_answer=request.correct_answer
        )
        return AnswerAnalyzeResponse(**result)

    # Sağlık kontrolü endpoint'i
    @app.get("/health", tags=["Health Check"])
    async def health_check():
        return {
            "status": "healthy",
            "module": "DevPath AI Module",
            "version": app.version,
            "active_endpoints": {
                "chatbot": "/chat",
                "learning_tools": "/python-ai/*",
                "java_integration": "/analyze",
                "docs": "/docs"
            }
        }

    # Sunucuyu başlat
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

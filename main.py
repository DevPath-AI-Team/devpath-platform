import os
import json
from typing import Any, Dict, List, Optional, Union

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from analyzer import analyze_placement_test
from roadmap import generate_roadmap_from_placement

# router'lar
from routers.ai import router as ai_router

# chat router opsiyonel (chat.py içinde router varsa)
try:
    from chat import router as chat_router
except Exception:
    chat_router = None


# -----------------------------
#  Pydantic modeller
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
#  App
# -----------------------------
app = FastAPI(
    title="DevPath AI Module",
    description="Java Backend ve Frontend ile uyumlu AI Servisi",
    version="2.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DevPath AI Module",
        "version": app.version,
    }


# -----------------------------
#  Placement test sorularını ver (Frontend çeksin)
# -----------------------------
def load_test_json(language: str) -> dict:
    path = os.path.join(BASE_DIR, "data", "tests", f"{language.lower()}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"Test bulunamadı: {language}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/placement-test/{language}")
def get_placement_test(language: str):
    data = load_test_json(language)

    # ✅ Güvenlik: correct_answer frontende gitmesin
    for q in data.get("questions", []):
        q.pop("correct_answer", None)

    return JSONResponse(content=data)


# -----------------------------
#  Java entegrasyonu: /analyze (Senin mevcut akışın)
# -----------------------------
def normalize_level_for_java(level_any: Any) -> str:
    if level_any is None:
        return "BEGINNER"
    s = str(level_any).strip().lower()
    mapping = {
        "başlangıç": "BEGINNER",
        "baslangic": "BEGINNER",
        "temel düzey": "BASIC",
        "temel duzey": "BASIC",
        "orta düzey": "INTERMEDIATE",
        "orta duzey": "INTERMEDIATE",
        "ileri düzey": "ADVANCED",
        "ileri duzey": "ADVANCED",
        "beginner": "BEGINNER",
        "basic": "BASIC",
        "intermediate": "INTERMEDIATE",
        "advanced": "ADVANCED",
        # ek: analyzer "Orta Düzey" yerine "Orta" vb döndürüyorsa buraya ekle
        "orta": "INTERMEDIATE",
        "ileri": "ADVANCED",
        "temel": "BASIC",
    }
    return mapping.get(s, "BEGINNER")


@app.post("/analyze")
async def analyze_endpoint(request: AnalyzeRequest):
    # answers normalize
    formatted_answers: Dict[str, str] = {}
    if isinstance(request.answers, list):
        for ans in request.answers:
            formatted_answers[str(ans.questionId)] = (ans.answer or "").strip()
    else:
        formatted_answers = {str(k): (v or "").strip() for k, v in request.answers.items()}

    # analyzer
    analysis_result = analyze_placement_test(request.language, formatted_answers)
    if not isinstance(analysis_result, dict) or "error" in analysis_result:
        return {
            "level": "BEGINNER",
            "score": 0.0,
            "weak_topics": [],
            "strong_topics": [],
            "recommended_start_topic": 1,
        }

    raw_level = analysis_result.get("level", "BEGINNER")
    java_level = normalize_level_for_java(raw_level)

    # weak topics
    weak_topics = list(
        {q.get("topic") for q in analysis_result.get("wrong_questions", []) if q.get("topic")}
    )

    # score
    score = analysis_result.get("score", 0.0)
    try:
        score = float(score)
    except Exception:
        score = 0.0

    start_topic = analysis_result.get("recommended_start_topic", 1) or 1
    try:
        start_topic = int(start_topic)
    except Exception:
        start_topic = 1

    roadmap_details = generate_roadmap_from_placement(
        level=java_level,
        recommended_start_topic=start_topic,
        weak_topics=weak_topics,
        strong_topics=[],
    )

    return {
        "level": java_level,
        "score": score,
        "recommended_start_topic": start_topic,
        "weak_topics": weak_topics,
        "strong_topics": [],
        "roadmap_details": roadmap_details,
    }


# -----------------------------
#  Router'ları dahil et
# -----------------------------
app.include_router(ai_router)  # /python-ai/*

if chat_router is not None:
    app.include_router(chat_router)


# -----------------------------
#  Run
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

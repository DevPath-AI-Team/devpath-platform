import os
import json
import time
import uuid
import logging
from typing import Dict, Any, Optional, Union, List

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from analyzer import analyze_placement_test

# -----------------------------
# LOGGING (KONSOLA YAZAR)
# -----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("DevPathAI")

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
# MIDDLEWARE: GELEN İSTEĞİ LOGLA (KİM VURDU ANLA)
# -----------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    rid = request.headers.get("x-request-id") or str(uuid.uuid4())[:8]
    start = time.time()

    # client host/port (backend aynı makinedeyse 127.0.0.1 görürsün)
    client = request.client.host if request.client else "unknown"

    try:
        response = await call_next(request)
        ms = int((time.time() - start) * 1000)

        logger.info(
            f"BAŞARILI"
        )
        response.headers["x-request-id"] = rid
        return response
    except Exception as e:
        ms = int((time.time() - start) * 1000)
        logger.exception(
            f"BACKEND İSTEĞİ"
        )
        raise

# -----------------------------
# HELPER: ROADMAP OLUŞTURMA
# -----------------------------
def generate_roadmap_from_placement(
    level: str,
    recommended_start_topic: int,
    weak_topics: List[str],
    strong_topics: List[str]
) -> Dict[str, Any]:

    roadmap_items = []

    lesson_counts = {
        "BEGINNER": 5,
        "BASIC": 6,
        "INTERMEDIATE": 8,
        "ADVANCED": 10
    }

    count = lesson_counts.get(level.upper(), 5)

    for i in range(1, count + 1):
        topic_id = recommended_start_topic + i - 1
        roadmap_items.append({
            "id": i,
            "title": f"Python Dersleri #{i} | Konu {topic_id}",
            "description": f"Python {level} seviyesi ders {i}",
            "estimated_minutes": 30,
            "order_index": i,
            "topic_id": topic_id
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
    logger.info("❤️ HIT /health")
    return {"status": "ok"}

# -----------------------------
# PLACEMENT TEST
# -----------------------------
def load_test(language: str):
    path = os.path.join(BASE_DIR, "data", "tests", f"{language.lower()}.json")
    if not os.path.exists(path):
        logger.warning(f"❌ Test bulunamadı | language={language} | path={path}")
        raise HTTPException(status_code=404, detail=f"Test bulunamadı: {path}")

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/placement-test/{language}")
def get_placement_test(language: str):
    logger.info(f"📘 HIT /placement-test/{language}")
    data = load_test(language)

    removed = 0
    for q in data["questions"]:
        # correct_answer FRONTEND'E GİTMESİN
        if "correct_answer" in q:
            q.pop("correct_answer", None)
            removed += 1
        q.pop("correctAnswer", None)
        q.pop("answer", None)
        q.pop("correct", None)
        q.pop("correct_option", None)

    logger.info(f"📤 placement-test returned | language={language} | questions={len(data.get('questions', []))} | hidden={removed}")
    return JSONResponse(content=data)

# -----------------------------
# ANALYZE - JAVA ÇAĞIRIR
# -----------------------------
@app.post("/analyze")
async def analyze(req: AnalyzeRequest, request: Request):
    t0 = time.time()

    # ✅ BURASI EN ÖNEMLİ LOG: "BACKEND BU DOSYAYA VURDU MU?"
    logger.info(
        f"✅ HIT /analyze | userId={req.userId} | lang={req.language} | path={req.path} | client={request.client.host if request.client else 'unknown'}"
    )

    answers: Dict[str, str] = {}

    if isinstance(req.answers, list):
        for a in req.answers:
            answers[str(a.questionId)] = (a.answer or "").strip()
    else:
        answers = {str(k): (v or "").strip() for k, v in req.answers.items()}

    # ✅ Gelen body özeti (çok uzun basmayalım)
    sample_keys = list(answers.keys())[:5]
    logger.info(
        f"📥 /analyze payload summary | userId={req.userId} | answers_count={len(answers)} | sample_question_ids={sample_keys}"
    )

    try:
        result = analyze_placement_test(req.language, answers)
    except FileNotFoundError as e:
        logger.exception("❌ analyze_placement_test FileNotFoundError")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.exception("❌ analyze_placement_test Exception")
        raise HTTPException(status_code=500, detail=f"Analiz sırasında hata oluştu: {e}")

    level_map = {
        "BEGINNER": "BEGINNER",
        "Başlangıç": "BEGINNER",
        "BASIC": "BASIC",
        "Temel Düzey": "BASIC",
        "INTERMEDIATE": "INTERMEDIATE",
        "Orta Düzey": "INTERMEDIATE",
        "ADVANCED": "ADVANCED",
        "İleri Düzey": "ADVANCED"
    }

    raw_level = result.get("level", "BEGINNER")
    level = level_map.get(raw_level, raw_level.upper())

    if level == "BASIC":
        level = "INTERMEDIATE"

    score = float(result.get("score", 0))
    recommended_start_topic_id = result.get("recommended_start_topic", 1)

    weak_topics = list({
        q.get("topic")
        for q in result.get("wrong_questions", [])
        if q.get("topic")
    })

    roadmap = generate_roadmap_from_placement(
        level=level,
        recommended_start_topic=recommended_start_topic_id,
        weak_topics=weak_topics,
        strong_topics=[]
    )

    took_ms = int((time.time() - t0) * 1000)

    # ✅ "Analiz üretildi ve response döndü" logu
    logger.info(
        f"📤 /analyze response ready | userId={req.userId} | level={level} | score={score:.2f} | weak_topics={len(weak_topics)} | start_topic={recommended_start_topic_id} | {took_ms}ms"
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
    logger.info("🚀 FastAPI hazır | Çalıştır: uvicorn app:app --reload --port 8000")
    print("FastAPI uygulaması hazır. Çalıştırmak için 'uvicorn app:app --reload --port 8000' komutunu kullanın.")

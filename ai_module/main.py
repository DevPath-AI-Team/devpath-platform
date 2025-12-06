"""
FastAPI Python AI Modülü
Bu modül bağımsız çalışır ve diğer ekipler sadece router'ı import ederek kullanabilir.

Kullanım:
    from ai_module.main import router as python_ai_router
    app.include_router(python_ai_router)
"""

import json
import os
from fastapi import APIRouter, HTTPException
from typing import List

from .schemas import (
    # Curriculum
    CurriculumResponse, Topic,
    # Analyzer
    AnalyzeRequest, AnalyzeResponse,
    # Roadmap
    RoadmapRequest, RoadmapResponse, Lesson,
    # Placement Test
    PlacementTestResponse, PlacementTestInfo, PlacementQuestion,
    PlacementTestSubmitRequest, PlacementTestResultResponse,
    PlacementScore, ScoreBreakdown, WrongQuestion,
    # Detailed Roadmap
    DetailedRoadmapResponse, DetailedLesson, LearningPathItem
)
from .analyzer import analyze_user_level, analyze_placement_test
from .roadmap import generate_roadmap, generate_roadmap_from_placement

# Router tanımı - prefix ile tüm endpointler /python-ai altında olacak
router = APIRouter(prefix="/python-ai", tags=["Python AI Module"])

# Dosya yolları
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CURRICULUM_PATH = os.path.join(CURRENT_DIR, "curriculum.json")
PLACEMENT_TEST_PATH = os.path.join(CURRENT_DIR, "placement_test.json")


def load_json_file(filepath: str) -> dict:
    """JSON dosyasını yükler."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Dosya bulunamadı: {filepath}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"JSON parse hatası: {filepath}")


# ==================== CURRICULUM ENDPOINTS ====================

@router.get("/curriculum", response_model=CurriculumResponse)
async def get_curriculum():
    """
    Python müfredatını döner.
    
    Tüm konuları, açıklamalarını, ön koşullarını ve YouTube linklerini içerir.
    """
    data = load_json_file(CURRICULUM_PATH)
    return CurriculumResponse(topics=[Topic(**t) for t in data.get("topics", [])])


# ==================== PLACEMENT TEST ENDPOINTS ====================

@router.get("/placement-test", response_model=PlacementTestResponse)
async def get_placement_test():
    """
    Seviye belirleme testini döner.
    
    30 soruluk test:
    - 10 beginner soru
    - 10 intermediate soru  
    - 10 advanced soru
    
    Kullanıcı bu testi çözdükten sonra /placement-test/submit endpoint'ine
    cevaplarını göndererek seviyesini öğrenebilir.
    """
    data = load_json_file(PLACEMENT_TEST_PATH)
    
    test_info = PlacementTestInfo(**data.get("test_info", {}))
    questions = [PlacementQuestion(**q) for q in data.get("questions", [])]
    
    return PlacementTestResponse(test_info=test_info, questions=questions)


@router.get("/placement-test/questions-only")
async def get_placement_test_questions_only():
    """
    Seviye belirleme testi sorularını döner (cevaplar ve açıklamalar olmadan).
    
    Frontend'de kullanıcıya gösterilecek format.
    Doğru cevaplar ve açıklamalar gizlidir.
    """
    data = load_json_file(PLACEMENT_TEST_PATH)
    
    questions_without_answers = []
    for q in data.get("questions", []):
        questions_without_answers.append({
            "id": q["id"],
            "question": q["question"],
            "options": q["options"],
            "topic": q["topic"],
            "difficulty": q["difficulty"]
        })
    
    return {
        "test_info": data.get("test_info", {}),
        "questions": questions_without_answers
    }


@router.post("/placement-test/submit", response_model=PlacementTestResultResponse)
async def submit_placement_test(request: PlacementTestSubmitRequest):
    """
    Placement test cevaplarını değerlendirir ve sonuç döner.
    
    Request Body:
        answers: {1: "A", 2: "B", 3: "C", ...} formatında cevaplar
    
    Returns:
        - level: Belirlenen seviye (beginner/intermediate/advanced)
        - score: Detaylı puan bilgisi
        - message: Kullanıcıya mesaj
        - recommended_start_topic: Önerilen başlangıç konusu ID'si
        - weak_topics: Zayıf konular listesi
        - strong_topics: Güçlü konular listesi
        - wrong_questions: Yanlış cevaplanan sorular ve açıklamaları
    """
    # Cevapları int key'e çevir (JSON'dan string olarak gelebilir)
    answers = {int(k): v for k, v in request.answers.items()}
    
    result = analyze_placement_test(answers)
    
    # Response modellerine dönüştür
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


@router.post("/placement-test/roadmap", response_model=DetailedRoadmapResponse)
async def get_roadmap_from_placement(request: PlacementTestSubmitRequest):
    """
    Placement test sonuçlarına göre detaylı yol haritası oluşturur.
    
    Bu endpoint önce testi değerlendirir, sonra sonuçlara göre
    kişiselleştirilmiş bir öğrenme yolu oluşturur.
    
    Request Body:
        answers: {1: "A", 2: "B", ...} formatında cevaplar
    
    Returns:
        - level: Belirlenen seviye
        - lessons: Tüm dersler ve durumları
        - priority_lessons: Öncelikli dersler (zayıf konular)
        - learning_path: Önerilen öğrenme sırası
        - recommended_start: Başlangıç konusu ID'si
        - estimated_hours: Tahmini tamamlama süresi
    """
    # Cevapları int key'e çevir
    answers = {int(k): v for k, v in request.answers.items()}
    
    # Önce analiz et
    analysis = analyze_placement_test(answers)
    
    # Sonra yol haritası oluştur
    roadmap = generate_roadmap_from_placement(
        level=analysis["level"],
        recommended_start_topic=analysis["recommended_start_topic"],
        weak_topics=analysis["weak_topics"],
        strong_topics=analysis["strong_topics"]
    )
    
    # Response modeline dönüştür
    lessons = [DetailedLesson(**l) for l in roadmap["lessons"]]
    priority_lessons = [DetailedLesson(**l) for l in roadmap["priority_lessons"]]
    learning_path = [LearningPathItem(**lp) for lp in roadmap["learning_path"]]
    
    return DetailedRoadmapResponse(
        level=roadmap["level"],
        lessons=lessons,
        priority_lessons=priority_lessons,
        learning_path=learning_path,
        recommended_start=roadmap["recommended_start"],
        total_lessons=roadmap["total_lessons"],
        estimated_hours=roadmap["estimated_hours"]
    )


# ==================== ANALYZER ENDPOINTS ====================

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_level(request: AnalyzeRequest):
    """
    Kullanıcının quiz sonuçlarını analiz eder ve seviyesini belirler.
    
    Request Body:
        correctTopics: Doğru cevaplanan konu adları listesi
    
    Returns:
        level: beginner | intermediate | advanced
        score: Doğru cevap sayısı
        total_topics: Toplam konu sayısı
        message: Kullanıcıya mesaj
    """
    result = analyze_user_level(request.correctTopics)
    return AnalyzeResponse(**result)


# ==================== ROADMAP ENDPOINTS ====================

@router.post("/roadmap", response_model=RoadmapResponse)
async def create_roadmap(request: RoadmapRequest):
    """
    Kullanıcının seviyesine göre kişisel yol haritası oluşturur.
    
    Request Body:
        level: Kullanıcı seviyesi (beginner | intermediate | advanced)
        completedTopics: Tamamlanan konu ID'leri listesi (opsiyonel)
    
    Returns:
        lessons: Ders listesi (id, name, status)
        recommended_start: Önerilen başlangıç konu ID'si
        total_lessons: Toplam ders sayısı
    """
    result = generate_roadmap(request.level.value, request.completedTopics or [])
    
    lessons = [
        Lesson(id=l["id"], name=l["name"], status=l["status"]) 
        for l in result["lessons"]
    ]
    
    return RoadmapResponse(
        lessons=lessons,
        recommended_start=result["recommended_start"],
        total_lessons=result["total_lessons"]
    )


# ==================== HEALTH CHECK ====================

@router.get("/health")
async def health_check():
    """
    Modül sağlık kontrolü.
    """
    return {
        "status": "healthy",
        "module": "python-ai",
        "version": "1.2.0",
        "endpoints": [
            "GET /python-ai/curriculum",
            "GET /python-ai/placement-test",
            "GET /python-ai/placement-test/questions-only",
            "POST /python-ai/placement-test/submit",
            "POST /python-ai/placement-test/roadmap",
            "POST /python-ai/analyze",
            "POST /python-ai/roadmap",
            "GET /python-ai/health"
        ]
    }


# Standalone çalıştırma için
if __name__ == "__main__":
    import uvicorn
    from fastapi import FastAPI
    
    app = FastAPI(
        title="Python AI Module",
        description="Python öğrenme platformu için yapay zeka modülü",
        version="1.2.0"
    )
    app.include_router(router)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

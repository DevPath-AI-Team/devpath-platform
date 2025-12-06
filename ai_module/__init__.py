"""
Python AI Module
================

Bu modül Python öğrenme platformu için yapay zeka destekli özellikler sağlar.

Kullanım:
    from ai_module.main import router as python_ai_router
    app.include_router(python_ai_router)

Endpointler:
    GET  /python-ai/curriculum              - Python müfredatını döner
    GET  /python-ai/placement-test          - Seviye belirleme testi
    GET  /python-ai/placement-test/questions-only - Test soruları (cevapsız)
    POST /python-ai/placement-test/submit   - Test sonuçlarını değerlendir
    POST /python-ai/placement-test/roadmap  - Test sonucuna göre yol haritası
    POST /python-ai/analyze                 - Kullanıcı seviyesini analiz eder
    POST /python-ai/roadmap                 - Kişisel yol haritası oluşturur
    GET  /python-ai/health                  - Sağlık kontrolü
"""

from .main import router
from .analyzer import analyze_user_level, analyze_placement_test
from .roadmap import generate_roadmap, generate_roadmap_from_placement
from .schemas import (
    # Enums
    LevelEnum, DifficultyEnum, LessonStatusEnum, PriorityEnum,
    # Curriculum
    Topic, CurriculumResponse,
    # Placement Test
    PlacementQuestion, PlacementTestInfo, PlacementTestResponse,
    PlacementTestSubmitRequest, PlacementTestResultResponse,
    PlacementScore, ScoreBreakdown, WrongQuestion,
    # Analyzer
    AnalyzeRequest, AnalyzeResponse,
    # Roadmap
    RoadmapRequest, RoadmapResponse, Lesson,
    DetailedRoadmapResponse, DetailedLesson, LearningPathItem
)

__version__ = "1.2.0"
__all__ = [
    # Router
    "router",
    # Functions
    "analyze_user_level",
    "analyze_placement_test",
    "generate_roadmap",
    "generate_roadmap_from_placement",
    # Enums
    "LevelEnum",
    "DifficultyEnum", 
    "LessonStatusEnum",
    "PriorityEnum",
    # Schemas
    "Topic",
    "CurriculumResponse",
    "PlacementQuestion",
    "PlacementTestInfo",
    "PlacementTestResponse",
    "PlacementTestSubmitRequest",
    "PlacementTestResultResponse",
    "PlacementScore",
    "ScoreBreakdown",
    "WrongQuestion",
    "AnalyzeRequest",
    "AnalyzeResponse",
    "RoadmapRequest",
    "RoadmapResponse",
    "Lesson",
    "DetailedRoadmapResponse",
    "DetailedLesson",
    "LearningPathItem"
]

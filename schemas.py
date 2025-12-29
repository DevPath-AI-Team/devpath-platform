"""
Pydantic modelleri - API request/response şemaları
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum


class LevelEnum(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class DifficultyEnum(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class LessonStatusEnum(str, Enum):
    open = "open"
    locked = "locked"
    completed = "completed"
    review = "review"
    skipped = "skipped"
    current = "current"
    upcoming = "upcoming"


class PriorityEnum(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


# Curriculum Schemas
class Topic(BaseModel):
    id: int
    name: str
    description: str
    prerequisite: Optional[List[int]] = []
    youtube_url: str = ""


class CurriculumResponse(BaseModel):
    topics: List[Topic]


# Placement Test Schemas
class PlacementQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    topic: str
    difficulty: DifficultyEnum


class PlacementTestInfo(BaseModel):
    title: str
    description: str
    total_questions: int
    time_limit_minutes: int
    passing_score: int


class PlacementTestResponse(BaseModel):
    test_info: PlacementTestInfo
    questions: List[PlacementQuestion]


class PlacementTestSubmitRequest(BaseModel):
    answers: Dict[int, str]  # {question_id: "A"/"B"/"C"/"D"}


class ScoreBreakdown(BaseModel):
    correct: int
    total: int


class PlacementScore(BaseModel):
    total_correct: int
    total_questions: int
    percentage: float
    beginner: ScoreBreakdown
    intermediate: ScoreBreakdown
    advanced: ScoreBreakdown


class WrongQuestion(BaseModel):
    id: int
    topic: str
    difficulty: str
    correct_answer: str
    user_answer: str
    explanation: str


class PlacementTestResultResponse(BaseModel):
    level: LevelEnum
    score: PlacementScore
    message: str
    recommended_start_topic: int
    weak_topics: List[str]
    strong_topics: List[str]
    wrong_questions: List[WrongQuestion]


# Java Integration - Answer Analysis Schemas
class AnswerAnalyzeRequest(BaseModel):
    """Java backend'den gelen cevap analiz isteği"""
    question: str
    user_answer: str = Field(alias="user_answer")
    correct_answer: str = Field(alias="correct_answer")
    
    class Config:
        populate_by_name = True


class AnswerAnalyzeResponse(BaseModel):
    """Java backend'e dönen cevap analiz yanıtı"""
    isCorrect: bool
    feedback: str


# Legacy Analyzer Schemas (geriye uyumluluk)
class AnalyzeRequest(BaseModel):
    correctTopics: List[str]


class AnalyzeResponse(BaseModel):
    level: LevelEnum
    score: int
    total_topics: int
    message: str


# Roadmap Schemas
class RoadmapRequest(BaseModel):
    level: LevelEnum
    completedTopics: Optional[List[int]] = []


class Lesson(BaseModel):
    id: int
    name: str
    status: LessonStatusEnum


class RoadmapResponse(BaseModel):
    lessons: List[Lesson]
    recommended_start: int
    total_lessons: int


# Detailed Roadmap Schemas (Placement Test sonrası)
class DetailedLesson(BaseModel):
    id: int
    name: str
    description: str
    status: str
    priority: PriorityEnum
    is_weak_topic: bool
    prerequisites: List[int]


class LearningPathItem(BaseModel):
    id: int
    name: str
    type: str  # "review" or "learn"
    reason: str


class DetailedRoadmapResponse(BaseModel):
    level: LevelEnum
    lessons: List[DetailedLesson]
    priority_lessons: List[DetailedLesson]
    learning_path: List[LearningPathItem]
    recommended_start: int
    total_lessons: int
    estimated_hours: int

"""
Python AI Module
================

Bu modül Python öğrenme platformu için yapay zeka destekli özellikler sağlar.

Çalıştırma:
    cd ai_module
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload

Endpoint:
    POST http://localhost:8000/analyze
    
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

__version__ = "1.0.0"

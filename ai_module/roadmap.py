"""
Kişiye özel yol haritası oluşturan modül
Placement test sonuçlarına göre kişiselleştirilmiş öğrenme yolu
"""

import json
import os
from typing import List, Dict, Optional

def load_curriculum(language: str = "java") -> List[Dict]:
    """Müfredat JSON dosyasını ana dizinden yükler."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Dile göre dosya adını belirle (java_curriculum.json veya python_curriculum.json)
    filename = f"{language.lower()}_curriculum.json"
    curriculum_path = os.path.join(current_dir, filename)
    
    # Eğer özel dosya yoksa varsayılan curriculum.json'u dene
    if not os.path.exists(curriculum_path):
        curriculum_path = os.path.join(current_dir, "curriculum.json")

    try:
        with open(curriculum_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("topics", [])
    except FileNotFoundError:
        print(f"HATA: {curriculum_path} dosyası bulunamadı!")
        return []

def generate_roadmap_from_placement(
    level: str, 
    recommended_start_topic: int,
    weak_topics: List[str],
    strong_topics: List[str],
    language: str = "java" # Dil parametresi eklendi
) -> Dict:
    """Placement test sonuçlarına göre detaylı yol haritası oluşturur."""
    
    # Dile uygun müfredatı yükle
    topics = load_curriculum(language)
    
    # Konu adı -> ID eşleştirmesi (Zayıf konuları yakalamak için)
    topic_name_to_id = {t["name"].lower(): t["id"] for t in topics}
    
    # Zayıf konuların ID'lerini bul
    weak_topic_ids = []
    for weak in weak_topics:
        for name, tid in topic_name_to_id.items():
            if weak.lower() in name.lower() or name.lower() in weak.lower():
                weak_topic_ids.append(tid)
                break
    
    lessons = []
    priority_lessons = [] 
    
    for topic in topics:
        topic_id = topic["id"]
        prerequisites = topic.get("prerequisite", [])
        is_weak = topic_id in weak_topic_ids
        
        # Durum ve öncelik belirleme mantığı
        if topic_id < recommended_start_topic:
            if is_weak:
                status = "review"  # Başlangıçtan önce ama zayıf -> Tekrar et
                priority = "high"
            else:
                status = "skipped" # Başlangıçtan önce ve biliyor -> Atla
                priority = "low"
        elif topic_id == recommended_start_topic:
            status = "current"
            priority = "high"
        else:
            # Ön koşul kontrolü
            if all(p < recommended_start_topic or p in weak_topic_ids for p in prerequisites) or not prerequisites:
                status = "upcoming"
                priority = "medium"
            else:
                status = "locked"
                priority = "low"
        
        lesson = {
            "id": topic_id,
            "name": topic["name"],
            "description": topic.get("description", ""),
            "status": status,
            "priority": priority,
            "is_weak_topic": is_weak,
            "prerequisites": prerequisites
        }
        
        lessons.append(lesson)
        if is_weak and status == "review":
            priority_lessons.append(lesson)
    
    # Öğrenme yolunu oluştur
    learning_path = create_learning_path(lessons, recommended_start_topic, weak_topic_ids)
    
    return {
        "level": level,
        "language": language,
        "lessons": lessons,
        "priority_lessons": priority_lessons,
        "learning_path": learning_path,
        "recommended_start": recommended_start_topic,
        "total_lessons": len(lessons),
        "estimated_hours": calculate_estimated_hours(lessons, level)
    }

def create_learning_path(lessons: List[Dict], start_topic: int, weak_topic_ids: List[int]) -> List[Dict]:
    path = []
    # Önce tekrar edilmesi gereken zayıf konular
    for lesson in lessons:
        if lesson["id"] in weak_topic_ids and lesson["status"] == "review":
            path.append({"id": lesson["id"], "name": lesson["name"], "type": "review"})
    
    # Sonra önerilen başlangıçtan itibaren devam et
    for lesson in lessons:
        if lesson["id"] >= start_topic and lesson["status"] != "locked":
            path.append({"id": lesson["id"], "name": lesson["name"], "type": "learn"})
    
    return path[:15]

def calculate_estimated_hours(lessons: List[Dict], level: str) -> int:
    remaining = sum(1 for l in lessons if l["status"] in ["current", "upcoming", "review"])
    multipliers = {"beginner": 2, "intermediate": 3, "advanced": 4}
    return remaining * multipliers.get(level.lower(), 2)
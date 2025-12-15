"""
Kişiye özel yol haritası oluşturan modül
Placement test sonuçlarına göre kişiselleştirilmiş öğrenme yolu
"""

import json
import os
from typing import List, Dict, Optional


def load_curriculum() -> List[Dict]:
    """Müfredat JSON dosyasını yükler."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    curriculum_path = os.path.join(current_dir, "curriculum.json")
    
    with open(curriculum_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    return data.get("topics", [])


def generate_roadmap(level: str, completed_topics: Optional[List[int]] = None) -> Dict:
    """
    Kullanıcının seviyesine ve tamamladığı konulara göre kişisel yol haritası oluşturur.
    
    Args:
        level: Kullanıcı seviyesi ("beginner", "intermediate", "advanced")
        completed_topics: Tamamlanan konu ID'leri listesi
    
    Returns:
        Yol haritası dictionary
    """
    if completed_topics is None:
        completed_topics = []
    
    topics = load_curriculum()
    
    # Seviyeye göre başlangıç noktası belirleme
    level_start_points = {
        "beginner": 1,
        "intermediate": 13,  # Fonksiyonlar - İleri
        "advanced": 29       # Multithreading
    }
    
    start_point = level_start_points.get(level, 1)
    
    lessons = []
    recommended_start = None
    
    for topic in topics:
        topic_id = topic["id"]
        prerequisites = topic.get("prerequisite", [])
        
        # Durum belirleme
        if topic_id in completed_topics:
            status = "completed"
        elif topic_id < start_point and topic_id not in completed_topics:
            # Seviyenin altındaki konular - açık ama önerilmiyor
            status = "open"
        elif all(prereq in completed_topics for prereq in prerequisites) or not prerequisites:
            # Tüm ön koşullar tamamlanmış veya ön koşul yok
            if topic_id >= start_point:
                status = "open"
                if recommended_start is None:
                    recommended_start = topic_id
            else:
                status = "open"
        else:
            # Ön koşullar tamamlanmamış
            status = "locked"
        
        lessons.append({
            "id": topic_id,
            "name": topic["name"],
            "status": status
        })
    
    # Eğer recommended_start hala None ise, ilk açık dersi bul
    if recommended_start is None:
        for lesson in lessons:
            if lesson["status"] == "open":
                recommended_start = lesson["id"]
                break
        if recommended_start is None:
            recommended_start = 1
    
    return {
        "lessons": lessons,
        "recommended_start": recommended_start,
        "total_lessons": len(lessons)
    }


def generate_roadmap_from_placement(
    level: str, 
    recommended_start_topic: int,
    weak_topics: List[str],
    strong_topics: List[str]
) -> Dict:
    """
    Placement test sonuçlarına göre detaylı yol haritası oluşturur.
    
    Args:
        level: Belirlenen seviye
        recommended_start_topic: Önerilen başlangıç konu ID'si
        weak_topics: Zayıf konular listesi
        strong_topics: Güçlü konular listesi
    
    Returns:
        Detaylı yol haritası
    """
    topics = load_curriculum()
    
    # Konu adı -> ID eşleştirmesi
    topic_name_to_id = {t["name"].lower(): t["id"] for t in topics}
    
    # Zayıf konuların ID'lerini bul
    weak_topic_ids = []
    for weak in weak_topics:
        for name, tid in topic_name_to_id.items():
            if weak.lower() in name.lower():
                weak_topic_ids.append(tid)
                break
    
    lessons = []
    priority_lessons = []  # Öncelikli dersler (zayıf konular)
    
    for topic in topics:
        topic_id = topic["id"]
        prerequisites = topic.get("prerequisite", [])
        
        # Durum ve öncelik belirleme
        is_weak = topic_id in weak_topic_ids
        
        if topic_id < recommended_start_topic:
            # Başlangıç noktasının altındaki konular
            if is_weak:
                status = "review"  # Tekrar edilmeli
                priority = "high"
            else:
                status = "skipped"  # Atlanabilir
                priority = "low"
        elif topic_id == recommended_start_topic:
            status = "current"  # Şu anki başlangıç noktası
            priority = "high"
        else:
            # Başlangıç noktasının üstündeki konular
            if all(prereq < recommended_start_topic or prereq in weak_topic_ids for prereq in prerequisites) or not prerequisites:
                status = "upcoming"
                priority = "medium"
            else:
                status = "locked"
                priority = "low"
        
        lesson = {
            "id": topic_id,
            "name": topic["name"],
            "description": topic["description"],
            "status": status,
            "priority": priority,
            "is_weak_topic": is_weak,
            "prerequisites": prerequisites
        }
        
        lessons.append(lesson)
        
        if is_weak and status == "review":
            priority_lessons.append(lesson)
    
    # Önerilen öğrenme sırası
    learning_path = create_learning_path(lessons, recommended_start_topic, weak_topic_ids)
    
    return {
        "level": level,
        "lessons": lessons,
        "priority_lessons": priority_lessons,
        "learning_path": learning_path,
        "recommended_start": recommended_start_topic,
        "total_lessons": len(lessons),
        "estimated_hours": calculate_estimated_hours(lessons, level)
    }


def create_learning_path(
    lessons: List[Dict], 
    start_topic: int, 
    weak_topic_ids: List[int]
) -> List[Dict]:
    """
    Önerilen öğrenme sırasını oluşturur.
    
    Returns:
        Sıralı öğrenme yolu
    """
    path = []
    
    # 1. Önce zayıf konuları ekle (tekrar için)
    for lesson in lessons:
        if lesson["id"] in weak_topic_ids and lesson["id"] < start_topic:
            path.append({
                "id": lesson["id"],
                "name": lesson["name"],
                "type": "review",
                "reason": "Zayıf konu - tekrar önerilir"
            })
    
    # 2. Başlangıç noktasından itibaren konuları ekle
    for lesson in lessons:
        if lesson["id"] >= start_topic and lesson["status"] != "locked":
            path.append({
                "id": lesson["id"],
                "name": lesson["name"],
                "type": "learn",
                "reason": "Yeni konu"
            })
    
    return path[:20]  # İlk 20 adım


def calculate_estimated_hours(lessons: List[Dict], level: str) -> int:
    """
    Tahmini tamamlama süresini hesaplar.
    """
    # Seviyeye göre kalan ders sayısı
    remaining = sum(1 for l in lessons if l["status"] in ["current", "upcoming", "review"])
    
    # Ders başına ortalama saat
    hours_per_lesson = {
        "beginner": 2,
        "intermediate": 3,
        "advanced": 4
    }
    
    return remaining * hours_per_lesson.get(level, 2)


def get_next_lessons(current_topic_id: int, count: int = 3) -> List[Dict]:
    """
    Mevcut konudan sonra önerilen dersleri döner.
    
    Args:
        current_topic_id: Şu anki konu ID'si
        count: Kaç ders önerilecek
    
    Returns:
        Önerilen dersler listesi
    """
    topics = load_curriculum()
    
    next_lessons = []
    for topic in topics:
        if topic["id"] > current_topic_id:
            # Ön koşulları kontrol et
            prerequisites = topic.get("prerequisite", [])
            if current_topic_id in prerequisites or not prerequisites:
                next_lessons.append({
                    "id": topic["id"],
                    "name": topic["name"],
                    "description": topic["description"]
                })
                if len(next_lessons) >= count:
                    break
    
    return next_lessons


def get_topic_details(topic_id: int) -> Optional[Dict]:
    """
    Belirli bir konunun detaylarını döner.
    """
    topics = load_curriculum()
    
    for topic in topics:
        if topic["id"] == topic_id:
            return {
                "id": topic["id"],
                "name": topic["name"],
                "description": topic["description"],
                "prerequisites": topic.get("prerequisite", []),
                "youtube_url": topic.get("youtube_url", "")
            }
    
    return None

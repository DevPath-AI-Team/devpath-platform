"""
Müfredat + Placement Test JSON üreticisi
Bu modül curriculum.json ve placement_test.json dosyalarını programatik olarak 
oluşturmak veya genişletmek için kullanılır.
"""

import json
import os
from typing import List, Dict, Optional


class CurriculumGenerator:
    """Python müfredatı oluşturucu"""
    
    def __init__(self):
        self.topics = []
        self.current_id = 1
    
    def add_topic(self, name: str, description: str, 
                  prerequisite: Optional[List[int]] = None, 
                  youtube_url: str = "") -> int:
        """
        Müfredata yeni konu ekler.
        
        Args:
            name: Konu adı
            description: Konu açıklaması
            prerequisite: Ön koşul konu ID'leri
            youtube_url: YouTube video linki
        
        Returns:
            Eklenen konunun ID'si
        """
        topic = {
            "id": self.current_id,
            "name": name,
            "description": description,
            "prerequisite": prerequisite or [],
            "youtube_url": youtube_url
        }
        self.topics.append(topic)
        self.current_id += 1
        return topic["id"]
    
    def save(self, filepath: str = "curriculum.json"):
        """Müfredatı JSON dosyasına kaydeder."""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump({"topics": self.topics}, f, ensure_ascii=False, indent=2)
        print(f"Müfredat {filepath} dosyasına kaydedildi. ({len(self.topics)} konu)")
    
    def load(self, filepath: str = "curriculum.json"):
        """Mevcut müfredatı yükler."""
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.topics = data.get("topics", [])
                if self.topics:
                    self.current_id = max(t["id"] for t in self.topics) + 1


class PlacementTestGenerator:
    """Placement test oluşturucu"""
    
    def __init__(self):
        self.questions = []
        self.current_id = 1
        self.test_info = {
            "title": "Python Seviye Belirleme Testi",
            "description": "Bu test Python bilgi seviyenizi belirlemek için tasarlanmıştır.",
            "total_questions": 30,
            "time_limit_minutes": 45,
            "passing_score": 15
        }
    
    def add_question(self, question: str, options: List[str], 
                     correct_answer: str, explanation: str,
                     topic: str, difficulty: str) -> int:
        """
        Placement test'e yeni soru ekler.
        
        Args:
            question: Soru metni
            options: 4 şık listesi (A), B), C), D) formatında)
            correct_answer: Doğru cevap (A/B/C/D)
            explanation: Açıklama
            topic: Konu adı
            difficulty: Zorluk seviyesi (beginner/intermediate/advanced)
        
        Returns:
            Eklenen sorunun ID'si
        """
        if len(options) != 4:
            raise ValueError("Her soru için tam olarak 4 şık olmalıdır.")
        
        if correct_answer not in ["A", "B", "C", "D"]:
            raise ValueError("Doğru cevap A, B, C veya D olmalıdır.")
        
        if difficulty not in ["beginner", "intermediate", "advanced"]:
            raise ValueError("Zorluk seviyesi beginner, intermediate veya advanced olmalıdır.")
        
        q = {
            "id": self.current_id,
            "question": question,
            "options": options,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "topic": topic,
            "difficulty": difficulty
        }
        self.questions.append(q)
        self.current_id += 1
        return q["id"]
    
    def get_questions_by_difficulty(self, difficulty: str) -> List[Dict]:
        """Belirli bir zorluk seviyesindeki soruları döner."""
        return [q for q in self.questions if q["difficulty"] == difficulty]
    
    def get_questions_by_topic(self, topic: str) -> List[Dict]:
        """Belirli bir konudaki soruları döner."""
        return [q for q in self.questions if q["topic"] == topic]
    
    def save(self, filepath: str = "placement_test.json"):
        """Placement test'i JSON dosyasına kaydeder."""
        self.test_info["total_questions"] = len(self.questions)
        
        data = {
            "test_info": self.test_info,
            "questions": self.questions
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Placement test {filepath} dosyasına kaydedildi. ({len(self.questions)} soru)")
    
    def load(self, filepath: str = "placement_test.json"):
        """Mevcut placement test'i yükler."""
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.test_info = data.get("test_info", self.test_info)
                self.questions = data.get("questions", [])
                if self.questions:
                    self.current_id = max(q["id"] for q in self.questions) + 1
    
    def validate(self) -> Dict:
        """Test'i doğrular ve istatistikleri döner."""
        stats = {
            "total": len(self.questions),
            "beginner": len(self.get_questions_by_difficulty("beginner")),
            "intermediate": len(self.get_questions_by_difficulty("intermediate")),
            "advanced": len(self.get_questions_by_difficulty("advanced")),
            "topics": list(set(q["topic"] for q in self.questions)),
            "is_valid": True,
            "errors": []
        }
        
        # Validasyonlar
        if stats["total"] < 30:
            stats["is_valid"] = False
            stats["errors"].append(f"En az 30 soru olmalı, şu an {stats['total']} soru var.")
        
        if stats["beginner"] < 10:
            stats["is_valid"] = False
            stats["errors"].append(f"En az 10 beginner soru olmalı, şu an {stats['beginner']} var.")
        
        if stats["intermediate"] < 10:
            stats["is_valid"] = False
            stats["errors"].append(f"En az 10 intermediate soru olmalı, şu an {stats['intermediate']} var.")
        
        if stats["advanced"] < 10:
            stats["is_valid"] = False
            stats["errors"].append(f"En az 10 advanced soru olmalı, şu an {stats['advanced']} var.")
        
        return stats


def generate_sample_curriculum():
    """Örnek müfredat oluşturur."""
    gen = CurriculumGenerator()
    
    # Temel konular
    gen.add_topic("Python Giriş ve Kurulum", 
                  "Python programlama diline giriş, kurulum ve ilk program yazma")
    gen.add_topic("Değişkenler ve Veri Tipleri", 
                  "Python'da değişken tanımlama, int, float, string, boolean veri tipleri", [1])
    gen.add_topic("Operatörler", 
                  "Aritmetik, karşılaştırma, mantıksal ve atama operatörleri", [2])
    
    return gen


def generate_sample_placement_test():
    """Örnek placement test sorusu oluşturur."""
    gen = PlacementTestGenerator()
    
    # Örnek beginner soru
    gen.add_question(
        question="Python'da bir değişkene değer atamak için hangi operatör kullanılır?",
        options=["A) ==", "B) =", "C) :=", "D) =>"],
        correct_answer="B",
        explanation="Python'da tek eşittir (=) atama operatörüdür.",
        topic="variables",
        difficulty="beginner"
    )
    
    return gen


if __name__ == "__main__":
    # Örnek kullanım
    print("=== Müfredat Generator ===")
    curriculum_gen = generate_sample_curriculum()
    print(f"Toplam {len(curriculum_gen.topics)} konu oluşturuldu.")
    
    print("\n=== Placement Test Generator ===")
    placement_gen = generate_sample_placement_test()
    print(f"Toplam {len(placement_gen.questions)} soru oluşturuldu.")
    
    # Mevcut placement test'i yükle ve doğrula
    print("\n=== Mevcut Placement Test Validasyonu ===")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    placement_path = os.path.join(current_dir, "placement_test.json")
    
    if os.path.exists(placement_path):
        validator = PlacementTestGenerator()
        validator.load(placement_path)
        stats = validator.validate()
        print(f"Toplam soru: {stats['total']}")
        print(f"Beginner: {stats['beginner']}")
        print(f"Intermediate: {stats['intermediate']}")
        print(f"Advanced: {stats['advanced']}")
        print(f"Konular: {', '.join(stats['topics'])}")
        print(f"Geçerli: {'Evet' if stats['is_valid'] else 'Hayır'}")
        if stats['errors']:
            print("Hatalar:")
            for error in stats['errors']:
                print(f"  - {error}")

#!/usr/bin/env python3
"""
Öğrenme Yolu Oluşturma Script'i
Test sonuçlarına göre kişiselleştirilmiş yol haritası oluşturur
"""

import json
import math
from datetime import datetime, timedelta
from pathlib import Path

class LearningPathGenerator:
    def __init__(self, curriculum_file="../data/java_curriculum.json"):
        self.curriculum = self.load_json(curriculum_file)
        self.topics = {str(topic["id"]): topic for topic in self.curriculum["topics"]}
    
    def load_json(self, filepath):
        """JSON dosyasını yükle"""
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def generate_path(self, user_scores, user_preferences=None):
        """
        Test sonuçlarına göre öğrenme yolu oluştur
        
        Args:
            user_scores: {topic_id: score} formatında puanlar
            user_preferences: Kullanıcı tercihleri
        
        Returns:
            Kişiselleştirilmiş öğrenme yolu
        """
        if user_preferences is None:
            user_preferences = {
                "weekly_hours": 10,
                "learning_pace": "medium",
                "start_date": datetime.now().isoformat()
            }
        
        print("🧠 ÖĞRENME YOLU OLUŞTURULUYOR...")
        
        # 1. Zayıf konuları belirle (%70 altı)
        weak_topics = self.identify_weak_topics(user_scores)
        print(f"📊 Zayıf konular tespit edildi: {len(weak_topics)} konu")
        
        # 2. Önkoşul kontrolü yap
        eligible_topics = self.check_prerequisites(weak_topics, user_scores)
        print(f"✅ Önkoşul kontrolü tamamlandı: {len(eligible_topics)} konu uygun")
        
        # 3. Önceliklendirme yap
        prioritized_topics = self.prioritize_topics(eligible_topics)
        print(f"🎯 Konular önceliklendirildi")
        
        # 4. Haftalık plan oluştur
        weekly_schedule = self.create_weekly_schedule(
            prioritized_topics, 
            user_preferences["weekly_hours"]
        )
        
        # 5. Tam yol haritasını oluştur
        learning_path = self.build_complete_path(
            weekly_schedule, 
            user_preferences, 
            user_scores
        )
        
        return learning_path
    
    def identify_weak_topics(self, user_scores, threshold=70):
        """%70'in altındaki konuları bul"""
        weak_topics = []
        
        for topic_id, score in user_scores.items():
            if score < threshold:
                topic = self.topics.get(str(topic_id))
                if topic:
                    weak_topics.append({
                        **topic,
                        "current_score": score,
                        "improvement_needed": threshold - score
                    })
        
        return weak_topics
    
    def check_prerequisites(self, weak_topics, user_scores):
        """Önkoşulları tamamlanmış konuları filtrele"""
        eligible_topics = []
        
        for topic in weak_topics:
            prerequisites = topic.get("prerequisites", [])
            
            # Tüm önkoşullar %70 üzeri mi?
            prerequisites_met = all(
                user_scores.get(str(prereq_id), 0) >= 70
                for prereq_id in prerequisites
            )
            
            if prerequisites_met or not prerequisites:
                eligible_topics.append(topic)
            else:
                print(f"⚠️  Konu atlandı: {topic['name']} (önkoşullar eksik)")
        
        return eligible_topics
    
    def prioritize_topics(self, topics):
        """Konuları önceliğe göre sırala"""
        
        def calculate_priority_score(topic):
            """
            Öncelik skoru hesapla (yüksek skor = yüksek öncelik)
            Formül: (100 - mevcut_puan) * 0.5 + seviye_bonusu * 0.3 + (1/süre) * 10 * 0.2
            """
            current_score = topic.get("current_score", 0)
            
            # 1. Puan faktörü: Düşük puan = yüksek öncelik
            score_factor = (100 - current_score) * 0.5
            
            # 2. Seviye faktörü: Temel konular öncelikli
            level_bonus = {
                "beginner": 10,
                "intermediate": 5,
                "advanced": 2,
                "expert": 0
            }.get(topic.get("level", "beginner"), 0)
            
            level_factor = level_bonus * 0.3
            
            # 3. Süre faktörü: Kısa süreli konular öncelikli
            duration = topic.get("duration", 1)
            time_factor = (1 / max(duration, 1)) * 10 * 0.2
            
            return score_factor + level_factor + time_factor
        
        # Önceliğe göre sırala
        sorted_topics = sorted(
            topics,
            key=calculate_priority_score,
            reverse=True
        )
        
        # Öncelik skorlarını ekle
        for i, topic in enumerate(sorted_topics):
            topic["priority_score"] = calculate_priority_score(topic)
            topic["priority_rank"] = i + 1
        
        return sorted_topics
    
    def create_weekly_schedule(self, topics, max_weekly_hours=15):
        """Haftalık çalışma planı oluştur"""
        weekly_schedule = []
        current_week = 1
        current_week_hours = 0
        week_topics = []
        
        for topic in topics:
            topic_hours = topic.get("duration", 3)
            
            # Haftalık limit kontrolü
            if current_week_hours + topic_hours > max_weekly_hours:
                # Bu haftayı tamamla
                weekly_schedule.append({
                    "week": current_week,
                    "total_hours": current_week_hours,
                    "topics": week_topics.copy(),
                    "focus_areas": self.get_focus_areas(week_topics)
                })
                
                # Yeni haftaya başla
                current_week += 1
                current_week_hours = 0
                week_topics = []
            
            # Konuyu bu haftaya ekle
            week_topics.append({
                "id": topic["id"],
                "name": topic["name"],
                "duration": topic_hours,
                "current_score": topic.get("current_score", 0),
                "target_score": 70,
                "priority": topic.get("priority_rank", 0),
                "level": topic.get("level", "beginner"),
                "difficulty": topic.get("difficulty", "medium")
            })
            current_week_hours += topic_hours
        
        # Kalan konuları ekle
        if week_topics:
            weekly_schedule.append({
                "week": current_week,
                "total_hours": current_week_hours,
                "topics": week_topics,
                "focus_areas": self.get_focus_areas(week_topics)
            })
        
        return weekly_schedule
    
    def get_focus_areas(self, week_topics):
        """Haftanın odak alanlarını belirle"""
        if not week_topics:
            return []
        
        # Konuların seviyelerine göre odak alanları
        levels = [topic.get("level", "beginner") for topic in week_topics]
        
        focus_areas = []
        if "beginner" in levels:
            focus_areas.append("Temel Kavramlar")
        if "intermediate" in levels:
            focus_areas.append("Orta Seviye Konular")
        if "advanced" in levels or "expert" in levels:
            focus_areas.append("İleri Seviye Konular")
        
        return list(set(focus_areas))  # Benzersiz değerler
    
    def build_complete_path(self, weekly_schedule, user_preferences, user_scores):
        """Tam öğrenme yolunu oluştur"""
        
        start_date = datetime.fromisoformat(user_preferences.get("start_date", datetime.now().isoformat()))
        
        complete_path = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "user_preferences": user_preferences,
                "total_weeks": len(weekly_schedule),
                "total_hours": sum(week["total_hours"] for week in weekly_schedule),
                "total_topics": sum(len(week["topics"]) for week in weekly_schedule)
            },
            "summary": {
                "weak_topics_count": len([s for s in user_scores.values() if s < 70]),
                "average_score": sum(user_scores.values()) / len(user_scores) if user_scores else 0,
                "estimated_completion": self.calculate_completion_date(start_date, len(weekly_schedule)),
                "weekly_commitment": user_preferences.get("weekly_hours", 10)
            },
            "weekly_schedule": [],
            "recommendations": self.generate_path_recommendations(weekly_schedule, user_scores)
        }
        
        # Haftalık planları tarihlerle zenginleştir
        for i, week in enumerate(weekly_schedule):
            week_start = start_date + timedelta(days=7*i)
            week_end = week_start + timedelta(days=6)
            
            enriched_week = {
                **week,
                "week_number": i + 1,
                "start_date": week_start.isoformat(),
                "end_date": week_end.isoformat(),
                "daily_breakdown": self.create_daily_breakdown(week, user_preferences.get("weekly_hours", 10)),
                "weekly_goals": self.set_weekly_goals(week["topics"]),
                "success_metrics": self.define_success_metrics(week["topics"])
            }
            
            complete_path["weekly_schedule"].append(enriched_week)
        
        return complete_path
    
    def calculate_completion_date(self, start_date, total_weeks):
        """Tahmini tamamlanma tarihini hesapla"""
        completion_date = start_date + timedelta(days=7*total_weeks)
        return completion_date.isoformat()
    
    def create_daily_breakdown(self, week, weekly_hours):
        """Günlük çalışma planı oluştur"""
        days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]
        
        # Haftalık saatleri günlere dağıt
        daily_hours = weekly_hours / 7
        
        daily_plan = []
        for i, day in enumerate(days):
            # Hangi konular o gün çalışılacak?
            day_topics = []
            if i < len(week["topics"]):
                topic = week["topics"][i % len(week["topics"])]
                day_topics.append({
                    "name": topic["name"],
                    "focus": f"{topic['duration']} saat çalışma",
                    "activities": self.get_daily_activities(topic)
                })
            
            daily_plan.append({
                "day": day,
                "hours": round(daily_hours, 1),
                "topics": day_topics,
                "suggested_schedule": self.suggest_daily_schedule(daily_hours)
            })
        
        return daily_plan
    
    def get_daily_activities(self, topic):
        """Günlük aktiviteleri belirle"""
        difficulty = topic.get("difficulty", "medium")
        
        if difficulty == "easy":
            return [
                "Kavramları öğren",
                "Temel örnekleri incele",
                "Basit alıştırmalar yap"
            ]
        elif difficulty == "medium":
            return [
                "Konuyu derinlemesine çalış",
                "Orta seviye alıştırmalar yap",
                "Proje fikirleri üret"
            ]
        else:  # hard/expert
            return [
                "İleri seviye kaynakları incele",
                "Kompleks problemler çöz",
                "Gerçek dünya senaryoları üzerinde çalış"
            ]
    
    def suggest_daily_schedule(self, daily_hours):
        """Günlük çalışma programı öner"""
        if daily_hours <= 1:
            return ["Tek oturumda çalış"]
        elif daily_hours <= 2:
            return ["Sabah 1 saat", "Akşam 1 saat"]
        else:
            return ["Sabah 1.5 saat", "Öğle 1 saat", "Akşam 1.5 saat"]
    
    def set_weekly_goals(self, week_topics):
        """Haftalık hedefleri belirle"""
        goals = []
        
        for topic in week_topics:
            current = topic.get("current_score", 0)
            target = 70
            
            goals.append({
                "topic": topic["name"],
                "goal": f"{current}% → {target}%",
                "key_result": f"{topic['duration']} saat çalışma tamamla"
            })
        
        return goals
    
    def define_success_metrics(self, week_topics):
        """Başarı metriklerini tanımla"""
        return {
            "completion_rate": "Tüm konuları tamamlama",
            "understanding_level": "Kavramları anlama testi",
            "practice_completion": "Alıştırmaları tamamlama",
            "time_management": "Planlanan süreye uyma"
        }
    
    def generate_path_recommendations(self, weekly_schedule, user_scores):
        """Yol için genel öneriler oluştur"""
        recommendations = []
        
        # İlk hafta için motivasyon
        recommendations.append({
            "type": "motivation",
            "title": "İlk Adım",
            "message": "İlk hafta temelleri güçlendirmek için harika bir başlangıç!",
            "tip": "Her gün düzenli çalışın, küçük başarılarla motive olun."
        })
        
        # Ortalama puana göre öneri
        avg_score = sum(user_scores.values()) / len(user_scores) if user_scores else 0
        
        if avg_score < 50:
            recommendations.append({
                "type": "strategy",
                "title": "Temel Odaklı Yaklaşım",
                "message": "Temel konulara daha fazla zaman ayırmanız gerekiyor.",
                "suggestions": [
                    "Her konuyu adım adım öğrenin",
                    "Bol bol pratik yapın",
                    "Anlamadığınız yerleri tekrar edin"
                ]
            })
        
        # Toplam hafta sayısına göre öneri
        total_weeks = len(weekly_schedule)
        if total_weeks > 8:
            recommendations.append({
                "type": "planning",
                "title": "Uzun Vadeli Plan",
                "message": f"{total_weeks} haftalık bir yol haritanız var. Sabırlı olun!",
                "tip": "Her haftanın sonunda küçük bir değerlendirme yapın."
            })
        
        return recommendations
    
    def save_path(self, user_id, learning_path, output_dir="../data/outputs/personalized_paths"):
        """Öğrenme yolunu kaydet"""
        # Klasörü oluştur
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Dosya adı
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_dir}/{user_id}_path_{timestamp}.json"
        
        # JSON olarak kaydet
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(learning_path, f, indent=2, ensure_ascii=False)
        
        # Özet raporu da oluştur
        self.create_summary_report(user_id, learning_path, output_dir)
        
        print(f"✅ Öğrenme yolu kaydedildi: {filename}")
        return filename
    
    def create_summary_report(self, user_id, learning_path, output_dir):
        """Özet rapor oluştur"""
        summary = []
        summary.append("=" * 60)
        summary.append("🗺️  KİŞİSELLEŞTİRİLMİŞ ÖĞRENME YOLU ÖZETİ")
        summary.append("=" * 60)
        summary.append(f"\n👤 Kullanıcı: {user_id}")
        summary.append(f"📅 Oluşturulma: {learning_path['metadata']['generated_at'][:10]}")
        summary.append(f"⏰ Toplam Süre: {learning_path['metadata']['total_weeks']} hafta")
        summary.append(f"📚 Toplam Konu: {learning_path['metadata']['total_topics']}")
        summary.append(f"🕒 Haftalık Çalışma: {learning_path['summary']['weekly_commitment']} saat")
        
        summary.append("\n" + "=" * 60)
        summary.append("📅 HAFTALIK PLAN")
        summary.append("=" * 60)
        
        for week in learning_path["weekly_schedule"][:4]:  # İlk 4 haftayı göster
            summary.append(f"\n🗓️  HAFTA {week['week_number']} ({week['start_date'][:10]} - {week['end_date'][:10]})")
            summary.append(f"   Toplam Saat: {week['total_hours']} saat")
            summary.append(f"   Konu Sayısı: {len(week['topics'])}")
            summary.append(f"   Odak Alanları: {', '.join(week['focus_areas'])}")
            
            for topic in week["topics"]:
                summary.append(f"   • {topic['name']} ({topic['duration']} saat) - Öncelik: {topic['priority']}")
        
        summary.append("\n" + "=" * 60)
        summary.append("🎯 ÖNERİLER")
        summary.append("=" * 60)
        
        for rec in learning_path["recommendations"][:3]:
            summary.append(f"\n{rec['title']}:")
            summary.append(f"   {rec['message']}")
            if 'tip' in rec:
                summary.append(f"   💡 {rec['tip']}")
        
        # Dosyaya kaydet
        txt_file = f"{output_dir}/{user_id}_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(txt_file, 'w', encoding='utf-8') as f:
            f.write("\n".join(summary))
        
        print(f"📝 Özet rapor oluşturuldu: {txt_file}")

def main():
    """Ana fonksiyon - Örnek kullanım"""
    print("=" * 60)
    print("🚀 ÖĞRENME YOLU OLUŞTURUCU")
    print("=" * 60)
    
    # Örnek kullanıcı puanları
    user_scores = {
        "1": 45,   # Java Temelleri
        "2": 60,   # Değişkenler
        "3": 85,   # Operatörler
        "4": 30,   # Kontrol Yapıları
        "5": 70,   # Döngüler
        "6": 55,   # Metodlar
        "7": 40,   # Diziler
        "8": 25,   # OOP Giriş
        "9": 65,   # Encapsulation
        "10": 50,  # Inheritance
        "11": 80,  # Polymorphism
        "12": 35,  # Abstract/Interface
        "13": 75,  # Exception Handling
        "14": 40   # Collections - List
    }
    
    # Kullanıcı tercihleri
    user_preferences = {
        "weekly_hours": 12,
        "learning_pace": "medium",
        "start_date": datetime.now().isoformat(),
        "preferred_time": "evening",
        "days_per_week": 5
    }
    
    # Generator'ı başlat
    generator = LearningPathGenerator()
    
    # Öğrenme yolu oluştur
    learning_path = generator.generate_path(user_scores, user_preferences)
    
    # Ekrana özet göster
    print("\n" + "=" * 60)
    print("📋 ÖĞRENME YOLU ÖZETİ")
    print("=" * 60)
    print(f"Toplam Hafta: {learning_path['metadata']['total_weeks']}")
    print(f"Toplam Saat: {learning_path['metadata']['total_hours']}")
    print(f"Toplam Konu: {learning_path['metadata']['total_topics']}")
    print(f"Haftalık Çalışma: {learning_path['summary']['weekly_commitment']} saat")
    print(f"Tahmini Tamamlanma: {learning_path['summary']['estimated_completion'][:10]}")
    
    print("\n📅 İlk 2 Hafta:")
    for week in learning_path["weekly_schedule"][:2]:
        print(f"\nHafta {week['week_number']} ({week['start_date'][:10]}):")
        print(f"  Saat: {week['total_hours']}, Konu: {len(week['topics'])}")
        for topic in week["topics"]:
            print(f"  • {topic['name']} ({topic['current_score']}% → 70%)")
    
    # Kaydet
    generator.save_path("user_001", learning_path)
    
    print("\n" + "=" * 60)
    print("🎉 ÖĞRENME YOLU HAZIR!")
    print("=" * 60)
    print("\nBir sonraki adımlar:")
    print("1. Haftalık planınızı takip edin")
    print("2. Her konudan sonra küçük test yapın")
    print("3. İlerlemenizi kaydedin")
    print("4. Gerektiğinde planınızı güncelleyin")

if __name__ == "__main__":
    main()
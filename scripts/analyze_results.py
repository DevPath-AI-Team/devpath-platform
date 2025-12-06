#!/usr/bin/env python3
"""
Test Sonuçları Analiz Script'i
Kullanıcı test sonuçlarını detaylı analiz eder
"""

import json
import statistics
from datetime import datetime
from pathlib import Path

class TestAnalyzer:
    def __init__(self, results_file="user_test_results.json"):
        self.results_file = results_file
        self.load_data()
    
    def load_data(self):
        """Tüm verileri yükle"""
        try:
            with open(f'../data/{self.results_file}', 'r') as f:
                self.results = json.load(f)
        except FileNotFoundError:
            print("⚠️  Test sonuçları dosyası bulunamadı. Örnek veri oluşturuluyor...")
            self.results = self.create_sample_results()
        
        with open('../data/java_curriculum.json', 'r') as f:
            self.curriculum = json.load(f)
        
        with open('../data/assessment_tests.json', 'r') as f:
            self.tests = json.load(f)
    
    def create_sample_results(self):
        """Örnek test sonuçları oluştur"""
        sample_results = {
            "user_001": {
                "user_id": "user_001",
                "name": "Ahmet Yılmaz",
                "tests_taken": [
                    {
                        "test_id": "beginner_test",
                        "date": "2024-01-15T10:30:00",
                        "score": 65,
                        "answers": [
                            {"question_id": 1, "selected": 0, "is_correct": True},
                            {"question_id": 2, "selected": 1, "is_correct": True},
                            {"question_id": 3, "selected": 2, "is_correct": False},
                            {"question_id": 4, "selected": 2, "is_correct": True},
                            {"question_id": 5, "selected": 1, "is_correct": True},
                            {"question_id": 6, "selected": 1, "is_correct": True},
                            {"question_id": 7, "selected": 3, "is_correct": True},
                            {"question_id": 8, "selected": 0, "is_correct": True},
                            {"question_id": 9, "selected": 3, "is_correct": True},
                            {"question_id": 10, "selected": 2, "is_correct": False}
                        ],
                        "time_taken": 720,  # saniye
                        "passed": False
                    }
                ],
                "topic_scores": {
                    "1": 85,  # Java Temelleri
                    "2": 60,  # Değişkenler
                    "3": 45,  # Operatörler
                    "4": 70,  # Kontrol Yapıları
                    "5": 75,  # Döngüler
                    "6": 55,  # Metodlar
                    "7": 40,  # Diziler
                    "8": 25,  # OOP
                    "9": 65,  # Encapsulation
                    "10": 50  # Inheritance
                },
                "weak_topics": ["3", "7", "8", "10"],  # %70 altı
                "learning_goals": ["Backend developer olmak", "Spring Boot öğrenmek"]
            }
        }
        
        # Örnek veriyi kaydet
        with open(f'../data/{self.results_file}', 'w') as f:
            json.dump(sample_results, f, indent=2)
        
        print("✅ Örnek test sonuçları oluşturuldu")
        return sample_results
    
    def analyze_user(self, user_id):
        """Kullanıcının detaylı analizini yap"""
        if user_id not in self.results:
            print(f"❌ Kullanıcı bulunamadı: {user_id}")
            return None
        
        user_data = self.results[user_id]
        
        analysis = {
            "user_id": user_id,
            "name": user_data.get("name", "Bilinmeyen"),
            "analysis_date": datetime.now().isoformat(),
            "overall_performance": self.analyze_overall_performance(user_data),
            "topic_analysis": self.analyze_topics(user_data),
            "test_history": self.analyze_test_history(user_data),
            "recommendations": self.generate_recommendations(user_data),
            "strengths_weaknesses": self.identify_strengths_weaknesses(user_data)
        }
        
        return analysis
    
    def analyze_overall_performance(self, user_data):
        """Genel performans analizi"""
        test_scores = [test["score"] for test in user_data.get("tests_taken", [])]
        topic_scores = list(user_data.get("topic_scores", {}).values())
        
        return {
            "average_test_score": statistics.mean(test_scores) if test_scores else 0,
            "average_topic_score": statistics.mean(topic_scores) if topic_scores else 0,
            "best_test_score": max(test_scores) if test_scores else 0,
            "worst_test_score": min(test_scores) if test_scores else 0,
            "tests_taken": len(test_scores),
            "pass_rate": len([s for s in test_scores if s >= 70]) / len(test_scores) * 100 if test_scores else 0
        }
    
    def analyze_topics(self, user_data):
        """Konu bazlı analiz"""
        topic_scores = user_data.get("topic_scores", {})
        weak_topics = user_data.get("weak_topics", [])
        
        topic_analysis = {}
        for topic_id, score in topic_scores.items():
            topic_info = self.get_topic_info(topic_id)
            
            topic_analysis[topic_id] = {
                "name": topic_info.get("name", "Bilinmeyen"),
                "score": score,
                "status": "weak" if topic_id in weak_topics else "strong",
                "level": topic_info.get("level", "unknown"),
                "difficulty": topic_info.get("difficulty", "unknown"),
                "duration": topic_info.get("duration", 0),
                "priority": self.calculate_topic_priority(score, topic_info)
            }
        
        return topic_analysis
    
    def get_topic_info(self, topic_id):
        """Konu bilgilerini getir"""
        for topic in self.curriculum["topics"]:
            if str(topic["id"]) == str(topic_id):
                return topic
        return {}
    
    def calculate_topic_priority(self, score, topic_info):
        """Konu önceliğini hesapla (1-10 arası)"""
        if score >= 85:
            return 1  # Düşük öncelik
        elif score >= 70:
            return 3
        elif score >= 50:
            return 6
        elif score >= 30:
            return 8
        else:
            return 10  # Yüksek öncelik
    
    def analyze_test_history(self, user_data):
        """Test geçmişi analizi"""
        tests = user_data.get("tests_taken", [])
        
        history = []
        for test in tests:
            test_info = self.get_test_info(test["test_id"])
            history.append({
                "test_name": test_info.get("name", "Bilinmeyen Test"),
                "date": test["date"],
                "score": test["score"],
                "passed": test["score"] >= 70,
                "time_taken": test.get("time_taken", 0),
                "time_per_question": test.get("time_taken", 0) / test_info.get("total_questions", 1) if test.get("time_taken") else 0
            })
        
        return history
    
    def get_test_info(self, test_id):
        """Test bilgilerini getir"""
        for test in self.tests.get("tests", []):
            if test["id"] == test_id:
                return test
        return {}
    
    def generate_recommendations(self, user_data):
        """Kişiselleştirilmiş öneriler oluştur"""
        topic_scores = user_data.get("topic_scores", {})
        weak_topics = user_data.get("weak_topics", [])
        
        recommendations = []
        
        # Öncelikli konular için öneriler
        for topic_id in weak_topics[:5]:  # İlk 5 zayıf konu
            topic_info = self.get_topic_info(topic_id)
            score = topic_scores.get(topic_id, 0)
            
            recommendation = {
                "topic_id": topic_id,
                "topic_name": topic_info.get("name", "Bilinmeyen"),
                "current_score": score,
                "target_score": 70,
                "priority": self.calculate_topic_priority(score, topic_info),
                "estimated_time": topic_info.get("duration", 0),
                "action_plan": self.create_action_plan(topic_info, score),
                "resources": self.get_topic_resources(topic_info)
            }
            recommendations.append(recommendation)
        
        # Genel öneriler
        overall_score = statistics.mean(list(topic_scores.values())) if topic_scores else 0
        
        if overall_score < 50:
            recommendations.append({
                "type": "general",
                "title": "Temelleri Güçlendirin",
                "message": "Java temellerinde eksikleriniz var. Başlangıç konularına daha fazla zaman ayırın.",
                "suggested_actions": [
                    "Değişkenler ve veri tiplerini tekrar edin",
                    "Kontrol yapıları üzerine alıştırma yapın",
                    "Temel algoritmalar yazın"
                ]
            })
        elif overall_score < 70:
            recommendations.append({
                "type": "general",
                "title": "Orta Seviyeye Geçiş",
                "message": "Temellerde iyisiniz, şimdi OOP konularına odaklanın.",
                "suggested_actions": [
                    "Class ve object kavramlarını pekiştirin",
                    "Inheritance ve polymorphism öğrenin",
                    "Küçük projeler yapın"
                ]
            })
        
        return sorted(recommendations, key=lambda x: x.get("priority", 0), reverse=True)
    
    def create_action_plan(self, topic_info, current_score):
        """Konu için aksiyon planı oluştur"""
        difficulty = topic_info.get("difficulty", "medium")
        
        if current_score < 40:
            return [
                "Temel kavramları öğrenin",
                "Örnek kodları inceleyin",
                "Basit alıştırmalar yapın"
            ]
        elif current_score < 60:
            return [
                "Kavramları tekrar edin",
                "Orta seviye alıştırmalar yapın",
                "Hataları analiz edin"
            ]
        else:
            return [
                "İleri seviye konuları öğrenin",
                "Proje geliştirin",
                "Diğer konularla bağlantı kurun"
            ]
    
    def get_topic_resources(self, topic_info):
        """Konu için kaynakları getir"""
        # Basit kaynak önerileri
        difficulty = topic_info.get("difficulty", "medium")
        
        if difficulty == "easy":
            return [
                {"type": "video", "title": "Temel Kavramlar Videosu", "estimated_time": "30 dk"},
                {"type": "practice", "title": "Online Alıştırmalar", "estimated_time": "1 saat"}
            ]
        elif difficulty == "medium":
            return [
                {"type": "tutorial", "title": "Detaylı Tutorial", "estimated_time": "2 saat"},
                {"type": "project", "title": "Mini Proje", "estimated_time": "3 saat"}
            ]
        else:
            return [
                {"type": "documentation", "title": "Resmi Dokümantasyon", "estimated_time": "2 saat"},
                {"type": "advanced", "title": "İleri Seviye Makale", "estimated_time": "1.5 saat"}
            ]
    
    def identify_strengths_weaknesses(self, user_data):
        """Güçlü ve zayıf yönleri belirle"""
        topic_scores = user_data.get("topic_scores", {})
        
        strengths = []
        weaknesses = []
        
        for topic_id, score in topic_scores.items():
            topic_info = self.get_topic_info(topic_id)
            
            if score >= 80:
                strengths.append({
                    "topic_id": topic_id,
                    "name": topic_info.get("name", "Bilinmeyen"),
                    "score": score,
                    "level": topic_info.get("level", "unknown")
                })
            elif score < 60:
                weaknesses.append({
                    "topic_id": topic_id,
                    "name": topic_info.get("name", "Bilinmeyen"),
                    "score": score,
                    "level": topic_info.get("level", "unknown"),
                    "priority": "high" if score < 40 else "medium"
                })
        
        return {
            "strengths": sorted(strengths, key=lambda x: x["score"], reverse=True)[:5],
            "weaknesses": sorted(weaknesses, key=lambda x: x["score"])[:5]
        }
    
    def generate_report(self, user_id, output_format="json"):
        """Analiz raporu oluştur"""
        analysis = self.analyze_user(user_id)
        
        if not analysis:
            return None
        
        if output_format == "json":
            return analysis
        elif output_format == "text":
            return self.format_text_report(analysis)
        elif output_format == "markdown":
            return self.format_markdown_report(analysis)
    
    def format_text_report(self, analysis):
        """Metin formatında rapor oluştur"""
        report = []
        report.append("=" * 60)
        report.append("📊 JAVA ÖĞRENME ANALİZ RAPORU")
        report.append("=" * 60)
        report.append(f"\n👤 Kullanıcı: {analysis['name']}")
        report.append(f"📅 Analiz Tarihi: {analysis['analysis_date'][:10]}")
        
        # Genel Performans
        perf = analysis['overall_performance']
        report.append("\n" + "=" * 60)
        report.append("📈 GENEL PERFORMANS")
        report.append("=" * 60)
        report.append(f"Ortalama Test Puanı: {perf['average_test_score']:.1f}%")
        report.append(f"Ortalama Konu Puanı: {perf['average_topic_score']:.1f}%")
        report.append(f"En İyi Test: {perf['best_test_score']}%")
        report.append(f"Test Sayısı: {perf['tests_taken']}")
        report.append(f"Başarı Oranı: {perf['pass_rate']:.1f}%")
        
        # Güçlü ve Zayıf Yönler
        sw = analysis['strengths_weaknesses']
        report.append("\n" + "=" * 60)
        report.append("✅ GÜÇLÜ YÖNLERİNİZ")
        report.append("=" * 60)
        for strength in sw['strengths']:
            report.append(f"• {strength['name']}: {strength['score']}%")
        
        report.append("\n" + "=" * 60)
        report.append("⚠️  GELİŞTİRİLECEK ALANLAR")
        report.append("=" * 60)
        for weakness in sw['weaknesses']:
            report.append(f"• {weakness['name']}: {weakness['score']}% ({weakness['priority']} öncelik)")
        
        # Öneriler
        report.append("\n" + "=" * 60)
        report.append("🎯 ÖNERİLER")
        report.append("=" * 60)
        for i, rec in enumerate(analysis['recommendations'][:3], 1):
            if isinstance(rec, dict) and 'topic_name' in rec:
                report.append(f"\n{i}. {rec['topic_name']} (Öncelik: {rec['priority']}/10)")
                report.append(f"   Mevcut: {rec['current_score']}% → Hedef: {rec['target_score']}%")
                report.append(f"   Tahmini Süre: {rec['estimated_time']} saat")
                for action in rec['action_plan']:
                    report.append(f"   • {action}")
        
        return "\n".join(report)
    
    def format_markdown_report(self, analysis):
        """Markdown formatında rapor oluştur"""
        # ... markdown formatlama kodu
        pass
    
    def save_report(self, user_id, output_file=None):
        """Raporu dosyaya kaydet"""
        analysis = self.analyze_user(user_id)
        
        if not analysis:
            print(f"❌ Rapor oluşturulamadı: {user_id}")
            return False
        
        if not output_file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"../data/outputs/reports/{user_id}_report_{timestamp}.json"
        
        # Klasörü oluştur
        Path(output_file).parent.mkdir(parents=True, exist_ok=True)
        
        # JSON olarak kaydet
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        
        # Metin raporu da oluştur
        text_report = self.format_text_report(analysis)
        txt_file = output_file.replace('.json', '.txt')
        with open(txt_file, 'w', encoding='utf-8') as f:
            f.write(text_report)
        
        print(f"✅ Rapor kaydedildi:")
        print(f"   📄 JSON: {output_file}")
        print(f"   📝 TXT: {txt_file}")
        
        return True

def main():
    """Ana fonksiyon"""
    print("🧪 TEST SONUÇLARI ANALİZ EDİLİYOR...")
    
    analyzer = TestAnalyzer()
    
    # Tüm kullanıcıları analiz et
    for user_id in analyzer.results.keys():
        print(f"\n{'='*60}")
        print(f"🔍 KULLANICI ANALİZİ: {user_id}")
        print('='*60)
        
        analysis = analyzer.analyze_user(user_id)
        if analysis:
            # Ekrana yazdır
            text_report = analyzer.format_text_report(analysis)
            print(text_report)
            
            # Dosyaya kaydet
            analyzer.save_report(user_id)

if __name__ == "__main__":
    main()
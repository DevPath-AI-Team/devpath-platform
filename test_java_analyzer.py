'''
Bu script, analyzer.py'nin Java analiz yeteneklerini test eder. (Düzeltilmiş Versiyon)
Senaryo: Java'ya yeni başlayan bir kullanıcı (Tüm orta/ileri seviye sorular KESİNLİKLE yanlış)
Beklenti: Seviyenin 'Başlangıç' olarak belirlenmesi.
'''
import sys
import json
# Proje ana dizinini import path'ine ekle
sys.path.append('.') 

from analyzer import analyze_placement_test

# --- Düzeltilmiş Test Senaryosu: Java'ya Yeni Başlayan Kullanıcı ---
# Sadece ilk 3 başlangıç sorusunu doğru, geri kalan her şeyi KESİNLİKLE yanlış cevaplıyor.
beginner_answers = {
    "1": "B",  # Doğru
    "2": "B",  # Doğru
    "3": "C",  # Doğru
    "4": "A",  # Yanlış (Doğrusu: B)
    "5": "A",  # Yanlış (Doğrusu: B)
    "6": "A",  # Yanlış
    "7": "B",  # Yanlış
    "8": "C",  # Yanlış
    "9": "D",  # Yanlış
    "10": "A", # Yanlış
    "11": "B", # Yanlış
    "12": "A", # Yanlış
    "13": "B", # Yanlış
    "14": "C", # Yanlış
    "15": "A"  # Yanlış (Doğrusu: D). Bu cevap özellikle yanlış seçildi.
}

# Analiz fonksiyonunu çalıştır
analysis_result = analyze_placement_test(language='JAVA', answers=beginner_answers)

# Sonucu okunaklı bir formatta yazdır
print("--- YENİ KULLANICI (JAVA BAŞLANGIÇ) DÜZELTİLMİŞ TEST SONUCU ---")
print(f"Beklenen Seviye: Başlangıç. Gerçekleşen Seviye: {analysis_result.get('level')}")
print(f"Kullanıcıya Gösterilecek Mesaj: {analysis_result.get('message')}")
print(f"Tavsiye Edilen Başlangıç Konu ID: {analysis_result.get('recommended_start_topic_id')}")
print(f"Genel Başarı Yüzdesi: {analysis_result.get('score', {}).get('percentage')}%")

# Daha detaylı skor dökümü
score_details = analysis_result.get('score', {}).get('details', {})
print("\n--- Detaylı Skor Dökümü ---")
for level, scores in score_details.items():
    print(f"{level.capitalize()} Seviyesi: {scores['correct']} / {scores['total']}")

print("\n--- TEST BAŞARIYLA TAMAMLANDI ---")


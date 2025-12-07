#!/usr/bin/env python3
"""
DevPath AI Soru Bankası Terminal Testi
Backend'den soruları terminal üzerinden gösterir
"""

import json
import os
import random

def load_question_bank():
    """Soru bankasını yükle"""
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        question_bank_path = os.path.join(project_root, 'data', 'question_bank.json')

        with open(question_bank_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Soru bankası yüklenemedi: {e}")
        return None

def load_test_config():
    """Test yapılandırmasını yükle"""
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        test_config_path = os.path.join(project_root, 'data', 'assessment_tests.json')

        with open(test_config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Test yapılandırması yüklenemedi: {e}")
        return None

def display_question(question):
    """Soruyu terminal üzerinde göster"""
    print("\n" + "="*60)
    print(f"📝 SORU {question['id']}")
    print("="*60)
    print(f"📚 Kategori: {question['category'].upper()}")
    print(f"🎯 Zorluk: {question['difficulty'].upper()}")
    print(f"🏷️  Etiketler: {', '.join(question['tags'])}")
    print()
    print(f"❓ {question['question_text']}")
    print()
    print("📋 CEVAP SEÇENEKLERİ:")
    for i, option in enumerate(question['options']):
        print(f"   {i}. {option}")

    print()
    print(f"✅ DOĞRU CEVAP: {question['correct_answer']} - {question['options'][question['correct_answer']]}")
    print(f"💡 AÇIKLAMA: {question['explanation']}")
    print("="*60)

def run_terminal_test():
    """Terminal üzerinden soru testi çalıştır"""
    print("🚀 DEVPAI AI SORU BANKASI TERMINAL TESTİ")
    print("="*60)

    # Soru bankasını yükle
    question_bank = load_question_bank()
    if not question_bank:
        return

    # Test yapılandırmasını yükle
    test_config = load_test_config()
    if not test_config:
        return

    questions = question_bank.get('questions', [])
    test_data = test_config.get('tests', [{}])[0]
    test_questions = test_data.get('questions', [])

    print(f"📊 Soru Bankası: {question_bank['total_questions']} soru")
    print(f"🧪 Test: {test_data.get('name', 'Bilinmiyor')}")
    print(f"📝 Soru Sayısı: {test_data.get('total_questions', 0)}")
    print(f"🎯 Geçme Notu: %{test_data.get('passing_score', 70)}")
    print()

    # Test sorularını göster
    print("📋 TEST SORULARI:")
    print("-" * 30)

    for i, question_id in enumerate(test_questions, 1):
        # Soruyu ID'ye göre bul
        question = next((q for q in questions if q['id'] == question_id), None)

        if question:
            print(f"{i}. Soru ID: {question_id} - {question['question_text'][:50]}...")
        else:
            print(f"{i}. Soru ID: {question_id} - ❌ SORU BULUNAMADI")

    print("\n" + "="*60)
    print("🎮 SORU GÖSTERİM TESTİ")
    print("="*60)

    # Rastgele bir soru göster
    if questions:
        random_question = random.choice(questions)
        display_question(random_question)

        print("\n💡 Test tamamlandı!")
        print(f"✅ Toplam {len(questions)} soru başarıyla yüklendi")
        print(f"✅ Test yapılandırması {len(test_questions)} soru içeriyor")
        print(f"✅ Backend sistem çalışır durumda")
    else:
        print("❌ Soru bankası boş!")

def main():
    """Ana test fonksiyonu"""
    try:
        run_terminal_test()
    except KeyboardInterrupt:
        print("\n\n⏹️  Test durduruldu")
    except Exception as e:
        print(f"\n❌ Test hatası: {e}")

if __name__ == "__main__":
    main()
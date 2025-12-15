#!/usr/bin/env python3
"""
Hızlı DevPath AI Testi - Random Soru Seçimi
"""

import json
import os
import random

def test_random_selection():
    """Random soru seçimi testini çalıştır"""

    # Soru bankasını yükle
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    question_bank_path = os.path.join(project_root, 'data', 'question_bank.json')

    try:
        with open(question_bank_path, 'r', encoding='utf-8') as f:
            question_bank = json.load(f)

        questions = question_bank.get('questions', [])

        print("🎲 DEVPAI AI RANDOM SORU TESTİ")
        print("=" * 50)

        # 3 kez random seçim yap ve karşılaştır
        selections = []
        for i in range(3):
            # Her seviyeden 10'ar soru seç
            beginner_questions = [q['id'] for q in questions if q.get('category') == 'beginner']
            intermediate_questions = [q['id'] for q in questions if q.get('category') == 'intermediate']
            advanced_questions = [q['id'] for q in questions if q.get('category') == 'advanced']

            selected = []
            selected.extend(random.sample(beginner_questions, min(10, len(beginner_questions))))
            selected.extend(random.sample(intermediate_questions, min(10, len(intermediate_questions))))
            selected.extend(random.sample(advanced_questions, min(10, len(advanced_questions))))

            random.shuffle(selected)
            selections.append(selected[:30])

            print(f"\n🔄 Test {i+1}:")
            print(f"   Seçilen Sorular: {selected[:30]}")
            print(f"   Toplam: {len(selected[:30])} soru")

        # Farklılık kontrolü
        print(f"\n📊 Karşılaştırma:")
        print(f"   Test 1-2 Farklı: {selections[0] != selections[1]}")
        print(f"   Test 1-3 Farklı: {selections[0] != selections[2]}")
        print(f"   Test 2-3 Farklı: {selections[1] != selections[2]}")

        if all(selections[0] != selections[1] != selections[2] for i in range(3) if i != 1):
            print("✅ RANDOM SİSTEM ÇALIŞIYOR!")
        else:
            print("❌ Random sistem sorunu var")

        # Soru detaylarını göster
        print(f"\n📚 Soru Bankası İstatistikleri:")
        print(f"   Toplam Soru: {len(questions)}")
        print(f"   Başlangıç: {len([q for q in questions if q.get('category') == 'beginner'])}")
        print(f"   Orta: {len([q for q in questions if q.get('category') == 'intermediate'])}")
        print(f"   İleri: {len([q for q in questions if q.get('category') == 'advanced'])}")

        # Örnek soru göster
        if questions:
            sample = random.choice(questions)
            print(f"\n💡 Örnek Soru (ID: {sample['id']}):")
            print(f"   \"{sample['question_text'][:60]}...\"")
            print(f"   ✅ Doğru: {sample['correct_answer']}")

    except Exception as e:
        print(f"❌ Test hatası: {e}")

if __name__ == "__main__":
    test_random_selection()
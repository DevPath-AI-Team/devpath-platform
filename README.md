# DevPath AI - Kişiselleştirilmiş Java Öğrenme Platformu

DevPath AI, **yapay zeka destekli kişiselleştirilmiş Java öğrenme platformu**dur. Öğrencilerin mevcut bilgilerini değerlendirerek, zayıf yönlerini tespit edip özel öğrenme yolları oluşturan akıllı eğitim sistemidir.

## 🎯 Sistem Amacı

- Öğrencilerin Java programlama seviyesini objektif olarak değerlendirmek
- Zayıf ve güçlü yönleri detaylı analiz etmek
- Kişiselleştirilmiş öğrenme yolları oluşturmak
- İlerlemeyi gerçek zamanlı takip edip raporlamak
- Öğrenciyi motive edecek gamification özellikleri sunmak

## 🏗️ Genel Mimarisi

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ÖĞRENCİ       │    │   DEVPATH AI    │    │   VERİTABANI    │
│                 │    │                 │    │                 │
│ • Test Çözme    │◄──►│ • Test Değer.   │    │ • Soru Bankası  │
│ • İlerleme Takip│    │ • Analiz Yapma  │    │ • Müfredat      │
│ • Öneri Alma    │    │ • Yol Haritası  │    │ • Test Sonuçları│
└─────────────────┘    │   Oluşturma     │    │ • Öğrenme Kay.  │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   RAPORLAMA     │
                       │                 │
                       │ • Performans R. │
                       │ • İlerleme R.   │
                       │ • Öneri Raporu  │
                       └─────────────────┘
```

## 📊 Ana Bileşenler

### 1. **Test ve Değerlendirme Sistemi**
- **44** adet başlangıç, **55** adet orta, **51** adet ileri seviye soru
- Toplam **150** adet çoktan seçmeli soru
- Her seviye için farklı başarı eşikleri (%60-95 arası)
- Otomatik puanlama ve anlık geri bildirim

### 2. **Müfredat Yönetimi**
- **34** adet Java programlama konusu
- **145** saat toplam öğrenme süresi
- Başlangıç'tan Uzman'a kadar 4 seviye sınıflandırması
- Konu bağımlılıkları ve önerilen öğrenme sırası

### 3. **Kişiselleştirme Motoru**
- Öğrencinin güçlü/zayıf yönlerini tespit
- Öğrenme stiline göre içerik uyarlama (Görsel, İşitsel, Kinestetik, Okuma)
- Öncelik sırasına göre konu önerileri
- Adaptif zorluk ayarı

### 4. **İlerleme Takip Sistemi**
- Haftalık/aylık detaylı raporlar
- Başarı rozetleri ve motivasyon sistemi
- Gerileme uyarıları ve iyileşme önerileri
- Zaman yönetimi ve çalışma verimliliği analizi

## 🔄 Sistem Akışı

```
1. ÖĞRENCİ KAYDI & PROFİL OLUŞTURMA
   ↓
2. İLK SEVİYE BELİRLEME TESTİ (30 soru)
   ↓
3. ZAYIF/GÜÇLÜ YÖNLER DETAYLI ANALİZİ
   ↓
4. KİŞİSELLEŞTİRİLMİŞ YOL HARİTASI OLUŞTURMA
   ↓
5. HAFTALIK ÇALIŞMA PLANI VE HEDEFLER
   ↓
6. GÜNLÜK ÇALIŞMA OTURUMLARI & TAKİP
   ↓
7. PERİYODİK DEĞERLENDİRME TESTLERİ
   ↓
8. İLERLEME RAPORU & YENİ ÖNERİLER
   ↓
9. SERTİFİKA VE BAŞARI BELGESİ
```

## 🛠️ Teknik Altyapı

### **Backend (Python)**
- **analyze_results.py**: Test sonuçları analizi ve raporlama
- **create_learning_path.py**: Kişiselleştirilmiş öğrenme yolu oluşturma
- **generate_test_questions.py**: Dinamik test sorusu üretimi
- **quick_test.py**: Sistem testi ve doğrulama

### **Veri Yönetimi**
- JSON tabanlı dosya sistemi (production'da veritabanına geçilebilir)
- Yapılandırılmış müfredat ve kaynak verisi
- Kullanıcı profili, test sonuçları ve ilerleme takibi

### **Konfigürasyon Yönetimi**
- **settings.yaml**: Genel sistem ayarları
- **thresholds.yaml**: Başarı kriterleri ve eşik değerleri
- Modüler yapı sayesinde kolay özelleştirme

## 📈 Temel Özellikler

### ✅ **Akıllı Analiz**
- Öğrenci performansını çok boyutlu değerlendirme
- Zayıf konulara odaklanma ve iyileşme takibi
- Tahmini öğrenme süresi hesaplaması

### 🎮 **Gamification & Motivasyon**
- Başarı rozetleri ve puan sistemi
- Günlük/haftalık seri takibi
- Kişisel başarı grafikleri ve raporlar

### 📊 **Detaylı Raporlama**
- Performans analizleri ve trend takibi
- Kişiselleştirilmiş öğrenme önerileri
- İlerleme öngörüleri ve risk uyarıları

### ⏰ **Zaman Yönetimi**
- Gerçekçi çalışma planları
- Oturum süreleri ve molalar
- Verimlilik analizi ve optimizasyon önerileri

### 🌍 **Çok Dilli Destek**
- Türkçe arayüz ve eğitim içeriği
- Detaylı açıklamalar ve örnekler

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Python 3.8+
- JSON dosyaları için okuma/yazma izinleri

### Temel Kullanım

```bash
# Hızlı sistem testi
python scripts/quick_test.py

# Test sonuçları analizi
python scripts/analyze_results.py

# Öğrenme yolu oluşturma
python scripts/create_learning_path.py
```

## 📁 Proje Yapısı

```
devpath_ai/
├── config/                 # Yapılandırma dosyaları
│   ├── settings.yaml      # Genel ayarlar
│   └── thresholds.yaml    # Başarı eşikleri
├── data/                  # Veri dosyaları
│   ├── question_bank.json # Soru bankası
│   ├── java_curriculum.json # Müfredat
│   ├── user_test_results.json # Test sonuçları
│   ├── learning_resources.json # Öğrenme kaynakları
│   └── outputs/           # Çıktı dosyaları
├── scripts/               # Python script'leri
│   ├── analyze_results.py # Analiz motoru
│   ├── create_learning_path.py # Yol haritası
│   ├── quick_test.py      # Sistem testi
│   └── *.py               # Diğer araçlar
└── README.md             # Bu dosya
```

## 🎯 Kullanım Senaryoları

### **Yeni Öğrenci İçin**
1. Başlangıç seviyesini belirlemek için test çözme
2. Zayıf yönlerin tespit edilmesi
3. Kişiselleştirilmiş çalışma planı alma
4. Haftalık hedefler ve öneriler

### **İlerleme Takibi İçin**
1. Düzenli test çözme ve performans analizi
2. İlerleme grafikleri ve raporları
3. Zorluk seviyesinin otomatik ayarlanması
4. Başarı rozetleri kazanma

### **Eğitmen İçin**
1. Öğrenci performanslarının toplu analizi
2. Özel müdahale gereken öğrencilerin tespiti
3. Müfredat iyileştirme önerileri
4. Eğitim stratejilerinin optimizasyonu

## 🔧 Özelleştirme

Sistem tamamen modüler yapıda tasarlanmıştır:

- **Yeni konular** müfredata eklenebilir
- **Başarı kriterleri** thresholds.yaml'den ayarlanabilir
- **Öğrenme algoritmaları** scripts'te genişletilebilir
- **UI/UX** React.js ile geliştirilebilir

## 📈 Gelecek Geliştirmeler

- [ ] Web arayüzü geliştirme (React.js)
- [ ] Veritabanı entegrasyonu (PostgreSQL)
- [ ] API servisleri oluşturma
- [ ] Mobil uygulama
- [ ] Çoklu dil desteği genişletme
- [ ] Makine öğrenmesi ile daha akıllı öneriler

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Proje Sahibi**: DevPath AI Team
- **E-posta**: info@devpath-ai.com
- **Web**: https://devpath-ai.com

---

**DevPath AI** - Öğrencinin hızına ve seviyesine göre şekillenen, veri odaklı akıllı öğrenme deneyimi! 🚀
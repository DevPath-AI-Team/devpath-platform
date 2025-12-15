-- KULLANICILAR (Test için örnek)
-- Şifre: 'password' (BCrypt hashlenmiş hali)
INSERT INTO users (email, password, full_name, role, language, level, score) VALUES 
('test@iste.edu.tr', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7LEdy.T5C', 'Test Öğrenci', 'USER', 'JAVASCRIPT', 'BEGINNER', 0);

-- JAVASCRIPT DERSLERİ
INSERT INTO lessons (title, description, video_url, order_index, is_active, language, level, estimated_minutes) VALUES 
('JavaScript Nedir?', 'JS tarihçesi ve kullanım alanları.', 'https://www.youtube.com/watch?v=GNb8v5-pMjE', 1, true, 'JAVASCRIPT', 'BEGINNER', 10),
('Değişkenler', 'var, let, const kullanımı.', 'https://www.youtube.com/watch?v=s2i_j3g_D8k', 2, true, 'JAVASCRIPT', 'BEGINNER', 15),
('Veri Tipleri', 'String, Number, Boolean.', 'https://www.youtube.com/watch?v=f-B-3sghs6M', 3, true, 'JAVASCRIPT', 'BEGINNER', 12),
('Fonksiyonlar', 'Fonksiyon tanımlama yöntemleri.', 'https://www.youtube.com/watch?v=uA0GkO96-VI', 4, true, 'JAVASCRIPT', 'BEGINNER', 20),
('DOM Manipülasyonu', 'HTML elementlerini seçme ve değiştirme.', 'https://www.youtube.com/watch?v=VlM1a-8Jt4k', 5, true, 'JAVASCRIPT', 'INTERMEDIATE', 25);

-- PYTHON DERSLERİ (Bunlar eksikti, o yüzden hata alıyordun!)
INSERT INTO lessons (title, description, video_url, order_index, is_active, language, level, estimated_minutes) VALUES 
('Python Kurulumu', 'Python ortamının hazırlanması.', 'https://www.youtube.com/watch?v=rfscVS0vtbw', 1, true, 'PYTHON', 'BEGINNER', 10),
('Değişkenler ve Veri Tipleri', 'Python''da temel veri yapıları.', 'https://www.youtube.com/watch?v=KHBr9-LEqWc', 2, true, 'PYTHON', 'BEGINNER', 15),
('Koşul Yapıları', 'If, Elif, Else kullanımı.', 'https://www.youtube.com/watch?v=Pqj32r-j6h0', 3, true, 'PYTHON', 'BEGINNER', 18),
('Döngüler', 'For ve While döngüleri.', 'https://www.youtube.com/watch?v=3rp724lC96E', 4, true, 'PYTHON', 'BEGINNER', 20),
('Fonksiyonlar', 'Def anahtar kelimesi ve parametreler.', 'https://www.youtube.com/watch?v=89eL5x2yvH8', 5, true, 'PYTHON', 'INTERMEDIATE', 22);

-- JAVA DERSLERİ (Bunlar da eksikti)
INSERT INTO lessons (title, description, video_url, order_index, is_active, language, level, estimated_minutes) VALUES 
('Java Giriş', 'JVM, JRE ve JDK nedir?', 'https://www.youtube.com/watch?v=eIrMbAQSU34', 1, true, 'JAVA', 'BEGINNER', 12),
('Değişkenler', 'Primitive tipler ve String.', 'https://www.youtube.com/watch?v=VariablesLink', 2, true, 'JAVA', 'BEGINNER', 15),
('Kontrol Yapıları', 'If-Else ve Switch Case.', 'https://www.youtube.com/watch?v=ControlLink', 3, true, 'JAVA', 'BEGINNER', 18),
('OOP Giriş', 'Sınıflar ve Nesneler.', 'https://www.youtube.com/watch?v=OOPLink', 4, true, 'JAVA', 'INTERMEDIATE', 25),
('Kalıtım (Inheritance)', 'Extends ve Implements.', 'https://www.youtube.com/watch?v=InheritanceLink', 5, true, 'JAVA', 'INTERMEDIATE', 20);
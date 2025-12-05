package com.devpath.backend.service;

import com.devpath.backend.entity.UserProgress;

import java.util.List;

// İş mantığı arayüzü: kim hangi derste, yüzde kaçta?
public interface UserProgressService {

    // Kullanıcı dersi ilk kez açtığında çağır
    UserProgress startLesson(Long userId, Long lessonId);

    // Yüzdelik ilerlemeyi güncelle
    UserProgress updateProgress(Long userId, Long lessonId, int percentage);

    // Dersi direkt tamamlanmış işaretle
    UserProgress completeLesson(Long userId, Long lessonId);

    // Bir kullanıcının tüm ilerlemeleri
    List<UserProgress> getUserProgress(Long userId);
}

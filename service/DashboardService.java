package com.devpath.backend.service;

import com.devpath.backend.DTO.Dashboard; // Doğru DTO import'u

// Gerekli değil: import com.devpath.backend.DTO.DashboardDTO; // Bu import kaldırılmalıdır.

public interface DashboardService {
    
    /**
     * Kullanıcı ID'sine göre filtrelenmiş yol haritasını ve genel dashboard verisini döndürür.
     * @param userId Kullanıcının ID'si
     * @return Dashboard DTO'su
     */
    Dashboard getDashboardData(Long userId);
}
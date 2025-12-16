package com.devpath.backend.Controller;

import com.devpath.backend.DTO.Dashboard; // ✅ Düzeltildi: Dashboard DTO'su kullanılacak
import com.devpath.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Frontend erişimine izin ver
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/{userId}")
    // DÖNÜŞ TİPİ DÜZELTİLDİ: DashboardDTO yerine Dashboard kullanıldı.
    public ResponseEntity<Dashboard> getUserDashboard(@PathVariable("userId") Long userId) { 
        try {
            // Service çağrısı da artık Dashboard döndürüyor.
            Dashboard dashboardData = dashboardService.getDashboardData(userId);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            System.err.println("Dashboard Hatası: " + e.getMessage());
            // Güvenlik ve Hata Yönetimi: Detayları logla, kullanıcıya genel hata dön.
            return ResponseEntity.internalServerError().build();
        }
    }
}
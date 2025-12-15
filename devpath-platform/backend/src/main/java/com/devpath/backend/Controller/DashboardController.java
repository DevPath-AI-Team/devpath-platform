package com.devpath.backend.Controller;

import com.devpath.backend.DTO.DashboardDTO;
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
    public ResponseEntity<DashboardDTO> getUserDashboard(@PathVariable Long userId) {
        try {
            DashboardDTO dashboardData = dashboardService.getDashboardData(userId);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            // Hata olursa Frontend'e 500 hatası ve mesaj dön
            System.err.println("Dashboard Hatası: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
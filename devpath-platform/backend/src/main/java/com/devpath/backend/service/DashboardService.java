package com.devpath.backend.service;

import com.devpath.backend.DTO.DashboardDTO;

public interface DashboardService {
    DashboardDTO getDashboardData(Long userId);
}
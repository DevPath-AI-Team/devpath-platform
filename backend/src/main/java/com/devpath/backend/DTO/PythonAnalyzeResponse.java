package com.devpath.backend.DTO;

import lombok.Data;
import java.util.List;

@Data
public class PythonAnalyzeResponse {
    private Long userId;
    private String language;
    private String level;   // BEGINNER, INTERMEDIATE, ADVANCED
    private Integer score;
}

//buranın amacı analiz sonrası kullanıcın hangi videodan başlaması gerektiğini içeren bilgi
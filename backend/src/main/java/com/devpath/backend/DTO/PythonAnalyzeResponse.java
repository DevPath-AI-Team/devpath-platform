package com.devpath.backend.DTO;

import lombok.Data;
import java.util.List;

@Data
public class PythonAnalyzeResponse {
    private List<PythonLessonStatusDTO> lessons;
}

//buranın amacı analiz sonrası kullanıcın hangi videodan başlaması gerektiğini içeren bilgi
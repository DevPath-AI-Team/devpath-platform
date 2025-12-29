package com.devpath.backend.DTO;

import lombok.Data;
import java.util.List;

@Data
public class PythonAnalyzeResponse {
    private String level;
    private Double score;
    private List<String> weak_topics;
    private List<String> strong_topics;
    
    // Python snake_case gönderiyor, Java camelCase sever.
    // Ancak Service katmanı "getRecommended_start_topic" aradığı için ismi böyle bırakıyoruz:
    private Integer recommended_start_topic;
}
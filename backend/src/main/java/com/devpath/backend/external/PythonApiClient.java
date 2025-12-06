package com.devpath.backend.external;

import com.devpath.backend.DTO.PythonAnalyzeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class PythonApiClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_BASE_URL = "http://localhost:8000";

    /* Python’dan soru çek (opsiyonel)
    public String getQuestions() {
        String url = PYTHON_BASE_URL + "/questions";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }*/
    //buna grek yok sorular frontend kısmında

    // Python’a kullanıcı cevabını gönder → analiz sonucu AL
    public PythonAnalyzeResponse analyzeUserAnswer(Object request) {
        String url = PYTHON_BASE_URL + "/analyze";
        ResponseEntity<PythonAnalyzeResponse> response =
                restTemplate.postForEntity(url, request, PythonAnalyzeResponse.class);
        return response.getBody();
    }
}

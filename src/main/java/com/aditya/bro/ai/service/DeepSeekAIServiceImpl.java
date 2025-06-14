package com.aditya.bro.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DeepSeekAIServiceImpl implements DeepSeekAIService {

    private final WebClient webClient;

    @Value("${deepseek.api.key}")
    private String apiKey;

    @Value("${deepseek.api.referer}")
    private String referer;

    public DeepSeekAIServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://openrouter.ai/api/v1").build();
    }

    @Override
    public String getDeepSeekResponse(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return "Error: Prompt cannot be null or empty.";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", "deepseek/deepseek-r1-0528:free");
        body.put("messages", List.of(Map.of("role", "user", "content", prompt)));

        return webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("Referer", referer)
                .header("X-Title", "DeepSeekDemo")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    var choices = (List<Map<String, Object>>) response.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return (String) message.get("content");
                    }
                    return "No response from DeepSeek.";
                })
                .doOnError(Throwable::printStackTrace)
                .onErrorReturn("Error calling DeepSeek API.")
                .block();
    }
}

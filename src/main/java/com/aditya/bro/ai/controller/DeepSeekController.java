package com.aditya.bro.ai.controller;

import com.aditya.bro.ai.dto.PromptPayload;
import com.aditya.bro.ai.service.DeepSeekAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deepseek")
@CrossOrigin
public class DeepSeekController {

    private final DeepSeekAIService deepSeekAIService;

    public DeepSeekController(DeepSeekAIService deepSeekAIService) {
        this.deepSeekAIService = deepSeekAIService;
    }

    @PostMapping("/ask")
    public ResponseEntity<String> getAIResponse(@RequestBody PromptPayload payload) {
        System.out.println("Received prompt: " + payload.getChatPrompt());
        String result = deepSeekAIService.getDeepSeekResponse(payload.getChatPrompt());
        return ResponseEntity.ok(result);
    }
}

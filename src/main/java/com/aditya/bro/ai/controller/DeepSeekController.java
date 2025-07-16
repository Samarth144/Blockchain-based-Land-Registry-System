package com.aditya.bro.ai.controller;

import com.aditya.bro.ai.dto.PromptPayload;
import com.aditya.bro.ai.service.DeepSeekAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deepseek")
@CrossOrigin(origins = "http://localhost:8000")
public class DeepSeekController {

    private final DeepSeekAIService deepSeekAIService;

    public DeepSeekController(DeepSeekAIService deepSeekAIService) {
        this.deepSeekAIService = deepSeekAIService;
    }

    @PostMapping("/ask")
    public ResponseEntity<String> getAIResponse(@RequestBody PromptPayload payload) {
        System.out.println("Received prompt: " + payload.getChatPrompt());

        String enhancedPrompt = buildEnhancedPrompt(payload);
        String result = deepSeekAIService.getDeepSeekResponse(enhancedPrompt);
        return ResponseEntity.ok(result);
    }

    private String buildEnhancedPrompt(PromptPayload payload) {
        StringBuilder promptBuilder = new StringBuilder();

        if (payload.getDocumentType() != null) {
            promptBuilder.append("Context: This question relates to a ")
                    .append(payload.getDocumentType())
                    .append(" document.\n\n");
        }

        promptBuilder.append(payload.getChatPrompt());

        if (payload.getQuestions() != null && !payload.getQuestions().isEmpty()) {
            promptBuilder.append("\n\nPlease specifically address these points:");
            for (String question : payload.getQuestions()) {
                promptBuilder.append("\n- ").append(question);
            }
        }

        return promptBuilder.toString();
    }
}


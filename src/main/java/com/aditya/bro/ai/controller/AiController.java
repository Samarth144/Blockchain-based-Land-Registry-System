package com.aditya.bro.ai.controller;

import com.aditya.bro.ai.dto.*;
import com.aditya.bro.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/query")
    public AiResponse queryAI(@RequestBody AiQueryRequest request) {
        return aiService.handleQuery(request.getQuestion());
    }

    @PostMapping("/document/interpret")
    public AiResponse interpretDocument(@RequestBody AiDocumentRequest request) {
        return aiService.interpretDocument(request.getDocumentText());
    }
}

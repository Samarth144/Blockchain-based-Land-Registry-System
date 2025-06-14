package com.aditya.bro.ai.service;

import com.aditya.bro.ai.dto.AiResponse;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    public AiResponse handleQuery(String question) {
        // Placeholder logic, replace with real AI logic later
        return new AiResponse("AI interpretation for question: " + question);
    }

    public AiResponse interpretDocument(String documentText) {
        // Placeholder logic, replace with NLP model or LLM later
        return new AiResponse("AI summary of document: " + documentText.substring(0, Math.min(100, documentText.length())));
    }
}

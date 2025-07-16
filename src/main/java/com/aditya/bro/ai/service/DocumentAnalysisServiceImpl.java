package com.aditya.bro.ai.service;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class DocumentAnalysisServiceImpl implements DocumentAnalysisService {

    private final WebClient webClient;
    private final DeepSeekAIService deepSeekAIService;

    @Value("${deepseek.api.key}")
    private String apiKey;

    public DocumentAnalysisServiceImpl(WebClient.Builder webClientBuilder,
                                       DeepSeekAIService deepSeekAIService) {
        this.webClient = webClientBuilder.baseUrl("https://openrouter.ai/api/v1").build();
        this.deepSeekAIService = deepSeekAIService;
    }

    @Override
    public String analyzeDocument(MultipartFile file, String documentType, List<String> questions) {
        try {
            // Extract text from document (simplified - in real app you'd use Tika or similar)
            String documentContent = "Extracted text from document would go here";

            // Create prompt based on document type and questions
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("Analyze this ").append(documentType).append(" document. ");
            promptBuilder.append("Document content: ").append(documentContent).append("\n\n");

            if (questions != null && !questions.isEmpty()) {
                promptBuilder.append("Answer these specific questions:\n");
                for (String question : questions) {
                    promptBuilder.append("- ").append(question).append("\n");
                }
            } else {
                promptBuilder.append("Summarize the key points about property ownership, boundaries, ");
                promptBuilder.append("and any restrictions or easements mentioned.");
            }

            return deepSeekAIService.getDeepSeekResponse(promptBuilder.toString());
        } catch (Exception e) {
            return "Error analyzing document: " + e.getMessage();
        }
    }
}
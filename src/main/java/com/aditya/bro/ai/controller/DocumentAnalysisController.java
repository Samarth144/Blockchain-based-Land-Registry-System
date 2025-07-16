package com.aditya.bro.ai.controller;

import com.aditya.bro.ai.dto.AiDocumentRequest;
import com.aditya.bro.ai.dto.AiResponse;
import com.aditya.bro.ai.service.DocumentAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/document")
@CrossOrigin
public class DocumentAnalysisController {

    private final DocumentAnalysisService documentAnalysisService;

    public DocumentAnalysisController(DocumentAnalysisService documentAnalysisService) {
        this.documentAnalysisService = documentAnalysisService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AiResponse> analyzeDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "questions", required = false) List<String> questions) {

        String analysisResult = documentAnalysisService.analyzeDocument(file, documentType, questions);
        return ResponseEntity.ok(new AiResponse(analysisResult));
    }
}
package com.aditya.bro.document.controller;

import com.aditya.bro.document.entity.DocumentRecord;
import com.aditya.bro.document.service.DocumentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public DocumentRecord upload(@RequestBody UploadRequest request) {
        return documentService.uploadDocument(
                request.getSurveyNumber(),
                request.getDocumentName(),
                request.getUrl(),
                request.getUploadedBy()
        );
    }

    @GetMapping("/{surveyNumber}")
    public List<DocumentRecord> getDocs(@PathVariable String surveyNumber) {
        return documentService.getDocuments(surveyNumber);
    }

    @Data
    public static class UploadRequest {
        private String surveyNumber;
        private String documentName;
        private String url;
        private String uploadedBy;
    }
}

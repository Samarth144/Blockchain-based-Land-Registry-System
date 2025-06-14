package com.aditya.bro.document.service;

import com.aditya.bro.document.entity.DocumentRecord;
import com.aditya.bro.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    public DocumentRecord uploadDocument(String surveyNumber, String name, String url, String uploadedBy) {
        DocumentRecord doc = new DocumentRecord();
        doc.setSurveyNumber(surveyNumber);
        doc.setDocumentName(name);
        doc.setUrl(url);
        doc.setUploadedBy(uploadedBy);
        doc.setUploadedAt(LocalDateTime.now());
        return documentRepository.save(doc);
    }

    public List<DocumentRecord> getDocuments(String surveyNumber) {
        return documentRepository.findBySurveyNumber(surveyNumber);
    }
}

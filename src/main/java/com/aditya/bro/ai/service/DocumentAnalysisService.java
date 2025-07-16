package com.aditya.bro.ai.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface DocumentAnalysisService {
    String analyzeDocument(MultipartFile file, String documentType, List<String> questions);
}
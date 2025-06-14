package com.aditya.bro.document.repository;

import com.aditya.bro.document.entity.DocumentRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DocumentRepository extends MongoRepository<DocumentRecord, String> {
    List<DocumentRecord> findBySurveyNumber(String surveyNumber);
}

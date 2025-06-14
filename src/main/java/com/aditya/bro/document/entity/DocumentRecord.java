package com.aditya.bro.document.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "documents")
public class DocumentRecord {
    @Id
    private String id;
    private String surveyNumber;
    private String documentName;
    private String url;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}

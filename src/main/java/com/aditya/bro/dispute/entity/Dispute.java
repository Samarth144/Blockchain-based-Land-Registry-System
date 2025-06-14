package com.aditya.bro.dispute.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "disputes")
public class Dispute {
    @Id
    private String id;
    private String surveyNumber;
    private String raisedBy; // userId or wallet
    private String reason;
    private List<String> evidenceUrls; // case documents
    private boolean active;
    private LocalDateTime raisedAt;
    private LocalDateTime resolvedAt;
}

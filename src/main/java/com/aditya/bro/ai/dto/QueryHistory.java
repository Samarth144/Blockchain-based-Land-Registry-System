package com.aditya.bro.ai.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QueryHistory {
    private String id;
    private String query;
    private String response;
    private String documentReference;
    private LocalDateTime timestamp;
    private String conversationId;
}
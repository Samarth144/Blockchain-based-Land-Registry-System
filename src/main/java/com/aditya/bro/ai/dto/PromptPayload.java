package com.aditya.bro.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class PromptPayload {
    private String chatPrompt;
    private String conversationId;  // Optional
    private String documentType;
    private List<String> questions;
}

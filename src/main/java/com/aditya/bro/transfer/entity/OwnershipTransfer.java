package com.aditya.bro.transfer.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "ownership_transfers")
public class OwnershipTransfer {
    @Id
    private String id;

    private String surveyNumber;
    private String fromWallet;
    private String toWallet;
    private String status; // INITIATED, CONFIRMED, FAILED
    private String remarks;
    private LocalDateTime initiatedAt;
    private LocalDateTime confirmedAt;
}

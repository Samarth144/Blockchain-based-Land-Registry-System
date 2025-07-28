package com.aditya.bro.userback.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;

@Data
public class Transaction {
    @Id
    private String id;

    private String landId;
    private String fromUserId;
    private String toUserId;

    private LocalDateTime transactionDate;
    private String type;
    private double amount;
    private String status;
    private String notes;
}

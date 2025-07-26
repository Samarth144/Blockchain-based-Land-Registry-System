package com.aditya.bro.userback.dto;

import lombok.Data;

@Data
public class TransactionDTO {
    private String id;
    private String landId;
    private String landTitle;

    private String fromUserId;
    private String fromUserEmail;

    private String toUserId;
    private String toUserEmail;

    private String transactionDate;
    private String type;
    private double amount;
    private String status;
    private String notes;
}

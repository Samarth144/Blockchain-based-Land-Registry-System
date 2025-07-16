package com.aditya.bro.land.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "lands")
public class LandParcel {
    @Id
    private String surveyNumber;
    private String ownerWallet;
    private String location;
    private String status; // ACTIVE, DISPUTED, etc.
    private List<String> documentHashes; // IPFS hashes of documents

    @CreatedDate
    private LocalDateTime createdDate;
}
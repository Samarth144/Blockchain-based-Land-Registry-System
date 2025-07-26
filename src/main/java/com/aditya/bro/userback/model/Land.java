package com.aditya.bro.userback.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "lands")
public class Land {
    @Id
    private String id;

    @Indexed(unique = true)
    private String surveyNumber;

    private String title;
    private String description;
    private String location;
    private double area; // in acres
    private double marketValue;
    private String currentOwnerId; // User ID
    private LocalDate registrationDate;
    private String status; // AVAILABLE, DISPUTED, TRANSFER_IN_PROGRESS
    private List<String> imageUrls;
    private List<Document> documents;
    private List<Transaction> transactionHistory;
    private GeoLocation coordinates;

    @Data
    public static class GeoLocation {
        private double latitude;
        private double longitude;
    }

    @Data
    public static class Document {
        private String name;
        private String url;
        private String type;
    }
}
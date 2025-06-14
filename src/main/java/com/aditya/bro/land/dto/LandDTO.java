package com.aditya.bro.land.dto;

import lombok.Data;

import java.util.List;

@Data
public class LandDTO {
    private String surveyNumber;
    private String ownerWallet;
    private String location;
    private String status;
    private List<String> documentUrls;
}

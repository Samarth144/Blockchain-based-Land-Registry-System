package com.aditya.bro.land.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class LandDTO {
    private String surveyNumber;
    private String ownerWallet;
    private String location;
    private String status;
    private List<String> documentHashes;
    private MultipartFile document;
}
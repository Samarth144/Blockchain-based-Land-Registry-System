package com.aditya.bro.publicsearch.service;

import com.aditya.bro.land.entity.LandParcel;
import com.aditya.bro.land.repository.LandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PublicSearchService {

    private final LandRepository landRepository;

    public Optional<LandParcel> searchBySurveyNumber(String surveyNumber) {
        return landRepository.findById(surveyNumber);
    }

    public List<LandParcel> searchByLocation(String location) {
        return landRepository.findByLocation(location);
    }

    public List<LandParcel> searchByOwnerWallet(String ownerWallet) {
        return landRepository.findByOwnerWallet(ownerWallet);
    }
}

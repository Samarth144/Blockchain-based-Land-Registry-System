package com.aditya.bro.land.service;

import com.aditya.bro.land.entity.LandParcel;
import com.aditya.bro.land.repository.LandRepository;
import com.aditya.bro.land.history.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LandService {

    private final LandRepository landRepository;
    private final HistoryService historyService;

    public LandParcel registerLand(LandParcel land) {
        return landRepository.save(land);
    }

    public Optional<LandParcel> getLand(String surveyNumber) {
        return landRepository.findById(surveyNumber);
    }

    public List<LandParcel> listLands(String owner, String location, String status) {
        if (owner != null) return landRepository.findByOwnerWallet(owner);
        if (location != null) return landRepository.findByLocation(location);
        if (status != null) return landRepository.findByStatus(status);
        return landRepository.findAll();
    }

    public LandParcel addDocument(String surveyNumber, String documentHash) {
        LandParcel land = landRepository.findById(surveyNumber)
                .orElseThrow(() -> new RuntimeException("Land not found"));
        land.getDocumentHashes().add(documentHash);
        return landRepository.save(land);
    }

    public List<String> getHistory(String surveyNumber) {
        return historyService.getHistoryForLand(surveyNumber);
    }
}
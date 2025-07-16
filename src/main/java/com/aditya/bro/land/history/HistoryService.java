package com.aditya.bro.land.history;

import com.aditya.bro.land.entity.LandParcel;
import com.aditya.bro.land.repository.LandRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class HistoryService {

    private final LandRepository landRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public HistoryService(LandRepository landRepository) {
        this.landRepository = landRepository;
    }

    public List<String> getHistoryForLand(String surveyNumber) {
        List<String> history = new ArrayList<>();
        landRepository.findById(surveyNumber).ifPresent(land -> {
            history.add(String.format("Land parcel created on %s",
                    land.getCreatedDate().format(formatter)));
            history.add(String.format("Owned by %s", land.getOwnerWallet()));
            // Add more history items as needed
        });
        return history;
    }
}
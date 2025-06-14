package com.aditya.bro.land.history;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoryService {

    public List<String> getHistoryForLand(String surveyNumber) {
        // Placeholder: Replace with real logic or DB calls
        return List.of(
                "Ownership registered in 2020",
                "Ownership transferred in 2022",
                "Marked disputed in 2023"
        );
    }
}

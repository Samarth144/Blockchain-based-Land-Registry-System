package com.aditya.bro.publicsearch.controller;

import com.aditya.bro.land.entity.LandParcel;
import com.aditya.bro.publicsearch.service.PublicSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/public/search")
@RequiredArgsConstructor
public class PublicSearchController {

    private final PublicSearchService publicSearchService;

    @GetMapping
    public Object searchLand(
            @RequestParam(required = false) String surveyNumber,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String ownerWallet
    ) {
        if (surveyNumber != null) {
            Optional<LandParcel> land = publicSearchService.searchBySurveyNumber(surveyNumber);
            return land.orElse(null);
        } else if (location != null) {
            return publicSearchService.searchByLocation(location);
        } else if (ownerWallet != null) {
            return publicSearchService.searchByOwnerWallet(ownerWallet);
        } else {
            return "Provide at least one query param: surveyNumber, location, or ownerWallet";
        }
    }
}

package com.aditya.bro.land.controller;

import com.aditya.bro.land.entity.LandParcel;
import com.aditya.bro.land.service.LandService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/land")
@RequiredArgsConstructor
public class LandController {

    private final LandService landService;

    @PostMapping("/register")
    public LandParcel registerLand(@RequestBody LandParcel land) {
        return landService.registerLand(land);
    }

    @GetMapping("/{surveyNumber}")
    public LandParcel getLand(@PathVariable String surveyNumber) {
        return landService.getLand(surveyNumber).orElse(null);
    }

    @GetMapping
    public List<LandParcel> listLands(
            @RequestParam(required = false) String owner,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status
    ) {
        return landService.listLands(owner, location, status);
    }

    @PutMapping("/{surveyNumber}/documents")
    public LandParcel updateDocuments(
            @PathVariable String surveyNumber,
            @RequestBody List<String> documentUrls
    ) {
        return landService.updateDocuments(surveyNumber, documentUrls);
    }

    @GetMapping("/{surveyNumber}/history")
    public List<String> getHistory(@PathVariable String surveyNumber) {
        return landService.getHistory(surveyNumber);
    }
}

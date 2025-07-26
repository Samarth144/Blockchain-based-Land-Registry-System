package com.aditya.bro.userback.controller;

import com.aditya.bro.userback.dto.LandDTO;
import com.aditya.bro.userback.service.LandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lands")
@RequiredArgsConstructor
public class LandController {
    private final LandService landService;

    @GetMapping
    public ResponseEntity<List<LandDTO>> getAllLands() {
        return ResponseEntity.ok(landService.getAllLands());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LandDTO> getLandById(@PathVariable String id) {
        return ResponseEntity.ok(landService.getLandById(id));
    }

    @GetMapping("/survey/{surveyNumber}")
    public ResponseEntity<LandDTO> getLandBySurveyNumber(@PathVariable String surveyNumber) {
        return ResponseEntity.ok(landService.getLandBySurveyNumber(surveyNumber));
    }

    @GetMapping("/search")
    public ResponseEntity<List<LandDTO>> searchLands(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String surveyNumber) {
        return ResponseEntity.ok(landService.searchLands(location, surveyNumber));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<LandDTO>> getLandsByOwner(@PathVariable String ownerId) {
        return ResponseEntity.ok(landService.getLandsByOwner(ownerId));
    }

    @PostMapping
    public ResponseEntity<LandDTO> createLand(@RequestBody LandDTO landDTO) {
        return ResponseEntity.ok(landService.createLand(landDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LandDTO> updateLand(@PathVariable String id, @RequestBody LandDTO landDTO) {
        return ResponseEntity.ok(landService.updateLand(id, landDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLand(@PathVariable String id) {
        landService.deleteLand(id);
        return ResponseEntity.noContent().build();
    }
}
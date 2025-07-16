package com.aditya.bro.land.controller;

import com.aditya.bro.land.entity.LandParcel;
import com.aditya.bro.land.service.LandService;
import com.aditya.bro.land.service.IPFSService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/land")
@RequiredArgsConstructor
public class LandController {

    private final LandService landService;
    private final IPFSService ipfsService;

    @PostMapping("/register")
    public LandParcel registerLand(@RequestBody LandParcel land) {
        return landService.registerLand(land);
    }

    @GetMapping("/{surveyNumber}")
    public ResponseEntity<LandParcel> getLand(@PathVariable String surveyNumber) {
        return landService.getLand(surveyNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<LandParcel> listLands(
            @RequestParam(required = false) String owner,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status
    ) {
        return landService.listLands(owner, location, status);
    }

    @PostMapping("/{surveyNumber}/documents")
    public LandParcel uploadDocument(
            @PathVariable String surveyNumber,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        String hash = ipfsService.saveFile(file);
        return landService.addDocument(surveyNumber, hash);
    }

    @GetMapping("/{surveyNumber}/documents/{hash}")
    public ResponseEntity<byte[]> getDocument(
            @PathVariable String surveyNumber,
            @PathVariable String hash
    ) throws IOException {
        byte[] document = ipfsService.getFile(hash);
        return ResponseEntity.ok()
                .header("Content-Type", "application/octet-stream")
                .body(document);
    }

    @GetMapping("/{surveyNumber}/history")
    public List<String> getHistory(@PathVariable String surveyNumber) {
        return landService.getHistory(surveyNumber);
    }
}
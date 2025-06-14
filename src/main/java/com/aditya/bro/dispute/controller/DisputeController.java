package com.aditya.bro.dispute.controller;

import com.aditya.bro.dispute.entity.Dispute;
import com.aditya.bro.dispute.service.DisputeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping("/flag")
    public Dispute flagDispute(@RequestBody FlagRequest request) {
        return disputeService.flagDispute(
                request.getSurveyNumber(),
                request.getReason(),
                request.getRaisedBy(),
                request.getEvidenceUrls()
        );
    }

    @PostMapping("/unflag")
    public Dispute unflagDispute(@RequestParam String surveyNumber) {
        return disputeService.unflagDispute(surveyNumber);
    }

    @GetMapping("/{surveyNumber}")
    public Dispute getDispute(@PathVariable String surveyNumber) {
        return disputeService.getDispute(surveyNumber);
    }

    @Data
    public static class FlagRequest {
        private String surveyNumber;
        private String reason;
        private String raisedBy;
        private List<String> evidenceUrls;
    }
}

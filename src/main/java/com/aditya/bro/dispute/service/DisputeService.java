package com.aditya.bro.dispute.service;

import com.aditya.bro.dispute.entity.Dispute;
import com.aditya.bro.dispute.repository.DisputeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;

    public Dispute flagDispute(String surveyNumber, String reason, String raisedBy, List<String> evidenceUrls) {
        Dispute dispute = new Dispute();
        dispute.setSurveyNumber(surveyNumber);
        dispute.setRaisedBy(raisedBy);
        dispute.setReason(reason);
        dispute.setEvidenceUrls(evidenceUrls);
        dispute.setActive(true);
        dispute.setRaisedAt(LocalDateTime.now());
        return disputeRepository.save(dispute);
    }

    public Dispute unflagDispute(String surveyNumber) {
        Dispute dispute = disputeRepository.findBySurveyNumberAndActiveTrue(surveyNumber)
                .orElseThrow(() -> new RuntimeException("Active dispute not found"));

        dispute.setActive(false);
        dispute.setResolvedAt(LocalDateTime.now());
        return disputeRepository.save(dispute);
    }

    public Dispute getDispute(String surveyNumber) {
        return disputeRepository.findBySurveyNumberAndActiveTrue(surveyNumber)
                .orElse(null);
    }
}

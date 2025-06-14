package com.aditya.bro.transfer.service;

import com.aditya.bro.land.entity.LandParcel;
import com.aditya.bro.land.repository.LandRepository;
import com.aditya.bro.transfer.dto.TransferRequest;
import com.aditya.bro.transfer.entity.OwnershipTransfer;
import com.aditya.bro.transfer.repository.OwnershipTransferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OwnershipTransferService {

    private final OwnershipTransferRepository transferRepository;
    private final LandRepository landRepository;

    public OwnershipTransfer initiateTransfer(String surveyNumber, TransferRequest request) {
        LandParcel land = landRepository.findById(surveyNumber)
                .orElseThrow(() -> new RuntimeException("Land not found"));

        if (!land.getOwnerWallet().equalsIgnoreCase(request.getFromWallet())) {
            throw new RuntimeException("Only current owner can initiate transfer");
        }

        OwnershipTransfer transfer = new OwnershipTransfer();
        transfer.setSurveyNumber(surveyNumber);
        transfer.setFromWallet(request.getFromWallet());
        transfer.setToWallet(request.getToWallet());
        transfer.setRemarks(request.getRemarks());
        transfer.setStatus("INITIATED");
        transfer.setInitiatedAt(LocalDateTime.now());

        return transferRepository.save(transfer);
    }

    public OwnershipTransfer confirmTransfer(String surveyNumber, TransferRequest request) {
        OwnershipTransfer transfer = transferRepository
                .findTopBySurveyNumberOrderByInitiatedAtDesc(surveyNumber)
                .orElseThrow(() -> new RuntimeException("No transfer found"));

        if (!transfer.getStatus().equals("INITIATED")) {
            throw new RuntimeException("Transfer is not in INITIATED state");
        }

        if (!transfer.getFromWallet().equalsIgnoreCase(request.getFromWallet())) {
            throw new RuntimeException("Only original owner can confirm");
        }

        LandParcel land = landRepository.findById(surveyNumber)
                .orElseThrow(() -> new RuntimeException("Land not found"));

        land.setOwnerWallet(transfer.getToWallet());
        landRepository.save(land);

        transfer.setStatus("CONFIRMED");
        transfer.setConfirmedAt(LocalDateTime.now());

        return transferRepository.save(transfer);
    }

    public OwnershipTransfer getTransferStatus(String surveyNumber) {
        return transferRepository
                .findTopBySurveyNumberOrderByInitiatedAtDesc(surveyNumber)
                .orElseThrow(() -> new RuntimeException("No transfer found"));
    }
}

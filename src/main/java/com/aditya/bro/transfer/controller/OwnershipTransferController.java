package com.aditya.bro.transfer.controller;

import com.aditya.bro.transfer.dto.TransferRequest;
import com.aditya.bro.transfer.entity.OwnershipTransfer;
import com.aditya.bro.transfer.service.OwnershipTransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/land/{surveyNumber}/transfer")
@RequiredArgsConstructor
public class OwnershipTransferController {

    private final OwnershipTransferService transferService;

    @PostMapping("/initiate")
    public OwnershipTransfer initiateTransfer(
            @PathVariable String surveyNumber,
            @Valid @RequestBody TransferRequest request
    ) {
        return transferService.initiateTransfer(surveyNumber, request);
    }

    @PostMapping("/confirm")
    public OwnershipTransfer confirmTransfer(
            @PathVariable String surveyNumber,
            @Valid @RequestBody TransferRequest request
    ) {
        return transferService.confirmTransfer(surveyNumber, request);
    }

    @GetMapping("/status")
    public OwnershipTransfer getTransferStatus(@PathVariable String surveyNumber) {
        return transferService.getTransferStatus(surveyNumber);
    }
}

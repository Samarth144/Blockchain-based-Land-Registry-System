package com.aditya.bro.transfer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TransferRequest {

    @NotBlank(message = "From wallet address is required")
    private String fromWallet;

    @NotBlank(message = "To wallet address is required")
    private String toWallet;

    private String remarks;
}

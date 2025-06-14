package com.aditya.bro.auth.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String walletAddress;
    private String password;
}
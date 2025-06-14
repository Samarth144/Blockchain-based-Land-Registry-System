package com.aditya.bro.auth.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String walletAddress;
    private String username;
    private String password;
    private String role;
}

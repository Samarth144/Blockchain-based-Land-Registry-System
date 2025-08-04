package com.aditya.bro.userback.controller;

import com.aditya.bro.userback.dto.TransactionDTO;
import com.aditya.bro.userback.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionDTO> initiateTransfer(@RequestBody TransactionDTO transactionDTO) {
        return ResponseEntity.ok(transactionService.initiateTransfer(transactionDTO));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUser(userId));
    }

    @GetMapping("/land/{landId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByLand(@PathVariable String landId) {
        return ResponseEntity.ok(transactionService.getTransactionsByLand(landId));
    }

    @PutMapping("/{landId}/{transactionId}")
    public ResponseEntity<TransactionDTO> updateTransactionStatus(
            @PathVariable String landId,
            @PathVariable String transactionId,
            @RequestParam String status) {
        return ResponseEntity.ok(transactionService.updateTransactionStatus(landId, transactionId, status));
    }
}


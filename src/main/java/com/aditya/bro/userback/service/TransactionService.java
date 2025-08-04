package com.aditya.bro.userback.service;

import com.aditya.bro.userback.dto.TransactionDTO;
import com.aditya.bro.userback.exception.ResourceNotFoundException;
import com.aditya.bro.userback.model.Land;
import com.aditya.bro.userback.model.Transaction;
import com.aditya.bro.userback.model.User;
import com.aditya.bro.userback.repository.LandRepository;
import com.aditya.bro.userback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final LandRepository landRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public TransactionDTO initiateTransfer(TransactionDTO transactionDTO) {
        // Validate land exists
        Land land = landRepository.findById(transactionDTO.getLandId())
                .orElseThrow(() -> new ResourceNotFoundException("Land not found with id: " + transactionDTO.getLandId()));

        // Validate from user exists
        User fromUser = userRepository.findById(transactionDTO.getFromUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + transactionDTO.getFromUserId()));

        // Validate to user exists
        User toUser = userRepository.findByEmail(transactionDTO.getToUserEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + transactionDTO.getToUserEmail()));

        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setId(generateTransactionId());
        transaction.setLandId(land.getId());
        transaction.setFromUserId(fromUser.getId());
        transaction.setToUserId(toUser.getId());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setType(transactionDTO.getType());
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setStatus("PENDING");
        transaction.setNotes(transactionDTO.getNotes());

        // Add transaction to land's history
        land.getTransactionHistory().add(transaction);
        landRepository.save(land);

        return convertToDto(transaction, land, fromUser, toUser);
    }

    public List<TransactionDTO> getTransactionsByUser(String userId) {
        // Get all lands where user is involved
        List<Land> relevantLands = landRepository.findLandsByUserInvolvement(userId);

        return relevantLands.stream()
                .flatMap(land -> land.getTransactionHistory().stream()
                        .filter(t -> userId.equals(t.getFromUserId()) || userId.equals(t.getToUserId())))
                .map(t -> {
                    User fromUser = t.getFromUserId() != null ?
                            userRepository.findById(t.getFromUserId()).orElse(null) : null;
                    User toUser = t.getToUserId() != null ?
                            userRepository.findById(t.getToUserId()).orElse(null) : null;
                    return convertToDto(t, landRepository.findById(t.getLandId()).orElse(null), fromUser, toUser);
                })
                .collect(Collectors.toList());
    }

    public List<TransactionDTO> getTransactionsByLand(String landId) {
        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new ResourceNotFoundException("Land not found with id: " + landId));

        return land.getTransactionHistory().stream()
                .map(t -> {
                    User fromUser = t.getFromUserId() != null ?
                            userRepository.findById(t.getFromUserId()).orElse(null) : null;
                    User toUser = t.getToUserId() != null ?
                            userRepository.findById(t.getToUserId()).orElse(null) : null;
                    return convertToDto(t, land, fromUser, toUser);
                })
                .collect(Collectors.toList());
    }

    public TransactionDTO updateTransactionStatus(String landId, String transactionId, String status) {
        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new ResourceNotFoundException("Land not found with id: " + landId));

        Transaction transaction = land.getTransactionHistory().stream()
                .filter(t -> transactionId.equals(t.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found in land with id: " + transactionId));

        transaction.setStatus(status);

        // If transaction is completed, transfer ownership
        if ("COMPLETED".equals(status)) {
            land.setCurrentOwnerId(transaction.getToUserId());

            // Update user's owned lands
            if (transaction.getFromUserId() != null) {
                userRepository.findById(transaction.getFromUserId()).ifPresent(fromUser -> {
                    fromUser.getOwnedLands().removeIf(landId::equals);
                    userRepository.save(fromUser);
                });
            }

            if (transaction.getToUserId() != null) {
                userRepository.findById(transaction.getToUserId()).ifPresent(toUser -> {
                    if (!toUser.getOwnedLands().contains(landId)) {
                        toUser.getOwnedLands().add(landId);
                        userRepository.save(toUser);
                    }
                });
            }
        }

        landRepository.save(land);

        return convertToDto(
                transaction,
                land,
                transaction.getFromUserId() != null ?
                        userRepository.findById(transaction.getFromUserId()).orElse(null) : null,
                transaction.getToUserId() != null ?
                        userRepository.findById(transaction.getToUserId()).orElse(null) : null
        );
    }

    private TransactionDTO convertToDto(Transaction transaction, Land land, User fromUser, User toUser) {
        TransactionDTO dto = modelMapper.map(transaction, TransactionDTO.class);
        if (transaction.getTransactionDate() != null) {
            dto.setTransactionDate(transaction.getTransactionDate().toString());
        }

        if (land != null) {
            dto.setLandId(land.getId());
            dto.setLandTitle(land.getTitle());
        }

        if (fromUser != null) {
            dto.setFromUserId(fromUser.getId());
            dto.setFromUserEmail(fromUser.getEmail());
        }

        if (toUser != null) {
            dto.setToUserId(toUser.getId());
            dto.setToUserEmail(toUser.getEmail());
        }

        return dto;
    }

    private String generateTransactionId() {
        return "TXN-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }
}
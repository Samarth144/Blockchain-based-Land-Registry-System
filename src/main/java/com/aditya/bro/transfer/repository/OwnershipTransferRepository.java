package com.aditya.bro.transfer.repository;

import com.aditya.bro.transfer.entity.OwnershipTransfer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OwnershipTransferRepository extends MongoRepository<OwnershipTransfer, String> {
    Optional<OwnershipTransfer> findTopBySurveyNumberOrderByInitiatedAtDesc(String surveyNumber);
}

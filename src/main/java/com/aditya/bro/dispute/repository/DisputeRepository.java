package com.aditya.bro.dispute.repository;

import com.aditya.bro.dispute.entity.Dispute;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DisputeRepository extends MongoRepository<Dispute, String> {
    Optional<Dispute> findBySurveyNumberAndActiveTrue(String surveyNumber);
}

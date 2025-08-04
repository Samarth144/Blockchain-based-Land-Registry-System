package com.aditya.bro.userback.repository;

import com.aditya.bro.userback.model.Land;
import com.aditya.bro.userback.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import java.util.List;
import java.util.Optional;

public interface LandRepository extends MongoRepository<Land, String> {

    // Basic land queries
    List<Land> findByCurrentOwnerId(String ownerId);
    Optional<Land> findBySurveyNumber(String surveyNumber);

    // Search functionality
    List<Land> findByLocationContainingIgnoreCase(String location);
    List<Land> findBySurveyNumberContainingIgnoreCase(String surveyNumber);
    List<Land> findByLocationContainingIgnoreCaseAndSurveyNumberContainingIgnoreCase(String location, String surveyNumber);

    // Status-based queries
    List<Land> findByStatus(String status);

    // Transaction-related queries
    @Query("{ $or: [ " +
            "{ 'currentOwnerId': ?0 }, " +
            "{ 'transactionHistory.fromUserId': ?0 }, " +
            "{ 'transactionHistory.toUserId': ?0 } " +
            "] }")
    List<Land> findLandsByUserInvolvement(String userId);

    @Query("{ '_id': ?0 }")
    @Update("{ $push: { 'transactionHistory': ?1 } }")
    void addTransaction(String landId, Transaction transaction);

    @Query("{ '_id': ?0, 'transactionHistory._id': ?1 }")
    @Update("{ $set: { 'transactionHistory.$.status': ?2 } }")
    void updateTransactionStatus(String landId, String transactionId, String status);
}
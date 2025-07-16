package com.aditya.bro.land.repository;

import com.aditya.bro.land.entity.LandParcel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LandRepository extends MongoRepository<LandParcel, String> {
    List<LandParcel> findByOwnerWallet(String ownerWallet);
    List<LandParcel> findByLocation(String location);
    List<LandParcel> findByStatus(String status);
}
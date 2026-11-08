package com.autodeal.repository;

import com.autodeal.model.Campaign;
import com.autodeal.model.CampaignStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends MongoRepository<Campaign, String> {
    List<Campaign> findByStatus(CampaignStatus status);
    List<Campaign> findByCityIgnoreCase(String city);
    List<Campaign> findByBrandIgnoreCase(String brand);
    List<Campaign> findByParticipantIdsContaining(String userId);
    List<Campaign> findByCreatorId(String creatorId);

    @Query("{ $and: [ "
            + "?#{ [0] == null ? { $expr: { $eq: [1, 1] } } : { 'brand': { $regex: [0], $options: 'i' } } }, "
            + "?#{ [1] == null ? { $expr: { $eq: [1, 1] } } : { 'model': { $regex: [1], $options: 'i' } } }, "
            + "?#{ [2] == null ? { $expr: { $eq: [1, 1] } } : { 'city': { $regex: [2], $options: 'i' } } }, "
            + "?#{ [3] == null ? { $expr: { $eq: [1, 1] } } : { 'status': [3] } } "
            + "] }")
    List<Campaign> searchCampaigns(String brand, String model, String city, CampaignStatus status);
}

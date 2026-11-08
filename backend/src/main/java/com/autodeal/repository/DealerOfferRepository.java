package com.autodeal.repository;

import com.autodeal.model.DealerOffer;
import com.autodeal.model.OfferStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DealerOfferRepository extends MongoRepository<DealerOffer, String> {
    List<DealerOffer> findByCampaignId(String campaignId);
    List<DealerOffer> findByCampaignIdAndStatus(String campaignId, OfferStatus status);
    List<DealerOffer> findByDealerId(String dealerId);
    long countByCampaignIdAndStatus(String campaignId, OfferStatus status);
}

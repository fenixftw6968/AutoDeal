package com.autodeal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "dealer_offers")
@CompoundIndex(name = "campaign_dealer_idx", def = "{'campaignId': 1, 'dealerId': 1}")
public class DealerOffer {
    @Id
    private String id;

    @Indexed
    private String campaignId;

    @Indexed
    private String dealerId;

    private String dealershipName;
    private String dealershipCity;
    private boolean verifiedDealer;

    private String carVariant;
    private double exShowroomPrice;
    private double groupDiscountAmount;
    private double estimatedOnRoadPrice;

    @Builder.Default
    private List<String> inclusions = new ArrayList<>();

    @Builder.Default
    private List<String> exclusions = new ArrayList<>();

    private LocalDate validityPeriod;
    private String termsAndConditions;
    private int minimumCommitmentUnits;

    @Builder.Default
    private OfferStatus status = OfferStatus.ACTIVE;

    private boolean isDemoData;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

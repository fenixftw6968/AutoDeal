package com.autodeal.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

public class DealerOfferDto {

    @Data
    public static class CreateOfferRequest {
        @NotBlank(message = "Campaign ID is required")
        private String campaignId;

        @NotBlank(message = "Car variant is required")
        private String carVariant;

        @Min(value = 1, message = "Ex-showroom price must be positive")
        private double exShowroomPrice;

        @Min(value = 0, message = "Discount amount cannot be negative")
        private double groupDiscountAmount;

        @Min(value = 1, message = "Estimated on-road price must be positive")
        private double estimatedOnRoadPrice;

        private List<String> inclusions;
        private List<String> exclusions;

        @NotNull(message = "Validity period is required")
        @Future(message = "Validity must be in the future")
        private LocalDate validityPeriod;

        private String termsAndConditions;

        @Min(value = 1, message = "Minimum commitment units must be at least 1")
        private int minimumCommitmentUnits;
    }

    @Data
    public static class OfferComparisonDto {
        private String offerId;
        private String dealershipName;
        private String dealershipCity;
        private boolean verifiedDealer;
        private String carVariant;
        private double exShowroomPrice;
        private double groupDiscountAmount;
        private double estimatedOnRoadPrice;
        private List<String> inclusions;
        private List<String> exclusions;
        private LocalDate validityPeriod;
        private String termsAndConditions;
        private int minimumCommitmentUnits;
        private boolean isDemoData;
    }
}

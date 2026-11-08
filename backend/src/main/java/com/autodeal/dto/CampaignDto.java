package com.autodeal.dto;

import com.autodeal.model.CampaignStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

public class CampaignDto {

    @Data
    public static class CreateCampaignRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Brand is required")
        private String brand;

        @NotBlank(message = "Model is required")
        private String model;

        @NotBlank(message = "Variant is required")
        private String variant;

        @NotBlank(message = "City is required")
        private String city;

        private String state;

        @Min(value = 2, message = "Target buyers must be at least 2")
        private int targetBuyers;

        @NotNull(message = "Deadline is required")
        @Future(message = "Deadline must be a future date")
        private LocalDate deadline;

        private String carImageUrl;
        private Double estimatedMSRP;
        private String description;
        private String preferredColor;
    }

    @Data
    public static class JoinCampaignRequest {
        private String preferredColor;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private CampaignStatus status;
    }

    @Data
    public static class CampaignSummaryDto {
        private String id;
        private String title;
        private String brand;
        private String model;
        private String variant;
        private String city;
        private String state;
        private int targetBuyers;
        private int currentBuyers;
        private LocalDate deadline;
        private CampaignStatus status;
        private String carImageUrl;
        private Double estimatedMSRP;
        private long activeOffersCount;
        private double progressPercentage;
    }
}

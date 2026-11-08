package com.autodeal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "campaigns")
@CompoundIndexes({
    @CompoundIndex(name = "status_city_idx", def = "{'status': 1, 'city': 1}"),
    @CompoundIndex(name = "brand_model_idx", def = "{'brand': 1, 'model': 1}")
})
public class Campaign {
    @Id
    private String id;

    private String title;

    @Indexed
    private String brand;

    @Indexed
    private String model;

    private String variant;

    @Indexed
    private String city;

    private String state;

    private int targetBuyers;

    @Builder.Default
    private int currentBuyers = 0;

    private LocalDate deadline;

    @Indexed
    @Builder.Default
    private CampaignStatus status = CampaignStatus.OPEN;

    private String creatorId;
    private String creatorName;

    private String carImageUrl;
    private Double estimatedMSRP;
    private String description;

    @Builder.Default
    private Set<String> participantIds = new HashSet<>();

    @Builder.Default
    private List<ParticipantInfo> participants = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private String userId;
        private String fullName;
        private String preferredColor;
        private Instant joinedAt;
    }
}

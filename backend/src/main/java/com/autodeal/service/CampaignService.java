package com.autodeal.service;

import com.autodeal.dto.CampaignDto;
import com.autodeal.dto.ChatDto;
import com.autodeal.model.Campaign;
import com.autodeal.model.CampaignStatus;
import com.autodeal.model.User;
import com.autodeal.repository.CampaignRepository;
import com.autodeal.repository.DealerOfferRepository;
import com.autodeal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CampaignService {

    private static final Logger log = LoggerFactory.getLogger(CampaignService.class);

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final DealerOfferRepository dealerOfferRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public CampaignService(CampaignRepository campaignRepository,
                           UserRepository userRepository,
                           DealerOfferRepository dealerOfferRepository,
                           SimpMessagingTemplate messagingTemplate) {
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.dealerOfferRepository = dealerOfferRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Campaign> getAllCampaigns(String brand, String model, String city, CampaignStatus status) {
        if (brand != null || model != null || city != null || status != null) {
            return campaignRepository.searchCampaigns(brand, model, city, status);
        }
        return campaignRepository.findAll();
    }

    public List<Campaign> getFeaturedCampaigns() {
        return campaignRepository.findAll().stream()
                .filter(c -> c.getStatus() == CampaignStatus.OPEN || c.getStatus() == CampaignStatus.TARGET_REACHED)
                .limit(6)
                .collect(Collectors.toList());
    }

    public Campaign getCampaignById(String id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with ID: " + id));
    }

    @CacheEvict(value = {"featuredCampaigns", "campaignSummary"}, allEntries = true)
    public Campaign createCampaign(String creatorId, CampaignDto.CreateCampaignRequest request) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Campaign campaign = Campaign.builder()
                .title(request.getTitle())
                .brand(request.getBrand())
                .model(request.getModel())
                .variant(request.getVariant())
                .city(request.getCity())
                .state(request.getState())
                .targetBuyers(request.getTargetBuyers())
                .currentBuyers(1) // Creator joins automatically
                .deadline(request.getDeadline())
                .status(CampaignStatus.OPEN)
                .creatorId(creatorId)
                .creatorName(creator.getFullName())
                .carImageUrl(request.getCarImageUrl())
                .estimatedMSRP(request.getEstimatedMSRP())
                .description(request.getDescription())
                .build();

        campaign.getParticipantIds().add(creatorId);
        campaign.getParticipants().add(Campaign.ParticipantInfo.builder()
                .userId(creatorId)
                .fullName(creator.getFullName())
                .preferredColor(request.getPreferredColor() != null ? request.getPreferredColor() : "Any")
                .joinedAt(Instant.now())
                .build());

        Campaign saved = campaignRepository.save(campaign);
        log.info("Campaign created: {} by user {}", saved.getId(), creator.getEmail());
        return saved;
    }

    @CacheEvict(value = {"featuredCampaigns", "campaignSummary"}, allEntries = true)
    public Campaign joinCampaign(String campaignId, String userId, CampaignDto.JoinCampaignRequest request) {
        Campaign campaign = getCampaignById(campaignId);

        if (campaign.getStatus() == CampaignStatus.COMPLETED || campaign.getStatus() == CampaignStatus.EXPIRED) {
            throw new IllegalStateException("Cannot join a completed or expired campaign");
        }

        if (campaign.getDeadline() != null && campaign.getDeadline().isBefore(LocalDate.now())) {
            campaign.setStatus(CampaignStatus.EXPIRED);
            campaignRepository.save(campaign);
            throw new IllegalStateException("Campaign has expired");
        }

        if (campaign.getParticipantIds().contains(userId)) {
            throw new IllegalArgumentException("User is already a member of this campaign");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        campaign.getParticipantIds().add(userId);
        campaign.getParticipants().add(Campaign.ParticipantInfo.builder()
                .userId(userId)
                .fullName(user.getFullName())
                .preferredColor(request != null && request.getPreferredColor() != null ? request.getPreferredColor() : "Any")
                .joinedAt(Instant.now())
                .build());

        campaign.setCurrentBuyers(campaign.getParticipantIds().size());

        // Check if target reached
        boolean reached = false;
        if (campaign.getCurrentBuyers() >= campaign.getTargetBuyers() && campaign.getStatus() == CampaignStatus.OPEN) {
            campaign.setStatus(CampaignStatus.TARGET_REACHED);
            reached = true;
        }

        Campaign updated = campaignRepository.save(campaign);

        // Broadcast real-time live event to campaign topic
        ChatDto.LiveCampaignEvent event = ChatDto.LiveCampaignEvent.builder()
                .eventType(reached ? ChatDto.LiveCampaignEvent.EventType.TARGET_REACHED : ChatDto.LiveCampaignEvent.EventType.MEMBER_JOINED)
                .campaignId(campaignId)
                .currentBuyers(updated.getCurrentBuyers())
                .targetBuyers(updated.getTargetBuyers())
                .message(reached
                        ? "Target reached! " + updated.getCurrentBuyers() + " buyers have joined. Dealership negotiations can now begin."
                        : user.getFullName() + " joined the group buy!")
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/campaigns/" + campaignId + "/events", event);

        return updated;
    }

    @CacheEvict(value = {"featuredCampaigns", "campaignSummary"}, allEntries = true)
    public Campaign leaveCampaign(String campaignId, String userId) {
        Campaign campaign = getCampaignById(campaignId);

        if (campaign.getStatus() == CampaignStatus.COMPLETED) {
            throw new IllegalStateException("Cannot leave a completed campaign");
        }

        if (!campaign.getParticipantIds().contains(userId)) {
            throw new IllegalArgumentException("User is not a member of this campaign");
        }

        if (campaign.getCreatorId().equals(userId) && campaign.getParticipantIds().size() > 1) {
            // Cannot leave if creator and others exist without transferring or closing
            throw new IllegalStateException("Campaign creator cannot leave while other participants are in the campaign");
        }

        User user = userRepository.findById(userId).orElse(null);
        String userName = user != null ? user.getFullName() : "A participant";

        campaign.getParticipantIds().remove(userId);
        campaign.getParticipants().removeIf(p -> p.getUserId().equals(userId));
        campaign.setCurrentBuyers(campaign.getParticipantIds().size());

        if (campaign.getCurrentBuyers() < campaign.getTargetBuyers() && campaign.getStatus() == CampaignStatus.TARGET_REACHED) {
            campaign.setStatus(CampaignStatus.OPEN);
        }

        Campaign updated = campaignRepository.save(campaign);

        // Broadcast member left event
        ChatDto.LiveCampaignEvent event = ChatDto.LiveCampaignEvent.builder()
                .eventType(ChatDto.LiveCampaignEvent.EventType.MEMBER_LEFT)
                .campaignId(campaignId)
                .currentBuyers(updated.getCurrentBuyers())
                .targetBuyers(updated.getTargetBuyers())
                .message(userName + " left the group.")
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/campaigns/" + campaignId + "/events", event);

        return updated;
    }

    public List<Campaign> getJoinedCampaigns(String userId) {
        return campaignRepository.findByParticipantIdsContaining(userId);
    }

    public CampaignDto.CampaignSummaryDto getCampaignSummary(String campaignId) {
        Campaign c = getCampaignById(campaignId);
        long activeOffers = dealerOfferRepository.countByCampaignIdAndStatus(campaignId, com.autodeal.model.OfferStatus.ACTIVE);

        CampaignDto.CampaignSummaryDto dto = new CampaignDto.CampaignSummaryDto();
        dto.setId(c.getId());
        dto.setTitle(c.getTitle());
        dto.setBrand(c.getBrand());
        dto.setModel(c.getModel());
        dto.setVariant(c.getVariant());
        dto.setCity(c.getCity());
        dto.setState(c.getState());
        dto.setTargetBuyers(c.getTargetBuyers());
        dto.setCurrentBuyers(c.getCurrentBuyers());
        dto.setDeadline(c.getDeadline());
        dto.setStatus(c.getStatus());
        dto.setCarImageUrl(c.getCarImageUrl());
        dto.setEstimatedMSRP(c.getEstimatedMSRP());
        dto.setActiveOffersCount(activeOffers);
        double progress = c.getTargetBuyers() > 0 ? (double) c.getCurrentBuyers() / c.getTargetBuyers() * 100 : 0;
        dto.setProgressPercentage(Math.min(progress, 100.0));

        return dto;
    }

    public Campaign updateCampaignStatus(String campaignId, CampaignStatus newStatus) {
        Campaign campaign = getCampaignById(campaignId);
        campaign.setStatus(newStatus);
        Campaign saved = campaignRepository.save(campaign);

        ChatDto.LiveCampaignEvent event = ChatDto.LiveCampaignEvent.builder()
                .eventType(ChatDto.LiveCampaignEvent.EventType.STATUS_CHANGED)
                .campaignId(campaignId)
                .currentBuyers(saved.getCurrentBuyers())
                .targetBuyers(saved.getTargetBuyers())
                .message("Campaign status updated to: " + newStatus)
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/campaigns/" + campaignId + "/events", event);
        return saved;
    }
}

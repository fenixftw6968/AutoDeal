package com.autodeal.service;

import com.autodeal.dto.ChatDto;
import com.autodeal.dto.DealerOfferDto;
import com.autodeal.model.Campaign;
import com.autodeal.model.CampaignStatus;
import com.autodeal.model.DealerOffer;
import com.autodeal.model.OfferStatus;
import com.autodeal.model.User;
import com.autodeal.repository.CampaignRepository;
import com.autodeal.repository.DealerOfferRepository;
import com.autodeal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DealerOfferService {

    private final DealerOfferRepository dealerOfferRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @CacheEvict(value = "campaignSummary", key = "#request.campaignId")
    public DealerOffer submitOffer(String dealerId, DealerOfferDto.CreateOfferRequest request) {
        User dealer = userRepository.findById(dealerId)
                .orElseThrow(() -> new IllegalArgumentException("Dealer not found"));

        if (!dealer.getRoles().contains(com.autodeal.model.Role.ROLE_DEALER) &&
            !dealer.getRoles().contains(com.autodeal.model.Role.ROLE_ADMIN)) {
            throw new AccessDeniedException("Only registered dealerships can submit offers");
        }

        Campaign campaign = campaignRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (campaign.getStatus() == CampaignStatus.COMPLETED || campaign.getStatus() == CampaignStatus.EXPIRED) {
            throw new IllegalStateException("Cannot submit offer for a closed or expired campaign");
        }

        DealerOffer offer = DealerOffer.builder()
                .campaignId(request.getCampaignId())
                .dealerId(dealerId)
                .dealershipName(dealer.getDealershipName() != null ? dealer.getDealershipName() : dealer.getFullName() + " Dealership")
                .dealershipCity(dealer.getCity() != null ? dealer.getCity() : campaign.getCity())
                .verifiedDealer(dealer.isVerifiedDealer())
                .carVariant(request.getCarVariant())
                .exShowroomPrice(request.getExShowroomPrice())
                .groupDiscountAmount(request.getGroupDiscountAmount())
                .estimatedOnRoadPrice(request.getEstimatedOnRoadPrice())
                .inclusions(request.getInclusions() != null ? request.getInclusions() : List.of("Standard Registration", "1 Year Comprehensive Insurance"))
                .exclusions(request.getExclusions() != null ? request.getExclusions() : List.of("Extended Warranty", "Accessory Kit"))
                .validityPeriod(request.getValidityPeriod())
                .termsAndConditions(request.getTermsAndConditions() != null ? request.getTermsAndConditions() : "Valid for confirmed group bookings.")
                .minimumCommitmentUnits(request.getMinimumCommitmentUnits())
                .status(OfferStatus.ACTIVE)
                .isDemoData(false)
                .build();

        DealerOffer saved = dealerOfferRepository.save(offer);

        // Update campaign status to OFFER_AVAILABLE if still open or negotiating
        if (campaign.getStatus() == CampaignStatus.OPEN || campaign.getStatus() == CampaignStatus.TARGET_REACHED || campaign.getStatus() == CampaignStatus.NEGOTIATING) {
            campaign.setStatus(CampaignStatus.OFFER_AVAILABLE);
            campaignRepository.save(campaign);
        }

        // Broadcast offer event via WebSocket
        ChatDto.LiveCampaignEvent event = ChatDto.LiveCampaignEvent.builder()
                .eventType(ChatDto.LiveCampaignEvent.EventType.OFFER_SUBMITTED)
                .campaignId(campaign.getId())
                .currentBuyers(campaign.getCurrentBuyers())
                .targetBuyers(campaign.getTargetBuyers())
                .message("New dealership quotation submitted by " + saved.getDealershipName() + "! Save up to ₹" + (long) saved.getGroupDiscountAmount())
                .payload(saved)
                .timestamp(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/campaigns/" + campaign.getId() + "/events", event);

        return saved;
    }

    public List<DealerOffer> getOffersForCampaign(String campaignId) {
        return dealerOfferRepository.findByCampaignId(campaignId);
    }

    public List<DealerOffer> getOffersByDealer(String dealerId) {
        return dealerOfferRepository.findByDealerId(dealerId);
    }

    public DealerOffer withdrawOffer(String offerId, String dealerId) {
        DealerOffer offer = dealerOfferRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found"));

        if (!offer.getDealerId().equals(dealerId)) {
            throw new AccessDeniedException("Not authorized to withdraw this offer");
        }

        offer.setStatus(OfferStatus.WITHDRAWN);
        return dealerOfferRepository.save(offer);
    }

    public List<DealerOfferDto.OfferComparisonDto> getOfferComparison(String campaignId) {
        List<DealerOffer> offers = dealerOfferRepository.findByCampaignIdAndStatus(campaignId, OfferStatus.ACTIVE);
        return offers.stream().map(o -> {
            DealerOfferDto.OfferComparisonDto dto = new DealerOfferDto.OfferComparisonDto();
            dto.setOfferId(o.getId());
            dto.setDealershipName(o.getDealershipName());
            dto.setDealershipCity(o.getDealershipCity());
            dto.setVerifiedDealer(o.isVerifiedDealer());
            dto.setCarVariant(o.getCarVariant());
            dto.setExShowroomPrice(o.getExShowroomPrice());
            dto.setGroupDiscountAmount(o.getGroupDiscountAmount());
            dto.setEstimatedOnRoadPrice(o.getEstimatedOnRoadPrice());
            dto.setInclusions(o.getInclusions());
            dto.setExclusions(o.getExclusions());
            dto.setValidityPeriod(o.getValidityPeriod());
            dto.setTermsAndConditions(o.getTermsAndConditions());
            dto.setMinimumCommitmentUnits(o.getMinimumCommitmentUnits());
            dto.setDemoData(o.isDemoData());
            return dto;
        }).collect(Collectors.toList());
    }
}

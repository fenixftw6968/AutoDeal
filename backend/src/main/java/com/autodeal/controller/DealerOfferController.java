package com.autodeal.controller;

import com.autodeal.dto.DealerOfferDto;
import com.autodeal.model.DealerOffer;
import com.autodeal.security.UserPrincipal;
import com.autodeal.service.DealerOfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class DealerOfferController {

    private final DealerOfferService dealerOfferService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DEALER', 'ADMIN')")
    public ResponseEntity<DealerOffer> submitOffer(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DealerOfferDto.CreateOfferRequest request) {
        return ResponseEntity.ok(dealerOfferService.submitOffer(principal.getId(), request));
    }

    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<DealerOffer>> getOffersForCampaign(@PathVariable String campaignId) {
        return ResponseEntity.ok(dealerOfferService.getOffersForCampaign(campaignId));
    }

    @GetMapping("/campaign/{campaignId}/comparison")
    public ResponseEntity<List<DealerOfferDto.OfferComparisonDto>> getOfferComparison(@PathVariable String campaignId) {
        return ResponseEntity.ok(dealerOfferService.getOfferComparison(campaignId));
    }

    @GetMapping("/my-offers")
    @PreAuthorize("hasAnyRole('DEALER', 'ADMIN')")
    public ResponseEntity<List<DealerOffer>> getMyOffers(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dealerOfferService.getOffersByDealer(principal.getId()));
    }

    @DeleteMapping("/{offerId}")
    @PreAuthorize("hasAnyRole('DEALER', 'ADMIN')")
    public ResponseEntity<DealerOffer> withdrawOffer(
            @PathVariable String offerId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dealerOfferService.withdrawOffer(offerId, principal.getId()));
    }
}

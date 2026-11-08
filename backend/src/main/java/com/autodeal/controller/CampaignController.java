package com.autodeal.controller;

import com.autodeal.dto.CampaignDto;
import com.autodeal.model.Campaign;
import com.autodeal.model.CampaignStatus;
import com.autodeal.security.UserPrincipal;
import com.autodeal.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping
    public ResponseEntity<List<Campaign>> getAllCampaigns(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) CampaignStatus status) {
        return ResponseEntity.ok(campaignService.getAllCampaigns(brand, model, city, status));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Campaign>> getFeaturedCampaigns() {
        return ResponseEntity.ok(campaignService.getFeaturedCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getCampaignById(@PathVariable String id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<CampaignDto.CampaignSummaryDto> getCampaignSummary(@PathVariable String id) {
        return ResponseEntity.ok(campaignService.getCampaignSummary(id));
    }

    @PostMapping
    public ResponseEntity<Campaign> createCampaign(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CampaignDto.CreateCampaignRequest request) {
        return ResponseEntity.ok(campaignService.createCampaign(principal.getId(), request));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Campaign> joinCampaign(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) CampaignDto.JoinCampaignRequest request) {
        return ResponseEntity.ok(campaignService.joinCampaign(id, principal.getId(), request));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Campaign> leaveCampaign(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.leaveCampaign(id, principal.getId()));
    }

    @GetMapping("/user/joined")
    public ResponseEntity<List<Campaign>> getMyJoinedCampaigns(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(campaignService.getJoinedCampaigns(principal.getId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Campaign> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody CampaignDto.UpdateStatusRequest request) {
        return ResponseEntity.ok(campaignService.updateCampaignStatus(id, request.getStatus()));
    }
}

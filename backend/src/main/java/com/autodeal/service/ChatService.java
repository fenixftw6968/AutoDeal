package com.autodeal.service;

import com.autodeal.dto.ChatDto;
import com.autodeal.model.Campaign;
import com.autodeal.model.ChatMessage;
import com.autodeal.model.User;
import com.autodeal.repository.CampaignRepository;
import com.autodeal.repository.ChatMessageRepository;
import com.autodeal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatDto.MessageResponse sendMessage(String campaignId, String senderId, ChatDto.SendMessageRequest request) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + campaignId));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found: " + senderId));

        // Validate membership
        boolean isMember = campaign.getParticipantIds().contains(senderId);
        boolean isAdmin = sender.getRoles().contains(com.autodeal.model.Role.ROLE_ADMIN);

        if (!isMember && !isAdmin) {
            log.warn("Unauthorized attempt to post message in campaign {} by user {}", campaignId, senderId);
            throw new AccessDeniedException("You must be an authorized member of this campaign to participate in the chat");
        }

        String roleName = sender.getRoles().stream()
                .map(Enum::name)
                .filter(r -> r.contains("ADMIN") || r.contains("DEALER"))
                .findFirst()
                .orElse("CUSTOMER");

        ChatMessage message = ChatMessage.builder()
                .campaignId(campaignId)
                .senderId(senderId)
                .senderName(sender.getFullName())
                .senderRole(roleName)
                .content(request.getContent().trim())
                .type(request.getType() != null ? request.getType() : ChatMessage.MessageType.CHAT)
                .timestamp(Instant.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        ChatDto.MessageResponse response = ChatDto.MessageResponse.builder()
                .id(saved.getId())
                .campaignId(saved.getCampaignId())
                .senderId(saved.getSenderId())
                .senderName(saved.getSenderName())
                .senderRole(saved.getSenderRole())
                .content(saved.getContent())
                .type(saved.getType())
                .timestamp(saved.getTimestamp())
                .build();

        // Broadcast to campaign STOMP topic
        messagingTemplate.convertAndSend("/topic/campaigns/" + campaignId + "/chat", response);
        log.info("Chat message sent to /topic/campaigns/{}/chat by {}", campaignId, sender.getEmail());

        return response;
    }

    public List<ChatMessage> getRecentMessages(String campaignId, String userId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found: " + campaignId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        boolean isMember = campaign.getParticipantIds().contains(userId);
        boolean isAdmin = user.getRoles().contains(com.autodeal.model.Role.ROLE_ADMIN);

        if (!isMember && !isAdmin) {
            throw new AccessDeniedException("Only authorized campaign members can view group chat history");
        }

        return chatMessageRepository.findTop50ByCampaignIdOrderByTimestampAsc(campaignId);
    }

    public Page<ChatMessage> getPagedMessages(String campaignId, String userId, int page, int size) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (!campaign.getParticipantIds().contains(userId)) {
            throw new AccessDeniedException("Access denied: Not a member");
        }

        return chatMessageRepository.findByCampaignIdOrderByTimestampDesc(campaignId, PageRequest.of(page, size));
    }
}

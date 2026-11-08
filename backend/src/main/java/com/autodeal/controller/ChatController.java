package com.autodeal.controller;

import com.autodeal.dto.ChatDto;
import com.autodeal.model.ChatMessage;
import com.autodeal.security.UserPrincipal;
import com.autodeal.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // WebSocket STOMP Endpoint: /app/campaigns/{campaignId}/chat
    @MessageMapping("/campaigns/{campaignId}/chat")
    public void handleIncomingChatMessage(
            @DestinationVariable String campaignId,
            @Payload @Valid ChatDto.SendMessageRequest request,
            Principal principal) {
        if (principal == null) {
            log.error("Attempt to send message without principal to campaign {}", campaignId);
            return;
        }
        String senderId = principal.getName();
        chatService.sendMessage(campaignId, senderId, request);
    }

    // REST endpoint to post a chat message (fallback for HTTP clients)
    @PostMapping("/api/campaigns/{campaignId}/chat/messages")
    public ResponseEntity<ChatDto.MessageResponse> postMessageRest(
            @PathVariable String campaignId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChatDto.SendMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(campaignId, principal.getId(), request));
    }

    // REST endpoint to load chat history
    @GetMapping("/api/campaigns/{campaignId}/chat/messages")
    public ResponseEntity<List<ChatMessage>> getRecentMessages(
            @PathVariable String campaignId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(chatService.getRecentMessages(campaignId, principal.getId()));
    }
}

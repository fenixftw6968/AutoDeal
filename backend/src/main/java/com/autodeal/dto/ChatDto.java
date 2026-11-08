package com.autodeal.dto;

import com.autodeal.model.ChatMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

public class ChatDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessageRequest {
        @NotBlank(message = "Message content cannot be empty")
        @Size(max = 2000, message = "Message cannot exceed 2000 characters")
        private String content;

        private ChatMessage.MessageType type = ChatMessage.MessageType.CHAT;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageResponse {
        private String id;
        private String campaignId;
        private String senderId;
        private String senderName;
        private String senderRole;
        private String content;
        private ChatMessage.MessageType type;
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LiveCampaignEvent {
        public enum EventType {
            MEMBER_JOINED,
            MEMBER_LEFT,
            TARGET_REACHED,
            OFFER_SUBMITTED,
            STATUS_CHANGED
        }

        private EventType eventType;
        private String campaignId;
        private int currentBuyers;
        private int targetBuyers;
        private String message;
        private Object payload;
        private Instant timestamp;
    }
}

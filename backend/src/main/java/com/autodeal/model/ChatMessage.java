package com.autodeal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_messages")
@CompoundIndexes({
    @CompoundIndex(name = "campaign_timestamp_idx", def = "{'campaignId': 1, 'timestamp': -1}")
})
public class ChatMessage {
    @Id
    private String id;

    @Indexed
    private String campaignId;

    private String senderId;
    private String senderName;
    private String senderRole; // CUSTOMER, DEALER, ADMIN, SYSTEM

    private String content;

    public enum MessageType {
        CHAT,
        SYSTEM,
        OFFER_ALERT,
        MILESTONE
    }

    @Builder.Default
    private MessageType type = MessageType.CHAT;

    @CreatedDate
    @Indexed
    private Instant timestamp;
}

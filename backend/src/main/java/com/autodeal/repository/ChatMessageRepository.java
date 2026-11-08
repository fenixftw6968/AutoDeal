package com.autodeal.repository;

import com.autodeal.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    Page<ChatMessage> findByCampaignIdOrderByTimestampDesc(String campaignId, Pageable pageable);
    List<ChatMessage> findTop50ByCampaignIdOrderByTimestampAsc(String campaignId);
}

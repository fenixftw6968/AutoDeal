package com.autodeal.config;

import com.autodeal.model.Campaign;
import com.autodeal.repository.CampaignRepository;
import com.autodeal.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtils jwtUtils;
    private final CampaignRepository campaignRepository;

    private static final Pattern CAMPAIGN_CHAT_TOPIC = Pattern.compile("^/topic/campaigns/([^/]+)/chat$");
    private static final Pattern CAMPAIGN_APP_DEST = Pattern.compile("^/app/campaigns/([^/]+)/chat$");

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        // Authenticate on STOMP CONNECT
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtUtils.validateJwtToken(token)) {
                    String userId = jwtUtils.getUserIdFromToken(token);
                    String email = jwtUtils.getEmailFromToken(token);
                    List<String> roles = jwtUtils.getRolesFromToken(token);

                    List<SimpleGrantedAuthority> authorities = roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userId, email, authorities);

                    accessor.setUser(authentication);
                    log.info("WebSocket connection authenticated for user: {} ({})", email, userId);
                } else {
                    log.warn("Invalid JWT token provided in STOMP CONNECT");
                    throw new AccessDeniedException("Invalid or expired JWT token");
                }
            } else {
                log.warn("No Authorization header provided in STOMP CONNECT");
                throw new AccessDeniedException("Authentication required to connect to WebSocket");
            }
        }

        // Enforce membership on SUBSCRIBE
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null) {
                Matcher matcher = CAMPAIGN_CHAT_TOPIC.matcher(destination);
                if (matcher.matches()) {
                    String campaignId = matcher.group(1);
                    validateUserIsCampaignMember(accessor, campaignId);
                }
            }
        }

        // Enforce membership on SEND
        if (StompCommand.SEND.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null) {
                Matcher matcher = CAMPAIGN_APP_DEST.matcher(destination);
                if (matcher.matches()) {
                    String campaignId = matcher.group(1);
                    validateUserIsCampaignMember(accessor, campaignId);
                }
            }
        }

        return message;
    }

    private void validateUserIsCampaignMember(StompHeaderAccessor accessor, String campaignId) {
        if (accessor.getUser() == null) {
            throw new AccessDeniedException("User is not authenticated");
        }

        String userId = accessor.getUser().getName();
        Optional<Campaign> campaignOpt = campaignRepository.findById(campaignId);
        if (campaignOpt.isEmpty()) {
            throw new AccessDeniedException("Campaign not found");
        }

        Campaign campaign = campaignOpt.get();
        // Check if user is a member or admin
        boolean isMember = campaign.getParticipantIds().contains(userId);
        boolean isAdmin = accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth &&
                auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isMember && !isAdmin) {
            log.warn("Unauthorized attempt to access campaign chat {} by user {}", campaignId, userId);
            throw new AccessDeniedException("You must be an authorized member of this campaign to join the group chat");
        }
    }
}

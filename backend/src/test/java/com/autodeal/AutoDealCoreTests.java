package com.autodeal;

import com.autodeal.dto.AuthDto;
import com.autodeal.dto.CampaignDto;
import com.autodeal.model.Campaign;
import com.autodeal.model.Role;
import com.autodeal.model.User;
import com.autodeal.repository.CampaignRepository;
import com.autodeal.repository.UserRepository;
import com.autodeal.service.AuthService;
import com.autodeal.service.CampaignService;
import com.autodeal.service.ChatService;
import com.autodeal.service.DealerOfferService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AutoDealCoreTests {

    @MockBean
    private RedisConnectionFactory redisConnectionFactory;

    @Autowired
    private AuthService authService;

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private DealerOfferService dealerOfferService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Test
    public void testCustomerRegistrationAndLogin() {
        AuthDto.RegisterRequest req = new AuthDto.RegisterRequest();
        req.setEmail("testbuyer_" + System.currentTimeMillis() + "@autodeal.com");
        req.setPassword("securePass123");
        req.setFullName("Test Buyer");
        req.setCity("Mumbai");
        req.setRoles(Set.of(Role.ROLE_CUSTOMER));

        AuthDto.AuthResponse resp = authService.register(req);
        assertNotNull(resp.getToken(), "Token should not be null");
        assertEquals("Mumbai", resp.getCity());

        // Test login
        AuthDto.LoginRequest loginReq = new AuthDto.LoginRequest();
        loginReq.setEmail(req.getEmail());
        loginReq.setPassword("securePass123");
        AuthDto.AuthResponse loginResp = authService.login(loginReq);
        assertNotNull(loginResp.getToken());
    }

    @Test
    public void testCampaignMembershipRules() {
        // Create user
        User user = userRepository.save(User.builder()
                .email("creator_" + System.currentTimeMillis() + "@autodeal.com")
                .fullName("Campaign Creator")
                .password("testpass")
                .roles(Set.of(Role.ROLE_CUSTOMER))
                .city("Delhi NCR")
                .build());

        CampaignDto.CreateCampaignRequest req = new CampaignDto.CreateCampaignRequest();
        req.setTitle("Tata Harrier Dark Edition Group");
        req.setBrand("Tata");
        req.setModel("Harrier");
        req.setVariant("Fearless+ Dark AT");
        req.setCity("Delhi NCR");
        req.setTargetBuyers(3);
        req.setDeadline(LocalDate.now().plusDays(10));
        req.setEstimatedMSRP(2200000.0);

        Campaign c = campaignService.createCampaign(user.getId(), req);
        assertNotNull(c.getId());
        assertEquals(1, c.getCurrentBuyers());
        assertTrue(c.getParticipantIds().contains(user.getId()));

        // Joining already joined campaign throws exception
        assertThrows(IllegalArgumentException.class, () -> {
            campaignService.joinCampaign(c.getId(), user.getId(), null);
        });
    }

    @Test
    public void testNonDealerCannotSubmitOffer() {
        User regularCustomer = userRepository.save(User.builder()
                .email("cust_" + System.currentTimeMillis() + "@autodeal.com")
                .fullName("Regular Customer")
                .password("testpass")
                .roles(Set.of(Role.ROLE_CUSTOMER))
                .build());

        com.autodeal.dto.DealerOfferDto.CreateOfferRequest offerReq = new com.autodeal.dto.DealerOfferDto.CreateOfferRequest();
        offerReq.setCampaignId("dummy_campaign_id");
        offerReq.setCarVariant("Top");
        offerReq.setExShowroomPrice(1000000);
        offerReq.setGroupDiscountAmount(50000);
        offerReq.setEstimatedOnRoadPrice(1150000);
        offerReq.setValidityPeriod(LocalDate.now().plusDays(7));
        offerReq.setMinimumCommitmentUnits(2);

        assertThrows(AccessDeniedException.class, () -> {
            dealerOfferService.submitOffer(regularCustomer.getId(), offerReq);
        });
    }
}

package com.autodeal.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisConfig {

    public static final String CACHE_CAR_CATALOG = "carCatalog";
    public static final String CACHE_FEATURED_CAMPAIGNS = "featuredCampaigns";
    public static final String CACHE_CAMPAIGN_SUMMARY = "campaignSummary";

    @Bean
    @Primary
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis", matchIfMissing = true)
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        try {
            RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(10))
                    .disableCachingNullValues()
                    .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

            Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
            cacheConfigurations.put(CACHE_CAR_CATALOG, defaultConfig.entryTtl(Duration.ofMinutes(30)));
            cacheConfigurations.put(CACHE_FEATURED_CAMPAIGNS, defaultConfig.entryTtl(Duration.ofMinutes(3)));
            cacheConfigurations.put(CACHE_CAMPAIGN_SUMMARY, defaultConfig.entryTtl(Duration.ofMinutes(2)));

            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(defaultConfig)
                    .withInitialCacheConfigurations(cacheConfigurations)
                    .build();
        } catch (Exception e) {
            return new ConcurrentMapCacheManager(CACHE_CAR_CATALOG, CACHE_FEATURED_CAMPAIGNS, CACHE_CAMPAIGN_SUMMARY);
        }
    }

    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "simple")
    public CacheManager simpleCacheManager() {
        return new ConcurrentMapCacheManager(CACHE_CAR_CATALOG, CACHE_FEATURED_CAMPAIGNS, CACHE_CAMPAIGN_SUMMARY);
    }
}

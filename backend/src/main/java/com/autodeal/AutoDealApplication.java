package com.autodeal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableCaching
@EnableMongoRepositories(basePackages = "com.autodeal.repository")
public class AutoDealApplication {
    public static void main(String[] args) {
        SpringApplication.run(AutoDealApplication.class, args);
    }
}

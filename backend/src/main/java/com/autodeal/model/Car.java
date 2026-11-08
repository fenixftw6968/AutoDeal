package com.autodeal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cars")
public class Car {
    @Id
    private String id;
    private String brand;
    private String model;
    private String bodyType; // SUV, Sedan, Hatchback, EV
    private double startingMsrp;
    private String imageUrl;
    private List<String> availableVariants;
    private List<String> popularColors;
}

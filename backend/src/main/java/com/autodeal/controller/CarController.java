package com.autodeal.controller;

import com.autodeal.model.Car;
import com.autodeal.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarRepository carRepository;

    @GetMapping
    @Cacheable(value = "carCatalog")
    public ResponseEntity<List<Car>> getAllCars(@RequestParam(required = false) String brand) {
        if (brand != null && !brand.isBlank()) {
            return ResponseEntity.ok(carRepository.findByBrandIgnoreCase(brand));
        }
        return ResponseEntity.ok(carRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable String id) {
        return carRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.autodeal.config;

import com.autodeal.model.*;
import com.autodeal.repository.CampaignRepository;
import com.autodeal.repository.CarRepository;
import com.autodeal.repository.DealerOfferRepository;
import com.autodeal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final CampaignRepository campaignRepository;
    private final DealerOfferRepository dealerOfferRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          CarRepository carRepository,
                          CampaignRepository campaignRepository,
                          DealerOfferRepository dealerOfferRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.campaignRepository = campaignRepository;
        this.dealerOfferRepository = dealerOfferRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Expand and ensure rich catalog of popular cars with high-res authentic photos
        if (carRepository.count() <= 4) {
            carRepository.deleteAll();

            // 1. Hyundai Creta
            carRepository.save(Car.builder()
                    .brand("Hyundai")
                    .model("Creta")
                    .bodyType("SUV")
                    .startingMsrp(1100000)
                    .imageUrl("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("SX (O) Turbo Petrol", "SX Diesel AT", "S(O) Knight Edition", "EX Petrol"))
                    .popularColors(List.of("Abyss Black", "Atlas White", "Ranger Khaki", "Titan Grey"))
                    .build());

            // 2. Kia Seltos
            carRepository.save(Car.builder()
                    .brand("Kia")
                    .model("Seltos")
                    .bodyType("SUV")
                    .startingMsrp(1090000)
                    .imageUrl("https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("GTX Plus Turbo DCT", "HTX Diesel AT", "X-Line Matte", "HTK Plus"))
                    .popularColors(List.of("Pewter Olive", "Aurora Black Pearl", "Glacier White", "Gravity Grey"))
                    .build());

            // 3. Tata Harrier
            carRepository.save(Car.builder()
                    .brand("Tata")
                    .model("Harrier")
                    .bodyType("SUV")
                    .startingMsrp(1549000)
                    .imageUrl("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("Fearless+ Dark Edition AT", "Adventure+ AT", "Pure (O)", "Smart"))
                    .popularColors(List.of("Oberon Black", "Sunlit Yellow", "Ash Grey", "Pebble Grey"))
                    .build());

            // 4. Mahindra XUV700
            carRepository.save(Car.builder()
                    .brand("Mahindra")
                    .model("XUV700")
                    .bodyType("SUV")
                    .startingMsrp(1399000)
                    .imageUrl("https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("AX7 Luxury Pack AWD", "AX5 Diesel AT", "AX3 Petrol", "MX"))
                    .popularColors(List.of("Midnight Black", "Electric Blue", "Everest White", "Dazzling Silver"))
                    .build());

            // 5. Mahindra Thar & Roxx
            carRepository.save(Car.builder()
                    .brand("Mahindra")
                    .model("Thar Roxx")
                    .bodyType("SUV")
                    .startingMsrp(1299000)
                    .imageUrl("https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("AX7L 4x4 AT", "MX5 Diesel MT", "AX3L Petrol", "LX Hard Top"))
                    .popularColors(List.of("Stealth Black", "Deep Forest", "Tango Red", "Everest White"))
                    .build());

            // 6. Tata Safari
            carRepository.save(Car.builder()
                    .brand("Tata")
                    .model("Safari")
                    .bodyType("SUV")
                    .startingMsrp(1619000)
                    .imageUrl("https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("Accomplished+ 6S Dark", "Adventure+ AT", "Pure+ AT"))
                    .popularColors(List.of("Cosmic Gold", "Stardust Ash", "Oberon Black"))
                    .build());

            // 7. Toyota Innova Hycross
            carRepository.save(Car.builder()
                    .brand("Toyota")
                    .model("Innova Hycross")
                    .bodyType("MPV")
                    .startingMsrp(1977000)
                    .imageUrl("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("ZX (O) Strong Hybrid", "VX Hybrid 8S", "GX Limited Petrol"))
                    .popularColors(List.of("Blackish Ageha", "Pearl White", "Silver Metallic"))
                    .build());

            // 8. Maruti Suzuki Grand Vitara
            carRepository.save(Car.builder()
                    .brand("Maruti Suzuki")
                    .model("Grand Vitara")
                    .bodyType("SUV")
                    .startingMsrp(1099000)
                    .imageUrl("https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("Alpha+ Strong Hybrid", "Zeta AT", "Alpha AllGrip AWD"))
                    .popularColors(List.of("Nexa Blue", "Arctic White", "Grandeur Grey", "Splendid Silver"))
                    .build());

            // 9. Volkswagen Virtus
            carRepository.save(Car.builder()
                    .brand("Volkswagen")
                    .model("Virtus")
                    .bodyType("Sedan")
                    .startingMsrp(1156000)
                    .imageUrl("https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("GT Plus 1.5 TSI DSG", "Topline 1.0 TSI AT", "Highline MT"))
                    .popularColors(List.of("Wild Cherry Red", "Curcuma Yellow", "Carbon Steel Grey", "Candy White"))
                    .build());

            // 10. Skoda Slavia
            carRepository.save(Car.builder()
                    .brand("Skoda")
                    .model("Slavia")
                    .bodyType("Sedan")
                    .startingMsrp(1163000)
                    .imageUrl("https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80")
                    .availableVariants(List.of("Style 1.5 TSI DSG", "Monte Carlo Edition", "Ambition 1.0 AT"))
                    .popularColors(List.of("Crystal Blue", "Tornado Red", "Carbon Steel", "Brilliant Silver"))
                    .build());

            log.info("Car catalog expanded with 10 popular vehicle models.");
        }

        // Clean any residual demo flags from offers
        dealerOfferRepository.findAll().forEach(offer -> {
            if (offer.isDemoData()) {
                offer.setDemoData(false);
                dealerOfferRepository.save(offer);
            }
        });
    }
}

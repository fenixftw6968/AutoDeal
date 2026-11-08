package com.autodeal.dto;

import com.autodeal.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email should be valid")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Full name is required")
        private String fullName;

        private String phone;
        private String city;

        // Dealership registration fields
        private String dealershipName;
        private String dealershipLicense;

        private Set<Role> roles;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private String id;
        private String email;
        private String fullName;
        private String city;
        private String dealershipName;
        private boolean verifiedDealer;
        private Set<Role> roles;

        public AuthResponse(String token, String id, String email, String fullName, String city,
                            String dealershipName, boolean verifiedDealer, Set<Role> roles) {
            this.token = token;
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.city = city;
            this.dealershipName = dealershipName;
            this.verifiedDealer = verifiedDealer;
            this.roles = roles;
        }
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String phone;
        private String city;
        private String dealershipName;
    }
}

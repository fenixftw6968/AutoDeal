package com.autodeal.service;

import com.autodeal.dto.AuthDto;
import com.autodeal.model.Role;
import com.autodeal.model.User;
import com.autodeal.repository.UserRepository;
import com.autodeal.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            roles.addAll(request.getRoles());
        } else {
            roles.add(Role.ROLE_CUSTOMER);
        }

        boolean isDealer = roles.contains(Role.ROLE_DEALER);

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .city(request.getCity())
                .dealershipName(isDealer ? request.getDealershipName() : null)
                .dealershipLicense(isDealer ? request.getDealershipLicense() : null)
                .verifiedDealer(isDealer) // Demo defaults verified for test dealers
                .roles(roles)
                .build();

        userRepository.save(user);

        List<String> roleStrings = roles.stream().map(Role::name).collect(Collectors.toList());
        String token = jwtUtils.generateToken(user.getId(), user.getEmail(), roleStrings);

        return new AuthDto.AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getCity(),
                user.getDealershipName(),
                user.isVerifiedDealer(),
                user.getRoles()
        );
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<String> roleStrings = user.getRoles().stream().map(Role::name).collect(Collectors.toList());
        String token = jwtUtils.generateToken(user.getId(), user.getEmail(), roleStrings);

        return new AuthDto.AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getCity(),
                user.getDealershipName(),
                user.isVerifiedDealer(),
                user.getRoles()
        );
    }

    public User getProfile(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User updateProfile(String userId, AuthDto.UpdateProfileRequest request) {
        User user = getProfile(userId);
        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getDealershipName() != null && user.getRoles().contains(Role.ROLE_DEALER)) {
            user.setDealershipName(request.getDealershipName());
        }
        return userRepository.save(user);
    }
}

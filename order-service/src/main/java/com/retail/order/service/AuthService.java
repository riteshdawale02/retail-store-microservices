package com.retail.order.service;

import com.retail.order.dto.AuthResponse;
import com.retail.order.dto.LoginRequest;
import com.retail.order.dto.RegisterRequest;
import com.retail.order.dto.UserDto;
import com.retail.order.model.User;
import com.retail.order.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void seedInitialUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding initial demo accounts in MySQL users table...");

            // 1. Retailer Account (Has privilege to add & manage products)
            User retailer = new User(
                    "usr-retailer-01",
                    "Samir Retailer",
                    "retailer@cloudretail.io",
                    hashPassword("password123"),
                    "RETAILER",
                    "Cloud Commercial Complex, Tech Hub, Yavatmal"
            );
            userRepository.save(retailer);

            // 2. Regular Customer Account
            User customer = new User(
                    "usr-customer-01",
                    "Rahul Shopper",
                    "user@cloudretail.io",
                    hashPassword("password123"),
                    "USER",
                    "15 Garden Avenue, Civil Lines, Yavatmal"
            );
            userRepository.save(customer);

            log.info("Demo users created successfully: retailer@cloudretail.io (RETAILER) and user@cloudretail.io (USER)");
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email " + email + " already exists.");
        }

        String role = (request.getRole() != null && request.getRole().equalsIgnoreCase("RETAILER"))
                ? "RETAILER"
                : "USER";

        String userId = "usr-" + UUID.randomUUID().toString().substring(0, 8);
        String passwordHash = hashPassword(request.getPassword());

        User user = new User(
                userId,
                request.getName().trim(),
                email,
                passwordHash,
                role,
                request.getAddress() != null ? request.getAddress().trim() : ""
        );
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        User saved = userRepository.save(user);
        String token = "cr-token-" + UUID.randomUUID().toString();

        log.info("New user registered: id={}, email={}, role={}", saved.getId(), saved.getEmail(), saved.getRole());
        return new AuthResponse(true, "Registration successful!", token, new UserDto(saved));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        String inputHash = hashPassword(request.getPassword());
        if (!user.getPasswordHash().equals(inputHash)) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = "cr-token-" + UUID.randomUUID().toString();
        log.info("User logged in: email={}, role={}", user.getEmail(), user.getRole());
        return new AuthResponse(true, "Login successful!", token, new UserDto(user));
    }

    public Optional<UserDto> getUser(String userId) {
        return userRepository.findByUserId(userId).map(UserDto::new);
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}

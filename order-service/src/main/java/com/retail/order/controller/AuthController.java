package com.retail.order.controller;

import com.retail.order.dto.AuthResponse;
import com.retail.order.dto.LoginRequest;
import com.retail.order.dto.RegisterRequest;
import com.retail.order.dto.UserDto;
import com.retail.order.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Registration Error",
                    "message", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Internal Error",
                    "message", ex.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "Unauthorized",
                    "message", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Internal Error",
                    "message", ex.getMessage()
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestParam(required = false) String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId parameter is required"));
        }
        return authService.getUser(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.retail.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.order.dto.AuthResponse;
import com.retail.order.dto.LoginRequest;
import com.retail.order.dto.RegisterRequest;
import com.retail.order.dto.UserDto;
import com.retail.order.model.User;
import com.retail.order.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/register creates user account and returns token")
    void testRegisterSuccess() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("retailer1");
        req.setEmail("retailer@example.com");
        req.setPassword("Password123!");
        req.setRole("RETAILER");

        User user = new User();
        user.setId(1L);
        user.setUserId("user-r1");
        user.setName("retailer1");
        user.setEmail("retailer@example.com");
        user.setRole("RETAILER");
        UserDto userDto = new UserDto(user);
        AuthResponse resp = new AuthResponse(true, "Registration successful", "dummy-jwt-token", userDto);

        when(authService.register(any(RegisterRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.role").value("RETAILER"))
                .andExpect(jsonPath("$.token").value("dummy-jwt-token"));
    }

    @Test
    @DisplayName("POST /api/auth/login authenticates user successfully")
    void testLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("samir@example.com");
        req.setPassword("Password123!");

        User user = new User();
        user.setId(2L);
        user.setUserId("user-s2");
        user.setName("samir");
        user.setEmail("samir@example.com");
        user.setRole("USER");
        UserDto userDto = new UserDto(user);
        AuthResponse resp = new AuthResponse(true, "Login successful", "dummy-jwt-token", userDto);

        when(authService.login(any(LoginRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.name").value("samir"));
    }
}

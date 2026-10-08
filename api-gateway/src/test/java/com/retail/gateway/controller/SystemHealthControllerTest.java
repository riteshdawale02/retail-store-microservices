package com.retail.gateway.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SystemHealthController.class)
public class SystemHealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RestTemplate restTemplate;

    @Test
    @DisplayName("GET /api/system/health returns aggregated health telemetry")
    void testGetSystemHealth() throws Exception {
        when(restTemplate.getForEntity(anyString(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"status\":\"UP\"}"));

        mockMvc.perform(get("/api/system/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gatewayStatus").value("UP"))
                .andExpect(jsonPath("$.cloudProvider").value("AWS"))
                .andExpect(jsonPath("$.overallHealth").value("HEALTHY"))
                .andExpect(jsonPath("$.services.productService.status").value("UP"))
                .andExpect(jsonPath("$.services.cartService.status").value("UP"))
                .andExpect(jsonPath("$.services.orderService.status").value("UP"));
    }

    @Test
    @DisplayName("GET /api/system/health reports DEGRADED when a downstream service is down")
    void testGetSystemHealthDegraded() throws Exception {
        when(restTemplate.getForEntity(anyString(), eq(String.class)))
                .thenThrow(new RuntimeException("Connection refused"));

        mockMvc.perform(get("/api/system/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gatewayStatus").value("UP"))
                .andExpect(jsonPath("$.overallHealth").value("DEGRADED"))
                .andExpect(jsonPath("$.services.productService.status").value("DOWN"));
    }
}

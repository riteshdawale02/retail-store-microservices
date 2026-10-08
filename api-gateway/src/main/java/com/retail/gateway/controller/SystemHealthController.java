package com.retail.gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "*")
public class SystemHealthController {

    private final RestTemplate restTemplate;

    @Value("${services.product-service.url:http://localhost:8081}")
    private String productServiceUrl;

    @Value("${services.cart-service.url:http://localhost:8082}")
    private String cartServiceUrl;

    @Value("${services.order-service.url:http://localhost:8083}")
    private String orderServiceUrl;

    @Value("${cloud.provider:AWS}")
    private String cloudProvider;

    @Value("${cloud.region:us-east-1}")
    private String awsRegion;

    @Value("${cloud.environment:production}")
    private String environment;

    public SystemHealthController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("timestamp", Instant.now().toString());
        result.put("gatewayStatus", "UP");
        result.put("cloudProvider", cloudProvider);
        result.put("awsRegion", awsRegion);
        result.put("environment", environment);

        Map<String, Object> services = new LinkedHashMap<>();
        services.put("productService", checkServiceHealth("Product Service", productServiceUrl));
        services.put("cartService", checkServiceHealth("Cart Service", cartServiceUrl));
        services.put("orderService", checkServiceHealth("Order Service", orderServiceUrl));
        result.put("services", services);

        // Overall status
        boolean allUp = services.values().stream()
                .filter(Map.class::isInstance)
                .map(s -> (Map<?, ?>) s)
                .allMatch(m -> "UP".equals(m.get("status")));

        result.put("overallHealth", allUp ? "HEALTHY" : "DEGRADED");

        return ResponseEntity.ok(result);
    }

    private Map<String, Object> checkServiceHealth(String name, String baseUrl) {
        Map<String, Object> serviceInfo = new HashMap<>();
        serviceInfo.put("name", name);
        serviceInfo.put("url", baseUrl);

        long start = System.currentTimeMillis();
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/actuator/health", String.class);
            long latency = System.currentTimeMillis() - start;
            serviceInfo.put("status", (response != null && response.getStatusCode().is2xxSuccessful()) ? "UP" : "DOWN");
            serviceInfo.put("latencyMs", latency);
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            serviceInfo.put("status", "DOWN");
            serviceInfo.put("latencyMs", latency);
            serviceInfo.put("error", e.getMessage());
        }
        return serviceInfo;
    }
}

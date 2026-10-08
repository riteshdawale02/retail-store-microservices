package com.retail.gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Map;
import java.util.Set;

@RestController
@CrossOrigin(origins = "*")
public class GatewayProxyController {

    private static final Logger log = LoggerFactory.getLogger(GatewayProxyController.class);

    private static final Set<String> HOP_BY_HOP_HEADERS = Set.of(
            "connection",
            "keep-alive",
            "proxy-authenticate",
            "proxy-authorization",
            "te",
            "trailers",
            "transfer-encoding",
            "upgrade",
            "host"
    );

    private final RestTemplate restTemplate;

    @Value("${services.product-service.url:http://localhost:8081}")
    private String productServiceUrl;

    @Value("${services.cart-service.url:http://localhost:8082}")
    private String cartServiceUrl;

    @Value("${services.order-service.url:http://localhost:8083}")
    private String orderServiceUrl;

    public GatewayProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @RequestMapping(value = "/api/products/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> proxyProduct(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return forwardRequest(request, productServiceUrl, body);
    }

    @RequestMapping(value = "/api/cart/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> proxyCart(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return forwardRequest(request, cartServiceUrl, body);
    }

    @RequestMapping(value = {"/api/orders", "/api/orders/**"}, method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> proxyOrder(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return forwardRequest(request, orderServiceUrl, body);
    }

    @RequestMapping(value = {"/api/auth", "/api/auth/**"}, method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> proxyAuth(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return forwardRequest(request, orderServiceUrl, body);
    }

    private ResponseEntity<?> forwardRequest(HttpServletRequest request, String targetBaseUrl, byte[] body) {
        String path = request.getRequestURI();
        String queryString = request.getQueryString();
        String fullUrl = targetBaseUrl + path + (queryString != null ? "?" + queryString : "");

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        HttpHeaders headers = new HttpHeaders();

        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (!headerName.equalsIgnoreCase("host") && !headerName.equalsIgnoreCase("content-length") && !isHopByHopHeader(headerName)) {
                headers.addAll(headerName, Collections.list(request.getHeaders(headerName)));
            }
        }

        HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(URI.create(fullUrl), method, entity, byte[].class);
            HttpHeaders cleanHeaders = sanitizeHeaders(response.getHeaders());
            return ResponseEntity.status(response.getStatusCode())
                    .headers(cleanHeaders)
                    .body(response.getBody());
        } catch (HttpStatusCodeException ex) {
            HttpHeaders cleanHeaders = sanitizeHeaders(ex.getResponseHeaders());
            return ResponseEntity.status(ex.getStatusCode())
                    .headers(cleanHeaders)
                    .body(ex.getResponseBodyAsByteArray());
        } catch (ResourceAccessException ex) {
            log.error("Downstream service unreachable at {}: {}", fullUrl, ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "error", "Service Unavailable",
                            "message", "Downstream microservice is currently unreachable.",
                            "targetUrl", fullUrl
                    ));
        } catch (Exception ex) {
            log.error("Gateway proxy error: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Gateway Internal Error", "message", ex.getMessage()));
        }
    }

    private boolean isHopByHopHeader(String headerName) {
        return headerName != null && HOP_BY_HOP_HEADERS.contains(headerName.toLowerCase());
    }

    private HttpHeaders sanitizeHeaders(HttpHeaders originalHeaders) {
        HttpHeaders sanitized = new HttpHeaders();
        if (originalHeaders != null) {
            originalHeaders.forEach((key, values) -> {
                if (!isHopByHopHeader(key)) {
                    sanitized.put(key, values);
                }
            });
        }
        return sanitized;
    }
}

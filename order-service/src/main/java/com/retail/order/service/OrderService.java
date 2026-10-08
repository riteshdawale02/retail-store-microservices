package com.retail.order.service;

import com.retail.order.dto.CheckoutRequest;
import com.retail.order.dto.CheckoutResponse;
import com.retail.order.model.Order;
import com.retail.order.model.OrderItem;
import com.retail.order.model.OrderStatus;
import com.retail.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final RestClient restClient;

    @Value("${services.product-service.url:http://localhost:8081}")
    private String productServiceUrl;

    @Value("${services.cart-service.url:http://localhost:8082}")
    private String cartServiceUrl;

    public OrderService(OrderRepository orderRepository, RestClient restClient) {
        this.orderRepository = orderRepository;
        this.restClient = restClient;
    }

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request) {
        log.info("Processing checkout for user: {}", request.getUserId());

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        // Check if items are directly supplied
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CheckoutRequest.OrderItemDto dto : request.getItems()) {
                BigDecimal unitPrice = dto.getUnitPrice() != null ? BigDecimal.valueOf(dto.getUnitPrice()) : BigDecimal.ZERO;
                OrderItem item = new OrderItem(
                        dto.getProductId(),
                        dto.getProductName(),
                        unitPrice,
                        dto.getQuantity() != null ? dto.getQuantity() : 1,
                        dto.getImageUrl()
                );
                orderItems.add(item);
                total = total.add(item.getSubtotal());

                // Deduct stock in Product Service
                deductProductStock(dto.getProductId(), item.getQuantity());
            }
        } else {
            // Fetch cart from Cart Service
            Map<String, Object> cartData = fetchUserCart(request.getUserId());
            if (cartData == null || !cartData.containsKey("items")) {
                return new CheckoutResponse(false, "Cart is empty or could not be retrieved", null);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) cartData.get("items");
            if (itemsList == null || itemsList.isEmpty()) {
                return new CheckoutResponse(false, "Cart is empty", null);
            }

            for (Map<String, Object> rawItem : itemsList) {
                Long productId = ((Number) rawItem.get("productId")).longValue();
                String name = (String) rawItem.get("productName");
                Number unitPriceNum = (Number) rawItem.get("unitPrice");
                BigDecimal unitPrice = unitPriceNum != null ? BigDecimal.valueOf(unitPriceNum.doubleValue()) : BigDecimal.ZERO;
                Integer quantity = ((Number) rawItem.getOrDefault("quantity", 1)).intValue();
                String imageUrl = (String) rawItem.get("imageUrl");

                OrderItem item = new OrderItem(productId, name, unitPrice, quantity, imageUrl);
                orderItems.add(item);
                total = total.add(item.getSubtotal());

                // Deduct stock in Product Service
                deductProductStock(productId, quantity);
            }

            // Clear Cart after reading
            clearUserCart(request.getUserId());
        }

        if (orderItems.isEmpty()) {
            return new CheckoutResponse(false, "No items available to checkout", null);
        }

        Order order = new Order();
        order.setOrderNumber("ORD-" + System.currentTimeMillis() + "-" + (1000 + new Random().nextInt(9000)));
        order.setUserId(request.getUserId());
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(OrderStatus.CONFIRMED);
        order.setTotalAmount(total);

        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);
        log.info("Order successfully created: {}", savedOrder.getOrderNumber());

        return new CheckoutResponse(true, "Order placed successfully! Order Number: " + savedOrder.getOrderNumber(), savedOrder);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Optional<Order> updateOrderStatus(Long id, OrderStatus newStatus) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(newStatus);
            return orderRepository.save(order);
        });
    }

    // Inter-service call helper: Deduct stock from Product Service
    private void deductProductStock(Long productId, int quantity) {
        try {
            restClient.put()
                    .uri(productServiceUrl + "/api/products/{id}/stock", productId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("quantity", quantity))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Deducted {} stock for productId {} in Product Service", quantity, productId);
        } catch (Exception e) {
            log.warn("Failed to deduct stock for productId {} from Product Service: {}", productId, e.getMessage());
        }
    }

    // Inter-service call helper: Fetch cart from Cart Service
    private Map<String, Object> fetchUserCart(String userId) {
        try {
            return restClient.get()
                    .uri(cartServiceUrl + "/api/cart/{userId}", userId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Could not retrieve cart for user {}: {}", userId, e.getMessage());
            return Collections.emptyMap();
        }
    }

    // Inter-service call helper: Clear cart in Cart Service
    private void clearUserCart(String userId) {
        try {
            restClient.delete()
                    .uri(cartServiceUrl + "/api/cart/{userId}", userId)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Cleared cart for user {}", userId);
        } catch (Exception e) {
            log.warn("Could not clear cart for user {}: {}", userId, e.getMessage());
        }
    }
}

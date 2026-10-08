package com.retail.cart.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.cart.model.Cart;
import com.retail.cart.model.CartItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);
    private static final String CART_KEY_PREFIX = "retail:cart:";
    private static final Duration CART_TTL = Duration.ofDays(7);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    // Resilient fallback in-memory cache if Redis is unavailable or initializing
    private final Map<String, Cart> localFallbackStore = new ConcurrentHashMap<>();

    public CartService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    private String getKey(String userId) {
        return CART_KEY_PREFIX + userId;
    }

    public Cart getCart(String userId) {
        try {
            String json = redisTemplate.opsForValue().get(getKey(userId));
            if (json != null && !json.trim().isEmpty()) {
                Cart cart = objectMapper.readValue(json, Cart.class);
                if (cart != null) {
                    if (cart.getItems() == null) {
                        cart.setItems(new ArrayList<>());
                    }
                    localFallbackStore.put(userId, cart);
                    return cart;
                }
            }
        } catch (Exception e) {
            log.warn("Redis fetch failed for user {}: {}", userId, e.getMessage());
        }

        // Return local store if available, or initialize new cart
        Cart fallback = localFallbackStore.get(userId);
        if (fallback != null) {
            return fallback;
        }

        Cart newCart = new Cart(userId);
        localFallbackStore.put(userId, newCart);
        return newCart;
    }

    public Cart saveCart(Cart cart) {
        cart.recalculate();
        localFallbackStore.put(cart.getUserId(), cart);

        try {
            String json = objectMapper.writeValueAsString(cart);
            redisTemplate.opsForValue().set(getKey(cart.getUserId()), json, CART_TTL);
            log.debug("Saved cart for user {} to Redis with {} items", cart.getUserId(), cart.getItems().size());
        } catch (Exception e) {
            log.warn("Redis write failed for user {}: {}", cart.getUserId(), e.getMessage());
        }

        return cart;
    }

    public Cart addItem(String userId, CartItem newItem) {
        Cart cart = getCart(userId);
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId() != null && newItem.getProductId() != null
                        && item.getProductId().longValue() == newItem.getProductId().longValue())
                .findFirst();

        int addQty = (newItem.getQuantity() != null && newItem.getQuantity() > 0) ? newItem.getQuantity() : 1;

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + addQty);
            if (newItem.getUnitPrice() != null) {
                item.setUnitPrice(newItem.getUnitPrice());
            }
            log.info("Incremented quantity for product {} to {} in user {} cart", item.getProductId(), item.getQuantity(), userId);
        } else {
            newItem.setQuantity(addQty);
            cart.getItems().add(newItem);
            log.info("Added new product {} to user {} cart (total distinct items: {})", newItem.getProductId(), userId, cart.getItems().size());
        }

        return saveCart(cart);
    }

    public Cart updateItemQuantity(String userId, Long productId, int quantity) {
        Cart cart = getCart(userId);
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        if (quantity <= 0) {
            cart.getItems().removeIf(item -> item.getProductId() != null
                    && item.getProductId().longValue() == productId.longValue());
            log.info("Removed product {} from user {} cart due to zero/negative quantity", productId, userId);
        } else {
            Optional<CartItem> found = cart.getItems().stream()
                    .filter(item -> item.getProductId() != null
                            && item.getProductId().longValue() == productId.longValue())
                    .findFirst();

            if (found.isPresent()) {
                found.get().setQuantity(quantity);
                log.info("Updated product {} quantity to {} in user {} cart", productId, quantity, userId);
            } else {
                log.warn("Product {} not found in user {} cart during quantity update", productId, userId);
            }
        }

        return saveCart(cart);
    }

    public Cart removeItem(String userId, Long productId) {
        Cart cart = getCart(userId);
        if (cart.getItems() != null) {
            cart.getItems().removeIf(item -> item.getProductId() != null
                    && item.getProductId().longValue() == productId.longValue());
            log.info("Deleted product {} from user {} cart", productId, userId);
        }
        return saveCart(cart);
    }

    public void clearCart(String userId) {
        try {
            redisTemplate.delete(getKey(userId));
        } catch (Exception e) {
            log.warn("Redis delete failed for user {}: {}", userId, e.getMessage());
        }
        localFallbackStore.remove(userId);
        log.info("Cleared cart for user {}", userId);
    }
}

package com.retail.cart.controller;

import com.retail.cart.model.Cart;
import com.retail.cart.model.CartItem;
import com.retail.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<Cart> addItem(@PathVariable String userId, @Valid @RequestBody CartItem item) {
        return ResponseEntity.ok(cartService.addItem(userId, item));
    }

    @PutMapping("/{userId}/items/{productId}")
    public ResponseEntity<Cart> updateItemQuantity(
            @PathVariable String userId,
            @PathVariable Long productId,
            @RequestBody Map<String, Object> request) {
        int quantity = 1;
        if (request != null && request.containsKey("quantity")) {
            Object qObj = request.get("quantity");
            if (qObj instanceof Number num) {
                quantity = num.intValue();
            } else if (qObj instanceof String str) {
                try {
                    quantity = Integer.parseInt(str.trim());
                } catch (NumberFormatException ignored) {}
            }
        }
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, productId, quantity));
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<Cart> removeItem(
            @PathVariable String userId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(cartService.removeItem(userId, productId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, String>> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(Map.of("message", "Cart cleared successfully"));
    }
}

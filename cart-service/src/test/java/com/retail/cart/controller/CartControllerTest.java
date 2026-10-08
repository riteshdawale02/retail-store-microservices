package com.retail.cart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.cart.model.Cart;
import com.retail.cart.model.CartItem;
import com.retail.cart.service.CartService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
public class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartService cartService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/cart/{userId} returns active shopping cart")
    void testGetCart() throws Exception {
        Cart cart = new Cart("user-101");
        CartItem item = new CartItem(1L, "Wireless Mouse", new BigDecimal("25.00"), 2, "http://example.com/mouse.jpg");
        cart.getItems().add(item);
        cart.recalculate();

        when(cartService.getCart("user-101")).thenReturn(cart);

        mockMvc.perform(get("/api/cart/user-101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-101"))
                .andExpect(jsonPath("$.items[0].productName").value("Wireless Mouse"))
                .andExpect(jsonPath("$.totalAmount").value(50.00));
    }

    @Test
    @DisplayName("POST /api/cart/{userId}/items adds item to cart")
    void testAddItem() throws Exception {
        CartItem item = new CartItem(2L, "USB-C Hub", new BigDecimal("40.00"), 1, "http://example.com/hub.jpg");
        Cart cart = new Cart("user-101");
        cart.getItems().add(item);
        cart.recalculate();

        when(cartService.addItem(eq("user-101"), any(CartItem.class))).thenReturn(cart);

        mockMvc.perform(post("/api/cart/user-101/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(item)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-101"))
                .andExpect(jsonPath("$.items[0].productName").value("USB-C Hub"));
    }

    @Test
    @DisplayName("DELETE /api/cart/{userId} clears all items from cart")
    void testClearCart() throws Exception {
        mockMvc.perform(delete("/api/cart/user-101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Cart cleared successfully"));
    }
}

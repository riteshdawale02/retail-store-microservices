package com.retail.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.product.model.Product;
import com.retail.product.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/products should return list of products")
    void testGetAllProducts() throws Exception {
        Product p = new Product();
        p.setId(1L);
        p.setName("Test Laptop");
        p.setPrice(new BigDecimal("999.99"));
        p.setStockQuantity(10);
        p.setCategory("Electronics");

        when(productService.getAllProducts(null, null)).thenReturn(Arrays.asList(p));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Laptop"))
                .andExpect(jsonPath("$[0].price").value(999.99));
    }

    @Test
    @DisplayName("GET /api/products/{id} should return 404 when product not found")
    void testGetProductNotFound() throws Exception {
        when(productService.getProductById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/products without RETAILER role should return 403 Forbidden")
    void testCreateProductForbiddenForStandardUser() throws Exception {
        Product p = new Product();
        p.setName("New Item");
        p.setPrice(new BigDecimal("29.99"));
        p.setStockQuantity(5);
        p.setCategory("General");

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p))
                        .header("X-User-Role", "USER"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/products with RETAILER role should create product")
    void testCreateProductAllowedForRetailer() throws Exception {
        Product p = new Product();
        p.setName("Retailer Item");
        p.setPrice(new BigDecimal("49.99"));
        p.setStockQuantity(20);
        p.setCategory("General");

        Product created = new Product();
        created.setId(10L);
        created.setName("Retailer Item");
        created.setPrice(new BigDecimal("49.99"));
        created.setStockQuantity(20);
        created.setCategory("General");

        when(productService.createProduct(any(Product.class))).thenReturn(created);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p))
                        .header("X-User-Role", "RETAILER"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Retailer Item"));
    }
}

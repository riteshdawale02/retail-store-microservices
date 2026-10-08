package com.retail.product.controller;

import com.retail.product.model.Product;
import com.retail.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getAllProducts(category, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }

    @PostMapping
    public ResponseEntity<?> createProduct(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @Valid @RequestBody Product product) {
        if (userRole == null || !userRole.equalsIgnoreCase("RETAILER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "Forbidden",
                    "message", "Access denied: Only users with the RETAILER role can add products to the catalog."
            ));
        }
        Product created = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        return productService.updateProduct(id, product)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<Map<String, Object>> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        Integer quantity = request.getOrDefault("quantity", 1);
        boolean success = productService.updateStock(id, quantity);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Stock updated successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Insufficient stock or product not found"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long id) {
        if (userRole == null || !userRole.equalsIgnoreCase("RETAILER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "Forbidden",
                    "message", "Access denied: Only users with the RETAILER role can delete products."
            ));
        }
        if (productService.deleteProduct(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

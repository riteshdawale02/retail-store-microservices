package com.retail.cart.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Cart implements Serializable {
    private static final long serialVersionUID = 1L;

    private String userId;
    private List<CartItem> items = new ArrayList<>();
    private BigDecimal totalAmount = BigDecimal.ZERO;
    private Integer totalItems = 0;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public Cart() {
        this.items = new ArrayList<>();
        this.updatedAt = LocalDateTime.now();
    }

    public Cart(String userId) {
        this.userId = userId;
        this.items = new ArrayList<>();
        this.updatedAt = LocalDateTime.now();
    }

    public void recalculate() {
        if (items == null) {
            items = new ArrayList<>();
        }
        totalAmount = items.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        totalItems = items.stream()
                .mapToInt(i -> i.getQuantity() != null ? i.getQuantity() : 0)
                .sum();
        updatedAt = LocalDateTime.now();
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<CartItem> getItems() {
        if (items == null) {
            items = new ArrayList<>();
        }
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items != null ? items : new ArrayList<>();
        recalculate();
    }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

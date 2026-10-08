package com.retail.cart.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CartItem implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull
    private Long productId;
    private String productName;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal unitPrice;

    @NotNull
    @Min(1)
    private Integer quantity;

    private String imageUrl;
    private BigDecimal subtotal;

    public CartItem() {
    }

    public CartItem(Long productId, String productName, BigDecimal unitPrice, Integer quantity, String imageUrl) {
        this.productId = productId;
        this.productName = productName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
        this.subtotal = calculateSubtotal();
    }

    public BigDecimal calculateSubtotal() {
        if (unitPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public BigDecimal getSubtotal() {
        if (subtotal != null) {
            return subtotal;
        }
        return calculateSubtotal();
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        this.subtotal = calculateSubtotal();
    }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.subtotal = calculateSubtotal();
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}

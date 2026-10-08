package com.retail.order.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CheckoutRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "customerName is required")
    private String customerName;

    @NotBlank(message = "customerEmail is required")
    private String customerEmail;

    @NotBlank(message = "shippingAddress is required")
    private String shippingAddress;

    // Optional direct items if checkout bypasses cart
    private List<OrderItemDto> items;

    public CheckoutRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }

    public static class OrderItemDto {
        private Long productId;
        private String productName;
        private Double unitPrice;
        private Integer quantity;
        private String imageUrl;

        public OrderItemDto() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
}

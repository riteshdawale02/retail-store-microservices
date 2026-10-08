package com.retail.order.dto;

import com.retail.order.model.Order;

public class CheckoutResponse {
    private boolean success;
    private String message;
    private Order order;

    public CheckoutResponse() {}

    public CheckoutResponse(boolean success, String message, Order order) {
        this.success = success;
        this.message = message;
        this.order = order;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
}

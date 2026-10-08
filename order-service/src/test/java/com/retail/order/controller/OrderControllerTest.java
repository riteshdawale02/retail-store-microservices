package com.retail.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.order.dto.CheckoutRequest;
import com.retail.order.dto.CheckoutResponse;
import com.retail.order.model.Order;
import com.retail.order.model.OrderStatus;
import com.retail.order.service.OrderService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/orders/user/{userId} returns orders for specific user")
    void testGetOrdersByUser() throws Exception {
        Order order = new Order();
        order.setId(1L);
        order.setOrderNumber("ORD-TEST-1001");
        order.setUserId("user-101");
        order.setTotalAmount(new BigDecimal("99.99"));
        order.setStatus(OrderStatus.CONFIRMED);

        when(orderService.getOrdersByUserId("user-101")).thenReturn(Arrays.asList(order));

        mockMvc.perform(get("/api/orders/user/user-101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value("ORD-TEST-1001"))
                .andExpect(jsonPath("$[0].totalAmount").value(99.99));
    }

    @Test
    @DisplayName("GET /api/orders/{id} returns 404 if order does not exist")
    void testGetOrderNotFound() throws Exception {
        when(orderService.getOrderById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/orders/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/orders/checkout creates order successfully")
    void testCheckoutSuccess() throws Exception {
        CheckoutRequest req = new CheckoutRequest();
        req.setUserId("user-101");
        req.setCustomerName("Samir Dhavane");
        req.setCustomerEmail("samir@example.com");
        req.setShippingAddress("123 Cloud St, AWS City");

        Order order = new Order();
        order.setId(5L);
        order.setOrderNumber("ORD-SUCCESS-202");
        order.setTotalAmount(new BigDecimal("150.00"));

        CheckoutResponse resp = new CheckoutResponse(true, "Order placed successfully!", order);

        when(orderService.checkout(any(CheckoutRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.order.orderNumber").value("ORD-SUCCESS-202"));
    }
}

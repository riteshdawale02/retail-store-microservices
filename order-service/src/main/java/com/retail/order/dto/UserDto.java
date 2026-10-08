package com.retail.order.dto;

import com.retail.order.model.User;

public class UserDto {
    private Long id;
    private String userId;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String address;

    public UserDto() {}

    public UserDto(User user) {
        if (user != null) {
            this.id = user.getId();
            this.userId = user.getUserId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.role = user.getRole();
            this.phone = user.getPhone();
            this.address = user.getAddress();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}

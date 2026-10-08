/**
 * CloudRetail - REST API Service Layer
 * Direct communication with Java Spring Boot Microservices through API Gateway
 */

// Use relative /api to leverage Vite dev proxy in development or same-origin in production
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const USER_ID_KEY = 'cloudretail_user_id';

export function getUserId() {
  let uid = localStorage.getItem(USER_ID_KEY);
  if (!uid) {
    uid = 'user-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(USER_ID_KEY, uid);
  }
  return uid;
}

// Fallback seed products in case services are warming up
export const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "UltraBook Pro 16",
    description: "High-performance laptop featuring 32GB RAM, 1TB NVMe SSD, and high-res Retina display.",
    price: 1299.99,
    stockQuantity: 45,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewCount: 128
  },
  {
    id: 2,
    name: "Acoustic ANC Headphones",
    description: "Wireless noise-canceling over-ear headphones with 40h battery life.",
    price: 249.50,
    stockQuantity: 51,
    category: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewCount: 310
  },
  {
    id: 3,
    name: "AeroPulse Smartwatch 5",
    description: "AMOLED fitness smartwatch with ECG, sleep tracker, and GPS navigation.",
    price: 199.00,
    stockQuantity: 117,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviewCount: 85
  },
  {
    id: 4,
    name: "Minimalist Leather Backpack",
    description: "Handcrafted genuine leather backpack with padded laptop sleeve and water resistance.",
    price: 119.00,
    stockQuantity: 60,
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviewCount: 92
  },
  {
    id: 5,
    name: "Ergonomic Mechanical Keyboard",
    description: "Custom mechanical gaming & typing keyboard with hot-swappable tactile switches.",
    price: 149.99,
    stockQuantity: 50,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewCount: 215
  },
  {
    id: 6,
    name: "BrewMaster Espresso Machine",
    description: "Italian 15-bar pressure espresso maker with integrated milk frother.",
    price: 299.00,
    stockQuantity: 34,
    category: "Home & Kitchen",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewCount: 64
  },
  {
    id: 7,
    name: "Studio Wireless Earbuds",
    description: "True wireless IPX7 waterproof earbuds with crystal clear microphone.",
    price: 89.99,
    stockQuantity: 150,
    category: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    rating: 4.5,
    reviewCount: 412
  },
  {
    id: 8,
    name: "Urban Runner Sneakers",
    description: "Breathable responsive running shoes engineered for everyday comfort.",
    price: 95.00,
    stockQuantity: 74,
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviewCount: 180
  },
  {
    id: 9,
    name: "4K Ultra-Wide Curved Monitor",
    description: "34-inch 144Hz curved HDR gaming and productivity workstation display.",
    price: 549.00,
    stockQuantity: 25,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewCount: 78
  },
  {
    id: 10,
    name: "Smart Ambient Desk Lamp",
    description: "Dimmable color-temperature LED desk lamp with wireless smartphone charging base.",
    price: 59.99,
    stockQuantity: 90,
    category: "Home & Kitchen",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviewCount: 53
  }
];

export const api = {
  // Product Catalog
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (Array.isArray(data) && data.length > 0) ? data : FALLBACK_PRODUCTS;
    } catch (err) {
      console.warn('API error fetching products, using fallback:', err);
      return FALLBACK_PRODUCTS;
    }
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
    return await res.json();
  },

  // Shopping Cart (Redis backed)
  async getCart(userId) {
    try {
      const res = await fetch(`${API_BASE}/cart/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API error fetching cart:', err);
      return { userId, items: [], totalAmount: 0, totalItems: 0 };
    }
  },

  async addToCart(userId, item) {
    const res = await fetch(`${API_BASE}/cart/${userId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: item.productId || item.id,
        productName: item.productName || item.name,
        unitPrice: item.unitPrice || item.price,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || null
      })
    });
    if (!res.ok) throw new Error(`Failed to add item: ${res.statusText}`);
    return await res.json();
  },

  async updateQuantity(userId, productId, quantity) {
    const res = await fetch(`${API_BASE}/cart/${userId}/items/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    if (!res.ok) throw new Error(`Failed to update quantity: ${res.statusText}`);
    return await res.json();
  },

  async removeFromCart(userId, productId) {
    const res = await fetch(`${API_BASE}/cart/${userId}/items/${productId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to remove item: ${res.statusText}`);
    return await res.json();
  },

  async clearCart(userId) {
    const res = await fetch(`${API_BASE}/cart/${userId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to clear cart: ${res.statusText}`);
    return await res.json();
  },

  // Checkout & Orders (MySQL + Inter-service call)
  async checkout(payload) {
    const res = await fetch(`${API_BASE}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Checkout failed (${res.status})`);
    }
    return await res.json();
  },

  async getOrders(userId) {
    try {
      const res = await fetch(`${API_BASE}/orders?userId=${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API error fetching orders:', err);
      return [];
    }
  },

  // Auth & User Management (MySQL stored via order-service)
  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(registrationData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  // Retailer Product Management
  async createProduct(product, userRole = 'RETAILER') {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': userRole
      },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create product');
    return data;
  },

  async deleteProduct(productId, userRole = 'RETAILER') {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'X-User-Role': userRole
      }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete product');
    }
    return true;
  },

  // System Health Telemetry
  async getSystemHealth() {
    try {
      const res = await fetch(`${API_BASE}/system/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        overallHealth: 'DEGRADED',
        gatewayStatus: 'DOWN',
        cloudProvider: 'AWS',
        awsRegion: 'us-east-1',
        environment: 'local-dev',
        services: {}
      };
    }
  }
};

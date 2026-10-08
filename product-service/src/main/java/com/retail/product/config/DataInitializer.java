package com.retail.product.config;

import com.retail.product.model.Product;
import com.retail.product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedProducts(ProductRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                List<Product> seedList = List.of(
                    new Product(null, "UltraBook Pro 16", "High-performance laptop featuring 32GB RAM, 1TB NVMe SSD, and high-res Retina display.",
                            new BigDecimal("1299.99"), 45, "Electronics",
                            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80", 4.9, 128),
                    new Product(null, "Acoustic ANC Headphones", "Wireless noise-canceling over-ear headphones with 40h battery life.",
                            new BigDecimal("249.50"), 80, "Audio",
                            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80", 4.8, 310),
                    new Product(null, "AeroPulse Smartwatch 5", "AMOLED fitness smartwatch with ECG, sleep tracker, and GPS navigation.",
                            new BigDecimal("199.00"), 120, "Electronics",
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80", 4.7, 85),
                    new Product(null, "Minimalist Leather Backpack", "Handcrafted genuine leather backpack with padded laptop sleeve and water resistance.",
                            new BigDecimal("119.00"), 60, "Fashion",
                            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80", 4.6, 92),
                    new Product(null, "Ergonomic Mechanical Keyboard", "Custom mechanical gaming & typing keyboard with hot-swappable tactile switches.",
                            new BigDecimal("149.99"), 50, "Electronics",
                            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80", 4.9, 215),
                    new Product(null, "BrewMaster Espresso Machine", "Italian 15-bar pressure espresso maker with integrated milk frother.",
                            new BigDecimal("299.00"), 35, "Home & Kitchen",
                            "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80", 4.8, 64),
                    new Product(null, "Studio Wireless Earbuds", "True wireless IPX7 waterproof earbuds with crystal clear microphone.",
                            new BigDecimal("89.99"), 150, "Audio",
                            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80", 4.5, 412),
                    new Product(null, "Urban Runner Sneakers", "Breathable responsive running shoes engineered for everyday comfort.",
                            new BigDecimal("95.00"), 75, "Fashion",
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80", 4.7, 180),
                    new Product(null, "4K Ultra-Wide Curved Monitor", "34-inch 144Hz curved HDR gaming and productivity workstation display.",
                            new BigDecimal("549.00"), 25, "Electronics",
                            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80", 4.9, 78),
                    new Product(null, "Smart Ambient Desk Lamp", "Dimmable color-temperature LED desk lamp with wireless smartphone charging base.",
                            new BigDecimal("59.99"), 90, "Home & Kitchen",
                            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80", 4.6, 53)
                );
                repository.saveAll(seedList);
            }
        };
    }
}

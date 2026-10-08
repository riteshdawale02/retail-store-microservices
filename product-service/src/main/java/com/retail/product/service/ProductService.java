package com.retail.product.service;

import com.retail.product.model.Product;
import com.retail.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts(String category, String search) {
        if (category != null && !category.trim().isEmpty()) {
            return productRepository.findByCategoryIgnoreCase(category.trim());
        }
        if (search != null && !search.trim().isEmpty()) {
            return productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search.trim(), search.trim());
        }
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public Optional<Product> updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updatedProduct.getName());
            existing.setDescription(updatedProduct.getDescription());
            existing.setPrice(updatedProduct.getPrice());
            existing.setStockQuantity(updatedProduct.getStockQuantity());
            existing.setCategory(updatedProduct.getCategory());
            existing.setImageUrl(updatedProduct.getImageUrl());
            if (updatedProduct.getRating() != null) {
                existing.setRating(updatedProduct.getRating());
            }
            return productRepository.save(existing);
        });
    }

    @Transactional
    public boolean updateStock(Long id, int quantityToDeduct) {
        int updatedRows = productRepository.decrementStock(id, quantityToDeduct);
        return updatedRows > 0;
    }

    @Transactional
    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

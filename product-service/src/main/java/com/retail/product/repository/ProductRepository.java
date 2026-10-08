package com.retail.product.repository;

import com.retail.product.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryIgnoreCase(String category);

    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String nameKeyword, String descKeyword);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL ORDER BY p.category ASC")
    List<String> findDistinctCategories();

    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.id = :id AND p.stockQuantity >= :quantity")
    int decrementStock(@Param("id") Long id, @Param("quantity") Integer quantity);
}

package com.rain.finapp.repository;

import com.rain.finapp.model.Category;
import com.rain.finapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    // Find all categories for a specific user
    List<Category> findByUserOrderByNameAsc(User user);

    // Find a category by name and user
    Optional<Category> findByUserAndName(User user, String name);

    // Find a category by ID and user (for ownership verification)
    Optional<Category> findByCategoryIdAndUser(UUID categoryId, User user);

    // Check if category exists for user
    boolean existsByUserAndName(User user, String name);
}

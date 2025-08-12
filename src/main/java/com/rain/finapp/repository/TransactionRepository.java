package com.rain.finapp.repository;

import com.rain.finapp.model.Transaction;
import com.rain.finapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // Find all transactions for a specific user
    List<Transaction> findByUserOrderByTransactionDateDesc(User user);

    // Find transactions for a user within a date range
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserAndDateRange(@Param("user") User user, 
                                           @Param("startDate") OffsetDateTime startDate, 
                                           @Param("endDate") OffsetDateTime endDate);

    // Find transactions for a user by category
    List<Transaction> findByUserAndCategoryOrderByTransactionDateDesc(User user, String category);

    // Find a transaction by ID and user (for ownership verification)
    Optional<Transaction> findByTransactionIdAndUser(UUID transactionId, User user);

    // Get distinct categories for a user
    @Query("SELECT DISTINCT t.category FROM Transaction t WHERE t.user = :user ORDER BY t.category")
    List<String> findDistinctCategoriesByUser(@Param("user") User user);

    // Count transactions by user
    long countByUser(User user);

    // Find recent transactions (last 30 days)
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.transactionDate >= :thirtyDaysAgo ORDER BY t.transactionDate DESC")
    List<Transaction> findRecentTransactionsByUser(@Param("user") User user, @Param("thirtyDaysAgo") OffsetDateTime thirtyDaysAgo);

    // Find transactions by user and category
    List<Transaction> findTransactionsByUserAndCategory(User user, String category);

}

package com.rain.finapp.service;

import com.rain.finapp.dto.TransactionRequest;
import com.rain.finapp.dto.TransactionResponse;
import com.rain.finapp.model.Category;
import com.rain.finapp.model.Transaction;
import com.rain.finapp.model.TransactionType;
import com.rain.finapp.model.User;
import com.rain.finapp.repository.CategoryRepository;
import com.rain.finapp.repository.TransactionRepository;
import com.rain.finapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository, 
                            UserRepository userRepository,
                            CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    /**
     * Create a new transaction for the specified user
     */
    public TransactionResponse createTransaction(String username, TransactionRequest request) {
        User user = getUserByUsername(username);
        
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setDescription(request.getDescription());
        transaction.setType(request.getType());
        
        // Use provided date or default to now
        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }
        
        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToResponse(savedTransaction);
    }

    /**
     * Get all transactions for a user
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions(String username) {
        User user = getUserByUsername(username);
        List<Transaction> transactions = transactionRepository.findByUserOrderByTransactionDateDesc(user);
        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get transactions for a user within a date range
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByDateRange(String username, OffsetDateTime startDate, OffsetDateTime endDate) {
        User user = getUserByUsername(username);
        List<Transaction> transactions = transactionRepository.findByUserAndDateRange(user, startDate, endDate);
        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get transactions for a user by category
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByCategory(String username, String category) {
        User user = getUserByUsername(username);
        List<Transaction> transactions = transactionRepository.findByUserAndCategoryOrderByTransactionDateDesc(user, category);
        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update a transaction (only if user owns it)
     */
    public TransactionResponse updateTransaction(String username, UUID transactionId, TransactionRequest request) {
        User user = getUserByUsername(username);
        
        Optional<Transaction> optionalTransaction = transactionRepository.findByTransactionIdAndUser(transactionId, user);
        if (optionalTransaction.isEmpty()) {
            throw new RuntimeException("Transaction not found or you don't have permission to edit it");
        }
        
        Transaction transaction = optionalTransaction.get();
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setDescription(request.getDescription());
        
        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }
        
        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToResponse(savedTransaction);
    }

    /**
     * Delete a transaction (only if user owns it)
     */
    public void deleteTransaction(String username, UUID transactionId) {
        User user = getUserByUsername(username);
        
        Optional<Transaction> optionalTransaction = transactionRepository.findByTransactionIdAndUser(transactionId, user);
        if (optionalTransaction.isEmpty()) {
            throw new RuntimeException("Transaction not found or you don't have permission to delete it");
        }
        
        transactionRepository.delete(optionalTransaction.get());
    }

    /**
     * Get a single transaction by ID (only if user owns it)
     */
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(String username, UUID transactionId) {
        User user = getUserByUsername(username);
        
        Optional<Transaction> optionalTransaction = transactionRepository.findByTransactionIdAndUser(transactionId, user);
        if (optionalTransaction.isEmpty()) {
            throw new RuntimeException("Transaction not found or you don't have permission to view it");
        }
        
        return mapToResponse(optionalTransaction.get());
    }

    /**
     * Get distinct categories for a user
     */
    @Transactional(readOnly = true)
    public List<String> getUserCategories(String username) {
        User user = getUserByUsername(username);
        
        // Get categories from the categories table ordered by creation timestamp
        List<Category> savedCategories = categoryRepository.findByUserOrderByCreatedAtDesc(user);
        Set<String> allCategories = savedCategories.stream()
                .map(Category::getName)
                .collect(Collectors.toCollection(LinkedHashSet::new)); // Use LinkedHashSet to preserve order
        
        // Also include categories that appear in transactions but might not be in categories table
        List<String> transactionCategories = transactionRepository.findDistinctCategoriesByUser(user);
        allCategories.addAll(transactionCategories);
        
        // Convert to list while preserving the timestamp order for saved categories
        return new ArrayList<>(allCategories);
    }

    /**
     * Get recent transactions (last 30 days)
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions(String username) {
        User user = getUserByUsername(username);
        OffsetDateTime thirtyDaysAgo = OffsetDateTime.now().minusDays(30);
        List<Transaction> transactions = transactionRepository.findRecentTransactionsByUser(user, thirtyDaysAgo);
        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get transaction count for a user
     */
    @Transactional(readOnly = true)
    public long getTransactionCount(String username) {
        User user = getUserByUsername(username);
        return transactionRepository.countByUser(user);
    }

    /**
     * Get category budgets with current spending (expenses only)
     * Income is not included in category budgets - it contributes to overall monthly budget instead
     */
    @Transactional(readOnly = true)
    public Map<String, CategoryBudgetInfo> getCategoryBudgets(String username) {
        User user = getUserByUsername(username);
        
        // Get all categories with budgets
        List<Category> categories = categoryRepository.findByUserOrderByNameAsc(user);
        
        // Get all transactions for calculating spending
        List<Transaction> transactions = transactionRepository.findByUserOrderByTransactionDateDesc(user);
        
        // Calculate spending per category (expenses only)
        Map<String, BigDecimal> categorySpending = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        
        // Build result map
        Map<String, CategoryBudgetInfo> result = new HashMap<>();
        
        // Add categories with budgets
        for (Category category : categories) {
            if (category.getBudget() != null && category.getBudget().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal spent = categorySpending.getOrDefault(category.getName(), BigDecimal.ZERO);
                result.put(category.getName(), new CategoryBudgetInfo(category.getBudget(), spent));
            }
        }
        
        return result;
    }

    /**
     * Set or update budget for a category
     */
    public void setCategoryBudget(String username, String categoryName, BigDecimal budget) {
        User user = getUserByUsername(username);
        
        Optional<Category> existingCategory = categoryRepository.findByUserAndName(user, categoryName);
        
        if (existingCategory.isPresent()) {
            Category category = existingCategory.get();
            category.setBudget(budget);
            categoryRepository.save(category);
        } else {
            // Create new category with budget
            Category category = new Category(user, categoryName, budget);
            categoryRepository.save(category);
        }
    }

    /**
     * Create a new category
     */
    public void createCategory(String username, String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        
        categoryName = categoryName.trim();
        User user = getUserByUsername(username);
        
        // Check if category already exists
        if (categoryRepository.existsByUserAndName(user, categoryName)) {
            throw new IllegalArgumentException("Category '" + categoryName + "' already exists");
        }
        
        // Create new category
        Category category = new Category(user, categoryName, null);
        categoryRepository.save(category);
    }

    /**
     * Delete a category for a user
     */
    @Transactional
    public void deleteCategory(String username, String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        
        categoryName = categoryName.trim();
        User user = getUserByUsername(username);
        
        // Prevent deletion of Income category
        if ("Income".equals(categoryName)) {
            throw new IllegalArgumentException("Cannot delete the Income category");
        }
        
        // Find the category
        Optional<Category> categoryOpt = categoryRepository.findByUserAndName(user, categoryName);
        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Category '" + categoryName + "' does not exist");
        }
        
        // Check if there are any transactions using this category
        List<Transaction> transactionsWithCategory = transactionRepository.findTransactionsByUserAndCategory(user, categoryName);
        if (!transactionsWithCategory.isEmpty()) {
            throw new IllegalArgumentException("Cannot delete category '" + categoryName + "' because it has " + 
                transactionsWithCategory.size() + " transaction(s). Delete or move the transactions first.");
        }
        
        // Delete the category
        categoryRepository.delete(categoryOpt.get());
    }

    /**
     * Inner class for category budget information
     * 'spent' represents expenses only for the category (income is tracked separately in overall budget)
     */
    public static class CategoryBudgetInfo {
        private final BigDecimal budget;
        private final BigDecimal spent;

        public CategoryBudgetInfo(BigDecimal budget, BigDecimal spent) {
            this.budget = budget;
            this.spent = spent;
        }

        public BigDecimal getBudget() {
            return budget;
        }

        public BigDecimal getSpent() {
            return spent;
        }

        public BigDecimal getRemaining() {
            return budget.subtract(spent);
        }

        public double getPercentageUsed() {
            if (budget.compareTo(BigDecimal.ZERO) == 0) return 0;
            return spent.divide(budget, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
        }
    }

    // Helper methods
    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getTransactionId(),
                transaction.getUser().getUserId(),
                transaction.getUser().getUsername(),
                transaction.getAmount(),
                transaction.getCategory(),
                transaction.getTransactionDate(),
                transaction.getDescription(),
                transaction.getType(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }
}

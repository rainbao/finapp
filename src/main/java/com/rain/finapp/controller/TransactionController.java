package com.rain.finapp.controller;

import com.rain.finapp.dto.TransactionRequest;
import com.rain.finapp.dto.TransactionResponse;
import com.rain.finapp.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Create a new transaction
     * POST /api/transactions
     */
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        TransactionResponse response = transactionService.createTransaction(username, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get all transactions for the current user
     * GET /api/transactions
     * Optional query parameters: startDate, endDate, category
     */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @RequestParam(required = false) String category,
            Authentication authentication) {
        
        String username = authentication.getName();
        List<TransactionResponse> transactions;
        
        if (startDate != null && endDate != null) {
            transactions = transactionService.getTransactionsByDateRange(username, startDate, endDate);
        } else if (category != null && !category.trim().isEmpty()) {
            transactions = transactionService.getTransactionsByCategory(username, category);
        } else {
            transactions = transactionService.getAllTransactions(username);
        }
        
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get a specific transaction by ID
     * GET /api/transactions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String username = authentication.getName();
        TransactionResponse transaction = transactionService.getTransactionById(username, id);
        return ResponseEntity.ok(transaction);
    }

    /**
     * Update a transaction
     * PUT /api/transactions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        TransactionResponse response = transactionService.updateTransaction(username, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a transaction
     * DELETE /api/transactions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String username = authentication.getName();
        transactionService.deleteTransaction(username, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get user's transaction categories
     * GET /api/transactions/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories(Authentication authentication) {
        String username = authentication.getName();
        List<String> categories = transactionService.getUserCategories(username);
        return ResponseEntity.ok(categories);
    }

    /**
     * Get recent transactions (last 30 days)
     * GET /api/transactions/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<List<TransactionResponse>> getRecentTransactions(Authentication authentication) {
        String username = authentication.getName();
        List<TransactionResponse> transactions = transactionService.getRecentTransactions(username);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transaction count for user
     * GET /api/transactions/count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getTransactionCount(Authentication authentication) {
        String username = authentication.getName();
        long count = transactionService.getTransactionCount(username);
        return ResponseEntity.ok(count);
    }

    /**
     * Get category budgets with spending information
     * GET /api/transactions/category-budgets
     */
    @GetMapping("/category-budgets")
    public ResponseEntity<Map<String, TransactionService.CategoryBudgetInfo>> getCategoryBudgets(Authentication authentication) {
        String username = authentication.getName();
        Map<String, TransactionService.CategoryBudgetInfo> budgets = transactionService.getCategoryBudgets(username);
        return ResponseEntity.ok(budgets);
    }

    /**
     * Set budget for a category
     * POST /api/transactions/category-budget
     */
    @PostMapping("/category-budget")
    public ResponseEntity<Map<String, String>> setCategoryBudget(
            @RequestParam String category,
            @RequestParam BigDecimal budget,
            Authentication authentication) {
        
        String username = authentication.getName();
        transactionService.setCategoryBudget(username, category, budget);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Budget set successfully");
        response.put("category", category);
        response.put("budget", budget.toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Create a new category
     * POST /api/transactions/categories
     */
    @PostMapping("/categories")
    public ResponseEntity<Map<String, String>> createCategory(
            @RequestParam String name,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        try {
            transactionService.createCategory(username, name);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category created successfully");
            response.put("name", name);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * DELETE /api/transactions/categories/{categoryName}
     */
    @DeleteMapping("/categories/{categoryName}")
    public ResponseEntity<Map<String, String>> deleteCategory(
            @PathVariable String categoryName,
            Authentication authentication) {
        
        String username = authentication.getName();
        
        try {
            transactionService.deleteCategory(username, categoryName);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category deleted successfully");
            response.put("name", categoryName);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
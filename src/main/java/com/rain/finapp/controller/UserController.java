package com.rain.finapp.controller;

import com.rain.finapp.model.User;
import com.rain.finapp.repository.UserRepository;
import com.rain.finapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return Map.of("error", "Not authenticated");
        }
        Optional<User> userOpt = userRepository.findByUsername(userDetails.getUsername());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "userId", user.getUserId(),
                "monthlyBudget", user.getMonthlyBudget() != null ? user.getMonthlyBudget() : BigDecimal.ZERO
            );
        } else {
            return Map.of("error", "User not found");
        }
    }

    @GetMapping("/user/monthly-budget")
    public ResponseEntity<Map<String, Object>> getMonthlyBudget(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            BigDecimal monthlyBudget = userService.getMonthlyBudget(userDetails.getUsername());
            return ResponseEntity.ok(Map.of("monthlyBudget", monthlyBudget));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/user/monthly-budget")
    public ResponseEntity<Map<String, Object>> updateMonthlyBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            String budgetStr = request.get("monthlyBudget");
            if (budgetStr == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Monthly budget is required"));
            }

            BigDecimal monthlyBudget = new BigDecimal(budgetStr);
            if (monthlyBudget.compareTo(BigDecimal.ZERO) < 0) {
                return ResponseEntity.status(400).body(Map.of("error", "Monthly budget cannot be negative"));
            }

            User updatedUser = userService.updateMonthlyBudget(userDetails.getUsername(), monthlyBudget);
            return ResponseEntity.ok(Map.of(
                "message", "Monthly budget updated successfully",
                "monthlyBudget", updatedUser.getMonthlyBudget()
            ));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid budget amount"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

}
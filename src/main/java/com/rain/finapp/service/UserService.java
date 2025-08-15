package com.rain.finapp.service;

import com.rain.finapp.model.User;
import com.rain.finapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) { 
        this.userRepository = userRepository; 
    }

    public List<User> getAllUsers() {
         return userRepository.findAll(); 
        }

    public long getUserCount() { 
        return userRepository.count(); }

    public void insertUser(User user) {
        userRepository.save(user);
    }

    public List<User> findByUsername(String username) {
        return userRepository.findAll().stream()
                .filter(user -> user.getUsername().equalsIgnoreCase(username))
                .toList();
    }

    public User findById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User updateMonthlyBudget(String username, BigDecimal monthlyBudget) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setMonthlyBudget(monthlyBudget);
        return userRepository.save(user);
    }

    public BigDecimal getMonthlyBudget(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getMonthlyBudget() != null ? user.getMonthlyBudget() : BigDecimal.ZERO;
    }   
}
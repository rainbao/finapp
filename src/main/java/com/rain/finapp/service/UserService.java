package com.rain.finapp.service;

import com.rain.finapp.model.User;
import com.rain.finapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.List;

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
}
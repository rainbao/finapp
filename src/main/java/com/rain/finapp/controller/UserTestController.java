package com.rain.finapp.controller;

import com.rain.finapp.model.User;
import com.rain.finapp.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;
import java.util.List;

@RestController
public class UserTestController {
    private final UserService userService;
    public UserTestController(UserService userService) { this.userService = userService; }

    @GetMapping("/test-users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/test-user-count")
    public long getUserCount() {
        return userService.getUserCount();
    }

    @PostMapping("/test-users")
    public void addUser(User user) {
        userService.insertUser(user);
    }

    @GetMapping("/test-users/last-name")
    public List<User> findByLastName(String lastName) {
        return userService.findByLastName(lastName);
    }

    @GetMapping("/test-users/{userId}")
    public User findById(UUID userId) {
        return userService.findById(userId);
    }

}
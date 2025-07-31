package com.rain.finapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/")
    public String home() {
        return "Hello, your Spring Boot app is running!";
        //typically, you might want to return a more complex object or view
        //i.e. return index.html or a model object
        //but for a simple test, returning a string is sufficient.

        // You can also return a ResponseEntity for more control over the response
        // return ResponseEntity.ok("Hello, your Spring Boot app is running!");
    }
}

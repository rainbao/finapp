package com.rain.finapp.controller;

import com.rain.finapp.config.CookieConfig;
import com.rain.finapp.service.AuthService;
import com.rain.finapp.dto.RegisterRequest;
import com.rain.finapp.dto.LoginRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService authService;
    private final CookieConfig cookieConfig;

    public AuthController(AuthService authService, CookieConfig cookieConfig) {
        this.authService = authService;
        this.cookieConfig = cookieConfig;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Call the service to register the user
            authService.register(request.getUsername(), request.getEmail(), request.getPassword());
            return ResponseEntity.ok("Registration successful");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Account with this email or username already exists");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        // Call the service to authenticate the user
        String token = authService.login(request.getUsername(), request.getPassword());
        if (token != null) {
            // Create secure HTTP-only cookie with JWT
            Cookie authCookie = new Cookie(cookieConfig.getName(), token);
            authCookie.setHttpOnly(cookieConfig.isHttpOnly());
            authCookie.setSecure(cookieConfig.isSecure());
            authCookie.setMaxAge((int) cookieConfig.getMaxAge());
            authCookie.setPath(cookieConfig.getPath());
            // Note: SameSite is set via response header as it's not directly supported in Cookie class
            response.addCookie(authCookie);
            response.setHeader("Set-Cookie", 
                String.format("%s=%s; Path=%s; Max-Age=%d; HttpOnly; SameSite=%s%s",
                    cookieConfig.getName(), token, cookieConfig.getPath(), 
                    cookieConfig.getMaxAge(), cookieConfig.getSameSite(),
                    cookieConfig.isSecure() ? "; Secure" : ""));
            
            return ResponseEntity.ok().body(new AuthResponse("Login successful"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Clear the auth cookie
        Cookie clearCookie = new Cookie(cookieConfig.getName(), "");
        clearCookie.setMaxAge(0);
        clearCookie.setPath(cookieConfig.getPath());
        clearCookie.setHttpOnly(true);
        response.addCookie(clearCookie);
        
        return ResponseEntity.ok().body("Logout successful");
    }
    
    public static class AuthResponse {
        private String message;
        
        public AuthResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}

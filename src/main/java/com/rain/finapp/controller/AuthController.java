package com.rain.finapp.controller;

import com.rain.finapp.config.AuthConfig;
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
    private final AuthConfig authConfig;
    private final CookieConfig cookieConfig;

    public AuthController(AuthService authService, AuthConfig authConfig, CookieConfig cookieConfig) {
        this.authService = authService;
        this.authConfig = authConfig;
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
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, 
                                  @RequestParam(value = "authMode", required = false) String authMode,
                                  HttpServletResponse response) {
        // Call the service to authenticate the user
        String token = authService.login(request.getUsername(), request.getPassword());
        if (token != null) {
            // Determine which authentication mode to use
            String effectiveAuthMode = determineAuthMode(authMode);
            
            if ("cookie".equals(effectiveAuthMode)) {
                // Set HTTP-only cookie
                Cookie authCookie = new Cookie("auth-token", token);
                authCookie.setHttpOnly(true);
                authCookie.setSecure(cookieConfig.isSecure());
                authCookie.setMaxAge((int) cookieConfig.getMaxAge());
                authCookie.setPath(cookieConfig.getPath());
                response.addCookie(authCookie);
                
                return ResponseEntity.ok().body(new AuthResponse("cookie", "Login successful", null));
            } else if ("jwt".equals(effectiveAuthMode)) {
                // Return JWT token in response body
                return ResponseEntity.ok().body(new AuthResponse("jwt", "Login successful", token));
            } else { // "both"
                // Set HTTP-only cookie AND return JWT token
                Cookie authCookie = new Cookie("auth-token", token);
                authCookie.setHttpOnly(true);
                authCookie.setSecure(cookieConfig.isSecure());
                authCookie.setMaxAge((int) cookieConfig.getMaxAge());
                authCookie.setPath(cookieConfig.getPath());
                response.addCookie(authCookie);
                
                return ResponseEntity.ok().body(new AuthResponse("both", "Login successful", token));
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Clear the auth cookie if it exists
        Cookie clearCookie = new Cookie("auth-token", "");
        clearCookie.setMaxAge(0);
        clearCookie.setPath(cookieConfig.getPath());
        clearCookie.setHttpOnly(true);
        response.addCookie(clearCookie);
        
        return ResponseEntity.ok().body("Logout successful");
    }
    
    @GetMapping("/auth/config")
    public ResponseEntity<?> getAuthConfig() {
        return ResponseEntity.ok().body(new AuthConfigResponse(
            authConfig.getMode(),
            authConfig.isJwtEnabled(),
            authConfig.isCookieEnabled(),
            authConfig.isDualMode()
        ));
    }
    
    private String determineAuthMode(String requestedMode) {
        // If a specific mode is requested and it's supported, use it
        if (requestedMode != null) {
            switch (requestedMode.toLowerCase()) {
                case "jwt":
                    return authConfig.isJwtEnabled() ? "jwt" : authConfig.getMode();
                case "cookie":
                    return authConfig.isCookieEnabled() ? "cookie" : authConfig.getMode();
                case "both":
                    return authConfig.isDualMode() ? "both" : authConfig.getMode();
            }
        }
        // Otherwise, use the configured default mode
        return authConfig.getMode();
    }

    public static class AuthResponse {
        private String authMode;
        private String message;
        private String token;
        
        public AuthResponse(String authMode, String message, String token) {
            this.authMode = authMode;
            this.message = message;
            this.token = token;
        }
        
        public String getAuthMode() { return authMode; }
        public void setAuthMode(String authMode) { this.authMode = authMode; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public static class AuthConfigResponse {
        private String mode;
        private boolean jwtEnabled;
        private boolean cookieEnabled;
        private boolean dualMode;
        
        public AuthConfigResponse(String mode, boolean jwtEnabled, boolean cookieEnabled, boolean dualMode) {
            this.mode = mode;
            this.jwtEnabled = jwtEnabled;
            this.cookieEnabled = cookieEnabled;
            this.dualMode = dualMode;
        }
        
        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }
        
        public boolean isJwtEnabled() { return jwtEnabled; }
        public void setJwtEnabled(boolean jwtEnabled) { this.jwtEnabled = jwtEnabled; }
        
        public boolean isCookieEnabled() { return cookieEnabled; }
        public void setCookieEnabled(boolean cookieEnabled) { this.cookieEnabled = cookieEnabled; }
        
        public boolean isDualMode() { return dualMode; }
        public void setDualMode(boolean dualMode) { this.dualMode = dualMode; }
    }

    // Keeping old JwtResponse for backward compatibility
    public static class JwtResponse {
        private String token;
        public JwtResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}

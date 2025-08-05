package com.rain.finapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "auth")
public class AuthConfig {
    
    private String mode = "jwt"; // Default to JWT only
    
    // Getters and setters
    public String getMode() {
        return mode;
    }
    
    public void setMode(String mode) {
        this.mode = mode;
    }
    
    // Helper methods
    public boolean isJwtEnabled() {
        return "jwt".equals(mode) || "both".equals(mode);
    }
    
    public boolean isCookieEnabled() {
        return "cookie".equals(mode) || "both".equals(mode);
    }
    
    public boolean isDualMode() {
        return "both".equals(mode);
    }
}

package com.rain.finapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "cookie")
public class CookieConfig {
    
    private String name = "auth-token";
    private boolean secure = false;
    private long maxAge = 900; // Default 15 minutes if not specified
    private String sameSite = "Strict";
    private String path = "/";
    private boolean httpOnly = true; // Always true for security
    
    // Getters and setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public boolean isSecure() {
        return secure;
    }
    
    public void setSecure(boolean secure) {
        this.secure = secure;
    }
    
    public long getMaxAge() {
        return maxAge;
    }
    
    public void setMaxAge(long maxAge) {
        this.maxAge = maxAge;
    }
    
    public String getSameSite() {
        return sameSite;
    }
    
    public void setSameSite(String sameSite) {
        this.sameSite = sameSite;
    }
    
    public String getPath() {
        return path;
    }
    
    public void setPath(String path) {
        this.path = path;
    }
    
    public boolean isHttpOnly() {
        return httpOnly;
    }
    
    public void setHttpOnly(boolean httpOnly) {
        this.httpOnly = httpOnly;
    }
}

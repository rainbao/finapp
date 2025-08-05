package com.rain.finapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "cookie")
public class CookieConfig {
    
    private boolean secure = false;
    private long maxAge = 604800; // 7 days in seconds
    private String sameSite = "Strict";
    private String path = "/";
    private boolean httpOnly = true; // Always true for security
    
    // Getters and setters
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

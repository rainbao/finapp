package com.rain.finapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
    
    /**
     * Serve the Brooks landing page for the root path
     */
    @GetMapping("/")
    public String landingPage() {
        return "forward:/index.html";
    }
    
    /**
     * Serve the Brooks landing page for /home
     */
    @GetMapping("/home")
    public String home() {
        return "forward:/index.html";
    }
    
    /**
     * Serve the Brooks landing page for /landing
     */
    @GetMapping("/landing")
    public String landing() {
        return "forward:/index.html";
    }
    
    /**
     * Serve the login page
     */
    @GetMapping("/login")
    public String login() {
        return "forward:/login.html";
    }
    
    /**
     * Serve the register page
     */
    @GetMapping("/register")
    public String register() {
        return "forward:/register.html";
    }
    
    /**
     * Serve the dashboard page (requires authentication)
     */
    @GetMapping("/dashboard")
    public String dashboard() {
        return "forward:/dashboard.html";
    }
    
    /**
     * Serve the debug page
     */
    @GetMapping("/debug")
    public String debug() {
        return "forward:/debug.html";
    }
}

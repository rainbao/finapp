package com.rain.finapp.filter;

import com.rain.finapp.config.CookieConfig;
import com.rain.finapp.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;
    
    @Autowired
    private CookieConfig cookieConfig;

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;

        // Extract JWT token from HTTP-only cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieConfig.getName().equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // If we have a token, validate it
        if (token != null && !token.isEmpty()) {
            try {
                Claims claims = jwtUtil.validateToken(token);
                request.setAttribute("claims", claims);
                
                String username = claims.get("username", String.class);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                Authentication auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
                
            } catch (Exception e) {
                // Clear the invalid/expired cookie
                Cookie clearCookie = new Cookie(cookieConfig.getName(), "");
                clearCookie.setMaxAge(0);
                clearCookie.setPath(cookieConfig.getPath());
                clearCookie.setHttpOnly(true);
                response.addCookie(clearCookie);
                
                // For API endpoints, return 401. For page requests, let them through to redirect to login
                String requestURI = request.getRequestURI();
                if (requestURI.startsWith("/api/")) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Invalid or expired token");
                    return;
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }
}

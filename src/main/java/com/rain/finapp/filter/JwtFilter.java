package com.rain.finapp.filter;

import com.rain.finapp.config.AuthConfig;
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
    private AuthConfig authConfig;

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;
        String authSource = null;

        // Try to get token from Authorization header (JWT mode)
        if (authConfig.isJwtEnabled()) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                authSource = "header";
            }
        }

        // Try to get token from HTTP-only cookie (Cookie mode) if no header token found
        if (token == null && authConfig.isCookieEnabled()) {
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("auth-token".equals(cookie.getName())) {
                        token = cookie.getValue();
                        authSource = "cookie";
                        break;
                    }
                }
            }
        }

        // If we have a token from either source, validate it
        if (token != null) {
            try {
                Claims claims = jwtUtil.validateToken(token);
                request.setAttribute("claims", claims);
                request.setAttribute("authSource", authSource);
                
                String username = claims.get("username", String.class);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                Authentication auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
                
            } catch (Exception e) {
                // If it's a cookie-based auth failure, clear the cookie
                if ("cookie".equals(authSource)) {
                    Cookie clearCookie = new Cookie("auth-token", "");
                    clearCookie.setMaxAge(0);
                    clearCookie.setPath("/");
                    clearCookie.setHttpOnly(true);
                    response.addCookie(clearCookie);
                }
                
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired token");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}

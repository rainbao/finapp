/**
 * Authentication module - handles JWT token management and user authentication
 */
class AuthManager {
    constructor() {
        this.TOKEN_KEY = 'jwtToken';
        this.USERNAME_KEY = 'username';
    }

    /**
     * Store authentication data after successful login
     */
    setAuth(token, username) {
        sessionStorage.setItem(this.TOKEN_KEY, token);
        sessionStorage.setItem(this.USERNAME_KEY, username);
    }

    /**
     * Get stored JWT token
     */
    getToken() {
        return sessionStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get stored username
     */
    getUsername() {
        return sessionStorage.getItem(this.USERNAME_KEY);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!(this.getToken() && this.getUsername());
    }

    /**
     * Clear authentication data and redirect to login
     */
    logout() {
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USERNAME_KEY);
        window.location.href = "/login.html";
    }

    /**
     * Redirect to login if not authenticated
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.logout();
            return false;
        }
        return true;
    }

    /**
     * Get authorization headers for API calls
     */
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.getToken()}`,
            'Content-Type': 'application/json'
        };
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

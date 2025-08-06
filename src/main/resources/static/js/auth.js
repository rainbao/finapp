/**
 * Authentication module - handles HTTP-only cookie authentication with JWT
 */
class AuthManager {
    constructor() {
        this.USERNAME_KEY = 'username';
    }

    /**
     * Store username after successful login (JWT is in HTTP-only cookie)
     */
    setAuth(username) {
        sessionStorage.setItem(this.USERNAME_KEY, username);
    }

    /**
     * Get stored username
     */
    getUsername() {
        return sessionStorage.getItem(this.USERNAME_KEY);
    }

    /**
     * Check if user is authenticated
     * For cookie auth, we check if username is stored and let the server validate the cookie
     */
    isAuthenticated() {
        return !!this.getUsername();
    }

    /**
     * Clear authentication data and redirect to login
     */
    async logout() {
        // Call server logout to clear HTTP-only cookie
        try {
            await fetch('/api/logout', { 
                method: 'POST', 
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.warn('Logout request failed:', error);
        }
        
        // Clear sessionStorage
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
     * Get headers for API calls (no Authorization header needed for cookies)
     */
    getAuthHeaders() {
        return { 'Content-Type': 'application/json' };
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

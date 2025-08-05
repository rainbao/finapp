/**
 * Authentication module - handles JWT token management and user authentication
 * Supports both JWT (sessionStorage) and HTTP-only cookie authentication
 */
class AuthManager {
    constructor() {
        this.TOKEN_KEY = 'jwtToken';
        this.USERNAME_KEY = 'username';
        this.AUTH_MODE_KEY = 'authMode';
        this.authConfig = null;
        
        // Load auth configuration on initialization
        this.loadAuthConfig();
    }

    /**
     * Load authentication configuration from the server
     */
    async loadAuthConfig() {
        try {
            const response = await fetch('/api/auth/config');
            if (response.ok) {
                this.authConfig = await response.json();
            } else {
                console.warn('Could not load auth config, using defaults');
                this.authConfig = { mode: 'jwt', jwtEnabled: true, cookieEnabled: false, dualMode: false };
            }
        } catch (error) {
            console.warn('Could not load auth config:', error);
            this.authConfig = { mode: 'jwt', jwtEnabled: true, cookieEnabled: false, dualMode: false };
        }
    }

    /**
     * Get the current authentication mode preference
     */
    getAuthMode() {
        const stored = sessionStorage.getItem(this.AUTH_MODE_KEY);
        if (stored && this.authConfig) {
            // Validate stored mode against server config
            switch (stored) {
                case 'jwt':
                    return this.authConfig.jwtEnabled ? 'jwt' : this.authConfig.mode;
                case 'cookie':
                    return this.authConfig.cookieEnabled ? 'cookie' : this.authConfig.mode;
                case 'both':
                    return this.authConfig.dualMode ? 'both' : this.authConfig.mode;
            }
        }
        return this.authConfig?.mode || 'jwt';
    }

    /**
     * Set the authentication mode preference
     */
    setAuthMode(mode) {
        sessionStorage.setItem(this.AUTH_MODE_KEY, mode);
    }

    /**
     * Store authentication data after successful login
     */
    setAuth(token, username, authMode = null) {
        if (authMode) {
            this.setAuthMode(authMode);
        }
        
        const currentMode = this.getAuthMode();
        
        // For JWT or dual mode, store token in sessionStorage
        if (currentMode === 'jwt' || currentMode === 'both') {
            sessionStorage.setItem(this.TOKEN_KEY, token);
        }
        
        // Always store username for display purposes
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
        const mode = this.getAuthMode();
        
        if (mode === 'cookie') {
            // For cookie mode, we assume authentication if username is stored
            // The server will validate the HTTP-only cookie
            return !!this.getUsername();
        } else {
            // For JWT or dual mode, check for token and username
            return !!(this.getToken() && this.getUsername());
        }
    }

    /**
     * Clear authentication data and redirect to login
     */
    async logout() {
        // Call server logout to clear HTTP-only cookies
        try {
            await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.warn('Logout request failed:', error);
        }
        
        // Clear sessionStorage
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USERNAME_KEY);
        sessionStorage.removeItem(this.AUTH_MODE_KEY);
        
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
        const mode = this.getAuthMode();
        const headers = { 'Content-Type': 'application/json' };
        
        // Only add Authorization header for JWT or dual mode
        if ((mode === 'jwt' || mode === 'both') && this.getToken()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }
        
        return headers;
    }

    /**
     * Get available authentication modes from server config
     */
    getAvailableAuthModes() {
        if (!this.authConfig) return ['jwt'];
        
        const modes = [];
        if (this.authConfig.jwtEnabled) modes.push('jwt');
        if (this.authConfig.cookieEnabled) modes.push('cookie');
        if (this.authConfig.dualMode) modes.push('both');
        
        return modes.length > 0 ? modes : ['jwt'];
    }

    /**
     * Check if dual auth mode is available
     */
    isDualModeAvailable() {
        return this.authConfig?.dualMode || false;
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

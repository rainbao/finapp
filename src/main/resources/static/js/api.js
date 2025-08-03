/**
 * API client module - handles all API communications
 */
class ApiClient {
    constructor() {
        this.baseUrl = '';
    }

    /**
     * Generic API request handler with error handling
     */
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            // Handle 401 errors globally
            if (response.status === 401) {
                console.warn('Authentication expired, redirecting to login');
                window.authManager.logout();
                return null;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Login user and return token
     */
    async login(username, password) {
        return this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    /**
     * Get current user information
     */
    async getCurrentUser() {
        return this.request('/api/me', {
            method: 'GET',
            headers: window.authManager.getAuthHeaders()
        });
    }

    /**
     * Get budget summary
     */
    async getBudgetSummary() {
        return this.request('/api/budget-summary', {
            method: 'GET',
            headers: window.authManager.getAuthHeaders()
        });
    }

    /**
     * Register new user
     */
    async register(username, email, password) {
        return this.request('/api/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }
}

// Create global API client instance
window.apiClient = new ApiClient();

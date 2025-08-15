/**
 * API client module - handles HTTP-only cookie authentication
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
            console.log('API Request:', url, options.method || 'GET');
            
            const requestOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                // Always include credentials for cookie support
                credentials: 'include',
                ...options
            };

            const response = await fetch(url, requestOptions);
            console.log('API Response status:', response.status);

            // Handle 401 errors globally
            if (response.status === 401) {
                console.warn('Authentication expired, redirecting to login');
                window.authManager.logout();
                return null;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            // Check if response has content to parse
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                if (text) {
                    const result = JSON.parse(text);
                    console.log('API Success:', result);
                    return result;
                } else {
                    console.log('API Success: Empty response');
                    return {};
                }
            } else {
                console.log('API Success: Non-JSON response');
                return {};
            }
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Generic GET request
     */
    async get(url) {
        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * Generic POST request
     */
    async post(url, data) {
        const options = {
            method: 'POST'
        };
        
        // Only add body if data is provided and not null
        if (data !== null && data !== undefined) {
            options.body = JSON.stringify(data);
        }
        
        return this.request(url, options);
    }

    /**
     * Generic PUT request
     */
    async put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Generic DELETE request
     */
    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }

    /**
     * Login user (JWT will be set in HTTP-only cookie)
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
            method: 'GET'
        });
    }

    /**
     * Get budget summary
     */
    async getBudgetSummary() {
        return this.request('/api/budget-summary', {
            method: 'GET'
        });
    }

    /**
     * Get user's monthly budget
     */
    async getMonthlyBudget() {
        return this.request('/api/user/monthly-budget', {
            method: 'GET'
        });
    }

    /**
     * Update user's monthly budget
     */
    async updateMonthlyBudget(monthlyBudget) {
        return this.request('/api/user/monthly-budget', {
            method: 'PUT',
            body: JSON.stringify({ monthlyBudget: monthlyBudget.toString() })
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

    /**
     * Logout user
     */
    async logout() {
        return this.request('/api/logout', {
            method: 'POST'
        });
    }

    /**
     * Create a new category
     */
    async createCategory(categoryName) {
        return this.post(`/api/transactions/categories?name=${encodeURIComponent(categoryName)}`, null);
    }
}

// Create global API client instance
window.apiClient = new ApiClient();

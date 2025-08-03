/**
 * Login page controller
 */
class LoginController {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const submitButton = document.querySelector('#loginForm button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        UIUtils.clearMessages('loginForm');

        try {
            const formData = UIUtils.getFormData('loginForm');
            const { username, password } = formData;

            if (!username || !password) {
                throw new Error('Please fill in all fields');
            }

            const response = await window.apiClient.login(username, password);
            
            if (response && response.token) {
                window.authManager.setAuth(response.token, username);
                window.location.href = "/dashboard.html";
            } else {
                throw new Error(response?.message || 'Login failed');
            }
        } catch (error) {
            UIUtils.showError(`${error.message}`, 'loginForm');
        } finally {
            // Hide loading state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginController();
});

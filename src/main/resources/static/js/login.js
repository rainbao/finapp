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
            
            if (response && response.message) {
                // Store username (JWT is already in HTTP-only cookie)
                window.authManager.setAuth(username);
                window.location.href = "/dashboard.html";
                
            } else {
                throw new Error('Login failed - invalid response');
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

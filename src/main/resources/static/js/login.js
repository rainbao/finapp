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
        UIUtils.showLoading('loginForm', 'Login');
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
            UIUtils.showError(`Login failed: ${error.message}`, 'loginForm');
        } finally {
            UIUtils.hideLoading('loginForm');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginController();
});

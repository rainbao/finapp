/**
 * Login page controller
 */
class LoginController {
    constructor() {
        this.initializeAuthModeSelection();
        this.initializeEventListeners();
    }

    async initializeAuthModeSelection() {
        // Wait for auth manager to load config
        await new Promise(resolve => {
            const checkConfig = () => {
                if (window.authManager.authConfig) {
                    resolve();
                } else {
                    setTimeout(checkConfig, 100);
                }
            };
            checkConfig();
        });

        const authModeSection = document.getElementById('authModeSection');
        const authModeSelect = document.getElementById('authMode');
        
        // Only show auth mode selection if dual mode is available
        if (window.authManager.isDualModeAvailable()) {
            authModeSection.style.display = 'block';
            
            // Populate available options
            const availableModes = window.authManager.getAvailableAuthModes();
            authModeSelect.innerHTML = '<option value="">Default</option>';
            
            availableModes.forEach(mode => {
                const option = document.createElement('option');
                option.value = mode;
                switch(mode) {
                    case 'jwt':
                        option.textContent = 'JWT Token (sessionStorage)';
                        break;
                    case 'cookie':
                        option.textContent = 'HTTP-only Cookie';
                        break;
                    case 'both':
                        option.textContent = 'Both (JWT + Cookie)';
                        break;
                }
                authModeSelect.appendChild(option);
            });
        }
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
            const { username, password, authMode } = formData;

            if (!username || !password) {
                throw new Error('Please fill in all fields');
            }

            const response = await window.apiClient.login(username, password, authMode);
            
            if (response) {
                // Handle different response types based on auth mode
                if (response.authMode === 'cookie') {
                    // For cookie mode, no token in response
                    window.authManager.setAuth(null, username, response.authMode);
                } else if (response.token) {
                    // For JWT or both modes
                    window.authManager.setAuth(response.token, username, response.authMode);
                } else if (response.authMode === 'both') {
                    // Dual mode should have token
                    window.authManager.setAuth(response.token, username, response.authMode);
                } else {
                    // Fallback for backward compatibility
                    window.authManager.setAuth(response.token, username);
                }
                
                // Show success message with auth mode info
                if (response.authMode) {
                    UIUtils.showSuccess(`Login successful using ${response.authMode} authentication`, 'loginForm');
                    setTimeout(() => {
                        window.location.href = "/dashboard.html";
                    }, 1000);
                } else {
                    window.location.href = "/dashboard.html";
                }
            } else {
                throw new Error('Login failed - no response');
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

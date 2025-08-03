/**
 * Register page controller
 */
class RegisterController {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const submitButton = document.querySelector('#registerForm button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Registering...';
        UIUtils.clearMessages('registerForm');

        try {
            const formData = UIUtils.getFormData('registerForm');
            const { username, email, password } = formData;

            if (!username || !email || !password) {
                throw new Error('Please fill in all fields');
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Basic password validation
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const response = await window.apiClient.register(username, email, password);
            
            if (response) {
                UIUtils.showSuccess('Registration successful! Please log in.', 'registerForm');
                
                // Clear form
                document.getElementById('registerForm').reset();
                
                // Redirect to login after a brief delay
                setTimeout(() => {
                    window.location.href = "/login.html";
                }, 2000);
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            UIUtils.showError(`${error.message}`, 'registerForm');
        } finally {
            // Hide loading state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegisterController();
});

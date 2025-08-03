/**
 * UI utilities module - common UI functions and helpers
 */
class UIUtils {
    /**
     * Show error message to user
     */
    static showError(message, containerId = null) {
        const errorHtml = `<p style="color: red;" class="error-message">${message}</p>`;
        
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML += errorHtml;
            }
        } else {
            // Show alert as fallback
            alert(message);
        }
    }

    /**
     * Show success message to user
     */
    static showSuccess(message, containerId = null) {
        const successHtml = `<p style="color: green;" class="success-message">${message}</p>`;
        
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML += successHtml;
            }
        }
    }

    /**
     * Clear previous messages
     */
    static clearMessages(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const messages = container.querySelectorAll('.error-message, .success-message');
            messages.forEach(msg => msg.remove());
        }
    }

    /**
     * Show loading state
     */
    static showLoading(elementId, originalText = 'Submit') {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = true;
            element.textContent = 'Loading...';
            element.dataset.originalText = originalText;
        }
    }

    /**
     * Hide loading state
     */
    static hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = false;
            element.textContent = element.dataset.originalText || 'Submit';
        }
    }

    /**
     * Safely update element content
     */
    static updateElement(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
        }
    }

    /**
     * Get form data as object
     */
    static getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
}

// Make available globally
window.UIUtils = UIUtils;

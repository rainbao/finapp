/**
 * Dashboard page controller
 */
class DashboardController {
    constructor() {
        this.initialize();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }
    }

    async initialize() {
        // Check authentication first
        if (!window.authManager.requireAuth()) {
            return;
        }

        // Show welcome message
        this.showWelcomeMessage();

        // Load user data and budget summary
        await Promise.all([
            this.loadUserData(),
            this.loadBudgetSummary()
        ]);
    }

    showWelcomeMessage() {
        const username = window.authManager.getUsername();
        UIUtils.updateElement('userInfo', `<p class="welcome-message">Hello, ${username}</p>`);
    }

    async loadUserData() {
        try {
            const userData = await window.apiClient.getCurrentUser();
            
            if (userData && !userData.error) {
                const userInfoHtml = `
                    <p class="user-email">Email: ${userData.email}</p>
                `;
                
                const currentContent = document.getElementById('userInfo').innerHTML;
                UIUtils.updateElement('userInfo', currentContent + userInfoHtml);
            }
        } catch (error) {
            UIUtils.showError(`Error loading user data: ${error.message}`, 'userInfo');
        }
    }

    async loadBudgetSummary() {
        try {
            const budgetData = await window.apiClient.getBudgetSummary();
            
            if (budgetData && budgetData.monthlyBudget) {
                const budgetHtml = `<p>Monthly Budget: $${budgetData.monthlyBudget}</p>`;
                const currentContent = document.getElementById('budgetSummary').innerHTML;
                UIUtils.updateElement('budgetSummary', currentContent + budgetHtml);
            }
        } catch (error) {
            console.warn('Budget summary not available:', error.message);
            // Don't show error for budget summary as it might not be implemented
        }
    }

    // Method to handle logout (can be called from UI)
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.authManager.logout();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardController();
});

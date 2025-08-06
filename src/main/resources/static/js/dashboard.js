/**
 * Dashboard page controller
 */
class DashboardController {
    constructor() {
        this.transactionManager = null;
        this.initialize();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }

        // Add transaction button
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => {
                this.showTransactionModal();
            });
        }

        // Modal controls
        const closeModal = document.getElementById('closeModal');
        const cancelForm = document.getElementById('cancelForm');
        if (closeModal) closeModal.addEventListener('click', this.hideTransactionModal.bind(this));
        if (cancelForm) cancelForm.addEventListener('click', this.hideTransactionModal.bind(this));

        // Transaction form
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', this.handleTransactionSubmit.bind(this));
        }

        // Filters
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        const clearFilters = document.getElementById('clearFilters');

        if (categoryFilter) categoryFilter.addEventListener('change', this.applyFilters.bind(this));
        if (dateFilter) dateFilter.addEventListener('change', this.applyFilters.bind(this));
        if (clearFilters) clearFilters.addEventListener('click', this.clearFilters.bind(this));

        // Add category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.showTransactionModal('', true);
            });
        }

        // Modal click outside to close
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideTransactionModal();
                }
            });
        }
    }

    async initialize() {
        // Check authentication first
        if (!window.authManager.requireAuth()) {
            return;
        }

        // Show welcome message
        this.showWelcomeMessage();

        // Initialize transaction manager
        this.transactionManager = new TransactionManager();
        window.transactionManager = this.transactionManager; // Global access for onclick handlers

        // Load data
        await Promise.all([
            this.loadUserData(),
            this.loadTransactionData()
        ]);

        // Set default date for new transactions
        this.setDefaultDate();
    }

    showWelcomeMessage() {
        const username = window.authManager.getUsername();
        
        UIUtils.updateElement('userInfo', `
            <p class="welcome-message">Welcome back, ${username}!</p>
        `);
    }

    async loadUserData() {
        try {
            const userData = await window.apiClient.getCurrentUser();
            
            if (userData && !userData.error) {
                const userInfoHtml = `
                    <p class="user-email">${userData.email}</p>
                `;
                
                const currentContent = document.getElementById('userInfo').innerHTML;
                UIUtils.updateElement('userInfo', currentContent + userInfoHtml);
            }
        } catch (error) {
            console.warn('Error loading user data:', error.message);
        }
    }

    async loadTransactionData() {
        try {
            // Load transactions, categories, and budgets
            await Promise.all([
                this.transactionManager.loadTransactions(),
                this.transactionManager.loadCategories(),
                this.transactionManager.loadCategoryBudgets()
            ]);

            // Update stats
            this.updateStats();

            // Populate category filter
            this.populateCategoryFilter();

        } catch (error) {
            console.error('Error loading transaction data:', error);
            UIUtils.showError('Failed to load transaction data');
        }
    }

    updateStats() {
        const transactions = this.transactionManager.transactions;
        const categories = this.transactionManager.categories;

        // Total transactions
        document.getElementById('totalTransactions').textContent = transactions.length;

        // Total categories
        document.getElementById('totalCategories').textContent = categories.length;

        // Monthly total (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyTotal = transactions
            .filter(t => {
                const date = new Date(t.transactionDate);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        document.getElementById('monthlyTotal').textContent = `$${monthlyTotal.toFixed(2)}`;
    }

    populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        const categoryList = document.getElementById('categoryList');
        
        if (!categoryFilter || !categoryList) return;

        // Clear existing options (except "All Categories")
        while (categoryFilter.children.length > 1) {
            categoryFilter.removeChild(categoryFilter.lastChild);
        }

        // Clear datalist
        categoryList.innerHTML = '';

        // Add categories to both filter and datalist
        this.transactionManager.categories.forEach(category => {
            // Add to filter dropdown
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);

            // Add to datalist for form
            const datalistOption = document.createElement('option');
            datalistOption.value = category;
            categoryList.appendChild(datalistOption);
        });
    }

    showTransactionModal(category = '', focusCategory = false) {
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionForm');
        const modalTitle = document.getElementById('modalTitle');
        
        if (!modal || !form) return;

        // Reset form
        form.reset();
        this.transactionManager.currentEditingId = null;

        // Set category if provided
        if (category) {
            document.getElementById('transactionCategory').value = category;
        }

        // Set title
        modalTitle.textContent = 'Add Transaction';

        // Show modal
        modal.style.display = 'flex';

        // Focus appropriate field
        setTimeout(() => {
            if (focusCategory || !category) {
                document.getElementById('transactionCategory').focus();
            } else {
                document.getElementById('transactionAmount').focus();
            }
        }, 100);
    }

    hideTransactionModal() {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async handleTransactionSubmit(event) {
        event.preventDefault();
        
        const submitButton = document.getElementById('submitForm');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        try {
            await this.transactionManager.handleFormSubmit(event);
            this.hideTransactionModal();
            
            // Refresh data
            await this.loadTransactionData();
            
        } catch (error) {
            // Error handling is done in TransactionManager
            console.error('Error submitting transaction:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        
        if (!categoryFilter || !dateFilter) return;

        const selectedCategory = categoryFilter.value;
        const selectedDate = dateFilter.value;

        let filteredTransactions = [...this.transactionManager.transactions];

        // Apply category filter
        if (selectedCategory) {
            filteredTransactions = filteredTransactions.filter(t => t.category === selectedCategory);
        }

        // Apply date filter
        if (selectedDate) {
            const filterDate = new Date(selectedDate);
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionDate = new Date(t.transactionDate);
                return transactionDate.toDateString() === filterDate.toDateString();
            });
        }

        // Update display with filtered transactions
        this.displayFilteredTransactions(filteredTransactions);
    }

    displayFilteredTransactions(transactions) {
        // Temporarily update the transaction manager's transactions for display
        const originalTransactions = this.transactionManager.transactions;
        this.transactionManager.transactions = transactions;
        this.transactionManager.renderTransactions();
        this.transactionManager.transactions = originalTransactions;
    }

    clearFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        
        if (categoryFilter) categoryFilter.value = '';
        if (dateFilter) dateFilter.value = '';
        
        // Re-render all transactions
        this.transactionManager.renderTransactions();
    }

    setDefaultDate() {
        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            const today = new Date();
            dateInput.value = today.toISOString().split('T')[0];
        }
    }

    // Method to handle logout (can be called from UI)
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.authManager.logout();
        }
    }

    // Methods for transaction actions (called from transaction manager)
    async editTransaction(id) {
        const transaction = this.transactionManager.transactions.find(t => t.transactionId === id);
        if (!transaction) return;

        // Populate form with transaction data
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionForm');
        const modalTitle = document.getElementById('modalTitle');
        
        if (!modal || !form) return;

        this.transactionManager.currentEditingId = id;
        
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionDescription').value = transaction.description || '';
        
        if (transaction.transactionDate) {
            const date = new Date(transaction.transactionDate);
            document.getElementById('transactionDate').value = date.toISOString().split('T')[0];
        }

        modalTitle.textContent = 'Edit Transaction';
        modal.style.display = 'flex';
        
        setTimeout(() => {
            document.getElementById('transactionAmount').focus();
        }, 100);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardController = new DashboardController();
});

/**
 * Transaction management module
 * Handles CRUD operations for transactions
 */
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.categories = [];
        this.categoryBudgets = {};
        this.currentEditingId = null;
    }

    /**
     * Load all transactions for the current user
     */
    async loadTransactions() {
        try {
            const response = await window.apiClient.get('/api/transactions');
            this.transactions = response;
            this.renderTransactions();
            return response;
        } catch (error) {
            console.error('Error loading transactions:', error);
            UIUtils.showError('Failed to load transactions', 'transactionContainer');
            throw error;
        }
    }

    /**
     * Load user categories
     */
    async loadCategories() {
        try {
            const response = await window.apiClient.get('/api/transactions/categories');
            this.categories = response || [];
            this.renderCategoryOptions();
            return response;
        } catch (error) {
            console.error('Error loading categories:', error);
            return [];
        }
    }

    /**
     * Load category budgets
     */
    async loadCategoryBudgets() {
        try {
            const response = await window.apiClient.get('/api/transactions/category-budgets');
            this.categoryBudgets = response || {};
            return response;
        } catch (error) {
            console.error('Error loading category budgets:', error);
            return {};
        }
    }

    /**
     * Create a new transaction
     */
    async createTransaction(transactionData) {
        try {
            const response = await window.apiClient.post('/api/transactions', transactionData);
            this.transactions.unshift(response); // Add to beginning of array
            this.renderTransactions();
            this.showMessage('Transaction created successfully!');
            return response;
        } catch (error) {
            console.error('Error creating transaction:', error);
            this.showMessage(`Failed to create transaction: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Update an existing transaction
     */
    async updateTransaction(id, transactionData) {
        try {
            const response = await window.apiClient.put(`/api/transactions/${id}`, transactionData);
            const index = this.transactions.findIndex(t => t.transactionId === id);
            if (index !== -1) {
                this.transactions[index] = response;
                this.renderTransactions();
            }
            this.showMessage('Transaction updated successfully!');
            return response;
        } catch (error) {
            console.error('Error updating transaction:', error);
            this.showMessage(`Failed to update transaction: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Delete a transaction
     */
    async deleteTransaction(id) {
        try {
            await window.apiClient.delete(`/api/transactions/${id}`);
            this.transactions = this.transactions.filter(t => t.transactionId !== id);
            this.renderTransactions();
            this.showMessage('Transaction deleted successfully!');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            this.showMessage(`Failed to delete transaction: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Get transactions by category
     */
    async getTransactionsByCategory(category) {
        try {
            const response = await window.apiClient.get(`/api/transactions?category=${encodeURIComponent(category)}`);
            return response;
        } catch (error) {
            console.error('Error loading transactions by category:', error);
            throw error;
        }
    }

    /**
     * Get transactions by date range
     */
    async getTransactionsByDateRange(startDate, endDate) {
        try {
            const response = await window.apiClient.get(
                `/api/transactions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );
            return response;
        } catch (error) {
            console.error('Error loading transactions by date range:', error);
            throw error;
        }
    }

    /**
     * Render transactions in the UI
     */
    renderTransactions() {
        const container = document.getElementById('transactionList');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="no-transactions">
                    <p>No transactions yet. Create your first transaction!</p>
                </div>
            `;
            return;
        }

        // Group transactions by category
        const groupedTransactions = this.groupTransactionsByCategory();
        
        container.innerHTML = Object.keys(groupedTransactions)
            .map(category => this.renderCategorySection(category, groupedTransactions[category]))
            .join('');
    }

    /**
     * Group transactions by category
     */
    groupTransactionsByCategory() {
        return this.transactions.reduce((groups, transaction) => {
            const category = transaction.category || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(transaction);
            return groups;
        }, {});
    }

    /**
     * Render a category section with its transactions
     */
    renderCategorySection(category, transactions) {
        const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        // Check if this category has a budget
        const budgetInfo = this.categoryBudgets[category];
        let budgetDisplay = '';
        
        if (budgetInfo && budgetInfo.budget > 0) {
            const spent = parseFloat(budgetInfo.spent || 0);
            const budget = parseFloat(budgetInfo.budget);
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            
            // Determine color based on percentage
            let budgetColor = '#28a745'; // Green
            if (percentage > 90) budgetColor = '#dc3545'; // Red
            else if (percentage > 75) budgetColor = '#ffc107'; // Yellow
            
            budgetDisplay = `
                <span class="budget-info" style="color: ${budgetColor};">
                    $${spent.toFixed(2)} / $${budget.toFixed(2)}
                    <span class="budget-percentage">(${percentage.toFixed(0)}%)</span>
                </span>
            `;
        }
        
        return `
            <div class="category-section" data-category="${category}">
                <div class="category-header">
                    <div class="category-title-section">
                        <h3>${category}</h3>
                        ${budgetDisplay}
                    </div>
                    <div class="category-actions">
                        <span class="category-total">$${totalAmount.toFixed(2)}</span>
                        <button class="btn-set-budget" onclick="window.transactionManager.showBudgetModal('${category}')">
                            ${budgetInfo && budgetInfo.budget > 0 ? 'Edit Budget' : 'Set Budget'}
                        </button>
                        <button class="btn-add-transaction" onclick="window.dashboardController.showTransactionModal('${category}')">
                            + Add Transaction
                        </button>
                    </div>
                </div>
                <div class="transactions-list">
                    ${transactions.map(t => this.renderTransaction(t)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render a single transaction
     */
    renderTransaction(transaction) {
        const date = new Date(transaction.transactionDate).toLocaleDateString();
        const amount = parseFloat(transaction.amount).toFixed(2);
        
        return `
            <div class="transaction-item" data-id="${transaction.transactionId}">
                <div class="transaction-info">
                    <span class="transaction-amount">$${amount}</span>
                    <span class="transaction-description">${transaction.description || 'No description'}</span>
                    <span class="transaction-date">${date}</span>
                </div>
                <div class="transaction-actions">
                    <button class="btn-edit" onclick="window.dashboardController.editTransaction('${transaction.transactionId}')">
                        Edit
                    </button>
                    <button class="btn-delete" onclick="window.transactionManager.confirmDeleteTransaction('${transaction.transactionId}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = UIUtils.getFormData('transactionForm');
        const { amount, category, description, date } = formData;

        if (!amount || !category) {
            this.showMessage('Amount and category are required', 'error');
            return;
        }

        const transactionData = {
            amount: parseFloat(amount),
            category: category.trim(),
            description: description ? description.trim() : null,
            transactionDate: date ? new Date(date).toISOString() : null
        };

        try {
            if (this.currentEditingId) {
                await this.updateTransaction(this.currentEditingId, transactionData);
            } else {
                await this.createTransaction(transactionData);
            }
            
            // Success handling is done in the create/update methods
        } catch (error) {
            // Error handling is done in the create/update methods
            throw error;
        }
    }

    /**
     * Confirm and delete transaction
     */
    confirmDeleteTransaction(id) {
        const transaction = this.transactions.find(t => t.transactionId === id);
        if (!transaction) return;

        if (confirm(`Are you sure you want to delete this $${transaction.amount} transaction?`)) {
            this.deleteTransaction(id);
        }
    }

    /**
     * Show success/error messages
     */
    showMessage(message, type = 'success') {
        const container = document.getElementById('messageContainer');
        if (!container) {
            // Fallback to UIUtils if message container doesn't exist
            if (type === 'error') {
                UIUtils.showError(message);
            } else {
                UIUtils.showSuccess(message);
            }
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        container.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    /**
     * Show budget setting modal
     */
    showBudgetModal(category) {
        const budgetInfo = this.categoryBudgets[category];
        const currentBudget = budgetInfo ? budgetInfo.budget : '';
        
        const budget = prompt(`Set budget for "${category}":\n(Current: $${currentBudget || '0.00'})`, currentBudget || '');
        
        if (budget !== null && budget.trim() !== '') {
            const budgetAmount = parseFloat(budget);
            if (!isNaN(budgetAmount) && budgetAmount > 0) {
                this.setCategoryBudget(category, budgetAmount);
            } else {
                this.showMessage('Please enter a valid budget amount greater than 0', 'error');
            }
        }
    }

    /**
     * Set budget for a category
     */
    async setCategoryBudget(category, budget) {
        try {
            const response = await window.apiClient.post(`/api/transactions/category-budget?category=${encodeURIComponent(category)}&budget=${budget}`, null);
            
            // Reload budget data and re-render
            await this.loadCategoryBudgets();
            this.renderTransactions();
            
            this.showMessage(`Budget set for ${category}: $${budget.toFixed(2)}`);
            return response;
        } catch (error) {
            console.error('Error setting category budget:', error);
            this.showMessage(`Failed to set budget: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Render category options in select dropdown
     */
    renderCategoryOptions() {
        const select = document.getElementById('transactionCategory');
        if (!select) return;

        // Keep existing options, just add new categories
        const existingOptions = Array.from(select.options).map(option => option.value);
        
        this.categories.forEach(category => {
            if (!existingOptions.includes(category)) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            }
        });
    }
}

// Initialize transaction manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.transactionManager = new TransactionManager();
});

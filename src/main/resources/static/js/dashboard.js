/**
 * Dashboard page controller
 */
class DashboardController {
    constructor() {
        this.transactionManager = null;
        this.monthlyBudget = 0;
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

        // Monthly budget button
        const setBudgetBtn = document.getElementById('setBudgetBtn');
        if (setBudgetBtn) {
            setBudgetBtn.addEventListener('click', this.showBudgetModal.bind(this));
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
        const filterMethod = document.getElementById('filterMethod');
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        const startDateFilter = document.getElementById('startDateFilter');
        const endDateFilter = document.getElementById('endDateFilter');
        const minAmountFilter = document.getElementById('minAmountFilter');
        const maxAmountFilter = document.getElementById('maxAmountFilter');
        const typeFilter = document.getElementById('typeFilter');
        const descriptionFilter = document.getElementById('descriptionFilter');
        const clearFilters = document.getElementById('clearFilters');

        // Filter method change handler
        if (filterMethod) filterMethod.addEventListener('change', this.handleFilterMethodChange.bind(this));
        
        // Individual filter event listeners
        if (categoryFilter) categoryFilter.addEventListener('change', this.applyFilters.bind(this));
        if (dateFilter) dateFilter.addEventListener('change', this.applyFilters.bind(this));
        if (startDateFilter) startDateFilter.addEventListener('change', this.applyFilters.bind(this));
        if (endDateFilter) endDateFilter.addEventListener('change', this.applyFilters.bind(this));
        if (minAmountFilter) minAmountFilter.addEventListener('input', this.applyFilters.bind(this));
        if (maxAmountFilter) maxAmountFilter.addEventListener('input', this.applyFilters.bind(this));
        if (typeFilter) typeFilter.addEventListener('change', this.applyFilters.bind(this));
        if (descriptionFilter) descriptionFilter.addEventListener('input', this.applyFilters.bind(this));
        if (clearFilters) clearFilters.addEventListener('click', this.clearFilters.bind(this));

        // Add category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.showCategoryInput();
            });
        }

        // Category input controls
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
        const categoryNameInput = document.getElementById('categoryNameInput');

        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', () => {
                this.saveNewCategory();
            });
        }

        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => {
                this.hideCategoryInput();
            });
        }

        if (categoryNameInput) {
            // Save on Enter key
            categoryNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveNewCategory();
                }
            });

            // Cancel on Escape key
            categoryNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideCategoryInput();
                }
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

        // Transaction type change handler
        const transactionType = document.getElementById('transactionType');
        if (transactionType) {
            transactionType.addEventListener('change', this.handleTransactionTypeChange.bind(this));
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
            // Load transactions, categories, budgets, and monthly budget
            await Promise.all([
                this.transactionManager.loadTransactions(),
                this.transactionManager.loadCategories(),
                this.transactionManager.loadCategoryBudgets(),
                this.loadMonthlyBudget(),
                this.loadRecentActivity() // Add recent activity loading
            ]);

            // Now render transactions with all data loaded
            this.transactionManager.renderTransactions();

            // Update stats
            this.updateStats();

            // Populate category filter
            this.populateCategoryFilter();

        } catch (error) {
            console.error('Error loading transaction data:', error);
            UIUtils.showError('Failed to load transaction data');
        }
    }

    /**
     * Load and display recent transactions (last 30 days)
     */
    async loadRecentActivity() {
        try {
            const recentTransactions = await window.apiClient.get('/api/transactions/recent');
            this.renderRecentActivity(recentTransactions);
        } catch (error) {
            console.warn('Could not load recent activity:', error);
            // Don't show error to user since this is non-critical
        }
    }

    /**
     * Render recent transactions widget
     */
    renderRecentActivity(transactions) {
        const recentActivityElement = document.getElementById('recentActivity');
        if (!recentActivityElement) return; // Element doesn't exist in current layout
        
        if (!transactions || transactions.length === 0) {
            recentActivityElement.innerHTML = '<p class="no-recent-activity">No recent transactions</p>';
            return;
        }

        // Show only the 5 most recent
        const recentFive = transactions.slice(0, 5);
        
        const recentHTML = recentFive.map(transaction => {
            const amount = parseFloat(transaction.amount);
            const amountClass = transaction.type === 'INCOME' ? 'income' : 'expense';
            const formattedAmount = transaction.type === 'INCOME' ? 
                `+$${amount.toFixed(2)}` : 
                `-$${amount.toFixed(2)}`;
            
            const date = new Date(transaction.date).toLocaleDateString();
            
            return `
                <div class="recent-transaction-item">
                    <div class="recent-transaction-info">
                        <span class="recent-transaction-category">${transaction.category}</span>
                        <span class="recent-transaction-description">${transaction.description || 'No description'}</span>
                    </div>
                    <div class="recent-transaction-details">
                        <span class="recent-transaction-amount ${amountClass}">${formattedAmount}</span>
                        <span class="recent-transaction-date">${date}</span>
                    </div>
                </div>
            `;
        }).join('');

        recentActivityElement.innerHTML = recentHTML;
    }

    /**
     * Load monthly budget from the API
     */
    async loadMonthlyBudget() {
        try {
            const response = await window.apiClient.getMonthlyBudget();
            if (response && response.monthlyBudget !== undefined) {
                this.monthlyBudget = parseFloat(response.monthlyBudget) || 0;
            } else {
                this.monthlyBudget = 0;
            }
        } catch (error) {
            console.warn('Error loading monthly budget:', error.message);
            this.monthlyBudget = 0;
        }
    }

    /**
     * Update dashboard stats. If skipReload is true, uses current transactionManager data.
     * @param {boolean} skipReload
     */
    async updateStats(skipReload = false) {
        
        if (!skipReload) {
            
            // Reload transactions to ensure we have the latest data
            try {
                await this.transactionManager.loadTransactions();
            } catch (error) {
                console.warn('Could not reload transactions for stats update:', error);
            }
        }
        const transactions = this.transactionManager.transactions;
        const categories = this.transactionManager.categories;

        //Get category count from backend
        let categoryCount = categories.length; // fallback to local count
        try {
            categoryCount = await window.apiClient.get('/api/transactions/categories/count');
        } catch (error) {
            console.warn('Could not fetch category count from backend:', error);
        }

        // Get transaction count from backend
        let transactionCount = transactions.length; // fallback to local count
        try {
            transactionCount = await window.apiClient.get('/api/transactions/count');
        } catch (error) {
            console.warn('Could not fetch transaction count from backend:', error);
        }

        // Calculate income and expenses
        const totalIncome = transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const netBalance = totalIncome - totalExpenses;

        // Update UI elements
        document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        
        const netBalanceElement = document.getElementById('netBalance');
        // Format negative amounts as -$X.XX instead of $-X.XX
        if (netBalance < 0) {
            netBalanceElement.textContent = `-$${Math.abs(netBalance).toFixed(2)}`;
        } else {
            netBalanceElement.textContent = `$${netBalance.toFixed(2)}`;
        }
        
        // Color the net balance based on positive/negative
        netBalanceElement.className = 'stat-value';
        if (netBalance > 0) {
            netBalanceElement.classList.add('income');
        } else if (netBalance < 0) {
            netBalanceElement.classList.add('expense');
        }

        //Update category count if element exists
        const categoryCountElement = document.getElementById('categoryCount');
        if (categoryCountElement) {
            categoryCountElement.textContent = categoryCount.toString();
        }

        // Update transaction count if element exists
        const transactionCountElement = document.getElementById('transactionCount');
        if (transactionCountElement) {
            transactionCountElement.textContent = transactionCount.toString();
        }

        // Update budget status
        this.updateBudgetStatus(totalExpenses);
    }

    updateBudgetStatus(totalExpenses) {
        const budgetStatusElement = document.getElementById('budgetStatus');
        const budgetProgressBar = document.getElementById('budgetProgress');
        const budgetProgressFill = document.getElementById('budgetProgressFill');

        if (this.monthlyBudget > 0) {
            const percentage = (totalExpenses / this.monthlyBudget) * 100;
            const remaining = this.monthlyBudget - totalExpenses;
            
            budgetStatusElement.textContent = `$${totalExpenses.toFixed(2)} / $${this.monthlyBudget.toFixed(2)}`;
            budgetProgressBar.style.display = 'block';
            budgetProgressFill.style.width = `${Math.min(percentage, 100)}%`;
            
            // Color based on percentage
            budgetProgressFill.className = 'budget-progress-fill';
            budgetStatusElement.className = 'stat-value';
            
            if (percentage > 100) {
                budgetProgressFill.classList.add('over-budget');
                budgetStatusElement.classList.add('expense');
            } else if (percentage > 90) {
                budgetProgressFill.classList.add('warning');
            } else {
                budgetStatusElement.classList.add('income');
            }
        } else {
            budgetStatusElement.textContent = 'Set Budget';
            budgetStatusElement.className = 'stat-value';
            budgetProgressBar.style.display = 'none';
        }
    }

    async showBudgetModal() {
        const currentBudget = this.monthlyBudget > 0 ? this.monthlyBudget.toFixed(2) : '';
        const budgetInput = prompt(`Set your monthly budget:\n(Current: $${currentBudget || '0.00'})`, currentBudget);
        
        if (budgetInput !== null && budgetInput.trim() !== '') {
            const budgetAmount = parseFloat(budgetInput);
            if (!isNaN(budgetAmount) && budgetAmount >= 0) {
                try {
                    await window.apiClient.updateMonthlyBudget(budgetAmount);
                    this.monthlyBudget = budgetAmount;
                    this.updateStats(); // Refresh the display
                    this.showMessage(`Monthly budget set to $${budgetAmount.toFixed(2)}!`, 'success');
                } catch (error) {
                    console.error('Error updating monthly budget:', error);
                    this.showMessage('Failed to update monthly budget. Please try again.', 'error');
                }
            } else {
                this.showMessage('Please enter a valid budget amount (0 or greater)', 'error');
            }
        }
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
        
        // Set transaction type based on category
        if (category === 'Income') {
            document.getElementById('transactionType').value = 'INCOME';
        } else {
            document.getElementById('transactionType').value = 'EXPENSE';
        }

        // Set category if provided
        if (category) {
            document.getElementById('transactionCategory').value = category;
        }

        // Set title
        modalTitle.textContent = 'Add Transaction';

        // Set initial category field state based on transaction type
        this.handleTransactionTypeChange();

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

    handleTransactionTypeChange() {
        const typeSelect = document.getElementById('transactionType');
        const categoryField = document.getElementById('transactionCategory');
        const categoryLabel = document.querySelector('label[for="transactionCategory"]');
        
        if (!typeSelect || !categoryField) return;
        
        const selectedType = typeSelect.value;
        
        if (selectedType === 'INCOME') {
            // For income transactions, disable and preset the category
            categoryField.value = 'Income';
            categoryField.disabled = true;
            categoryField.required = false;
            if (categoryLabel) {
                categoryLabel.textContent = 'Category (Auto-set to Income)';
            }
        } else {
            // For expense transactions, enable the category field
            categoryField.disabled = false;
            categoryField.required = true;
            // Only clear the value if it's currently "Income" or empty
            if (categoryField.value === 'Income' || categoryField.value === '') {
                categoryField.value = '';
            }
            if (categoryLabel) {
                categoryLabel.textContent = 'Category';
            }
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

    handleFilterMethodChange() {
        const filterMethod = document.getElementById('filterMethod');
        if (!filterMethod) return;

        const selectedMethod = filterMethod.value;
        
        // Hide all filter groups
        const filterGroups = document.querySelectorAll('.filter-group');
        filterGroups.forEach(group => group.classList.remove('active'));
        
        // Show the selected filter group
        const targetGroup = document.getElementById(`${selectedMethod}FilterGroup`);
        if (targetGroup) {
            targetGroup.classList.add('active');
        }
        
        // Don't clear filters when method changes - let users keep their current filter values
        // Apply current filters to show filtered results immediately
        this.applyFilters();
    }

    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        const startDateFilter = document.getElementById('startDateFilter');
        const endDateFilter = document.getElementById('endDateFilter');
        const minAmountFilter = document.getElementById('minAmountFilter');
        const maxAmountFilter = document.getElementById('maxAmountFilter');
        const typeFilter = document.getElementById('typeFilter');
        const descriptionFilter = document.getElementById('descriptionFilter');
        
        // Don't exit early if categoryFilter is missing - other filters should still work
        
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const selectedDate = dateFilter ? dateFilter.value : '';
        const startDate = startDateFilter ? startDateFilter.value : '';
        const endDate = endDateFilter ? endDateFilter.value : '';
        const minAmount = minAmountFilter ? parseFloat(minAmountFilter.value) : null;
        const maxAmount = maxAmountFilter ? parseFloat(maxAmountFilter.value) : null;
        const selectedType = typeFilter ? typeFilter.value : '';
        const searchDescription = descriptionFilter ? descriptionFilter.value.toLowerCase() : '';

        let filteredTransactions = [...this.transactionManager.transactions];

        // Apply category filter
        if (selectedCategory) {
            filteredTransactions = filteredTransactions.filter(t => t.category === selectedCategory);
        }

        // Apply transaction type filter
        if (selectedType) {
            filteredTransactions = filteredTransactions.filter(t => t.type === selectedType);
        }

        // Apply description filter
        if (searchDescription) {
            filteredTransactions = filteredTransactions.filter(t => 
                (t.description || '').toLowerCase().includes(searchDescription)
            );
        }

        // Apply amount range filter
        if (!isNaN(minAmount) || !isNaN(maxAmount)) {
            filteredTransactions = filteredTransactions.filter(t => {
                const amount = parseFloat(t.amount);
                let inRange = true;
                
                if (!isNaN(minAmount) && minAmount !== null) {
                    inRange = inRange && (amount >= minAmount);
                }
                if (!isNaN(maxAmount) && maxAmount !== null) {
                    inRange = inRange && (amount <= maxAmount);
                }
                
                return inRange;
            });
        }

        // Apply date filters with proper timezone handling
        if (selectedDate) {
            // Specific date filter (overrides date range)
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionDate = new Date(t.transactionDate);
                const filterDate = new Date(selectedDate + 'T00:00:00');
                
                // Compare dates in local timezone by getting just the date parts
                const transactionDateLocal = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
                const filterDateLocal = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
                
                return transactionDateLocal.getTime() === filterDateLocal.getTime();
            });
        } else if (startDate || endDate) {
            // Date range filter
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionDate = new Date(t.transactionDate);
                const transactionDateLocal = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
                
                let inRange = true;
                
                if (startDate) {
                    const startDateLocal = new Date(startDate + 'T00:00:00');
                    const startDateLocalOnly = new Date(startDateLocal.getFullYear(), startDateLocal.getMonth(), startDateLocal.getDate());
                    inRange = inRange && (transactionDateLocal.getTime() >= startDateLocalOnly.getTime());
                }
                if (endDate) {
                    const endDateLocal = new Date(endDate + 'T00:00:00');
                    const endDateLocalOnly = new Date(endDateLocal.getFullYear(), endDateLocal.getMonth(), endDateLocal.getDate());
                    inRange = inRange && (transactionDateLocal.getTime() <= endDateLocalOnly.getTime());
                }
                
                return inRange;
            });
        }

        // Update display with filtered transactions
        this.displayFilteredTransactions(filteredTransactions);
    }

    displayFilteredTransactions(transactions) {
        // Get the category container
        const container = document.getElementById('transactionList');
        if (!container) return;

        // Check if a category filter is active
        const categoryFilter = document.getElementById('categoryFilter');
        const selectedCategory = categoryFilter ? categoryFilter.value : '';

        // Group filtered transactions by category
        const groupedTransactions = transactions.reduce((groups, transaction) => {
            const category = transaction.category || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(transaction);
            return groups;
        }, {});

        // If a specific category is selected, only show that category
        if (selectedCategory) {
            const categoryTransactions = groupedTransactions[selectedCategory] || [];
            container.innerHTML = this.transactionManager.renderCategorySection(selectedCategory, categoryTransactions);
            return;
        }

        // If no category filter, show all categories (for date filtering)
        // Get all categories (including those without transactions)
        const allCategories = [...(Array.isArray(this.transactionManager.categories) ? this.transactionManager.categories : [])];
        
        // Add any categories that exist only in transactions but not in stored categories
        Object.keys(groupedTransactions).forEach(category => {
            if (!allCategories.includes(category)) {
                allCategories.push(category);
            }
        });

        // If no categories exist at all, show empty state
        if (allCategories.length === 0) {
            container.innerHTML = `
                <div class="no-transactions">
                    <p>No categories yet. Create your first transaction or add a category!</p>
                </div>
            `;
            return;
        }

        // Render all categories, keeping Income first but preserving timestamp order for others
        const sortedCategories = allCategories.sort((a, b) => {
            // Income category always comes first
            if (a === 'Income') return -1;
            if (b === 'Income') return 1;
            // For other categories, maintain the order they appear in the allCategories array
            // (which preserves the timestamp order from backend)
            return allCategories.indexOf(b) - allCategories.indexOf(a);
        });
        
        container.innerHTML = sortedCategories
            .map(category => this.transactionManager.renderCategorySection(category, groupedTransactions[category] || []))
            .join('');
    }

    clearFilters() {
        const filterMethod = document.getElementById('filterMethod');
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        const startDateFilter = document.getElementById('startDateFilter');
        const endDateFilter = document.getElementById('endDateFilter');
        const minAmountFilter = document.getElementById('minAmountFilter');
        const maxAmountFilter = document.getElementById('maxAmountFilter');
        const typeFilter = document.getElementById('typeFilter');
        const descriptionFilter = document.getElementById('descriptionFilter');
        
        // Reset filter method to category
        if (filterMethod) filterMethod.value = 'category';
        
        // Clear all filter values
        if (categoryFilter) categoryFilter.value = '';
        if (dateFilter) dateFilter.value = '';
        if (startDateFilter) startDateFilter.value = '';
        if (endDateFilter) endDateFilter.value = '';
        if (minAmountFilter) minAmountFilter.value = '';
        if (maxAmountFilter) maxAmountFilter.value = '';
        if (typeFilter) typeFilter.value = '';
        if (descriptionFilter) descriptionFilter.value = '';
        
        // Reset filter group visibility
        const filterGroups = document.querySelectorAll('.filter-group');
        filterGroups.forEach(group => group.classList.remove('active'));
        
        const categoryFilterGroup = document.getElementById('categoryFilterGroup');
        if (categoryFilterGroup) {
            categoryFilterGroup.classList.add('active');
        }
        
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

    // Category creation methods
    showCategoryInput() {
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const newCategoryInput = document.getElementById('newCategoryInput');
        const categoryNameInput = document.getElementById('categoryNameInput');

        if (addCategoryBtn && newCategoryInput && categoryNameInput) {
            addCategoryBtn.style.display = 'none';
            newCategoryInput.style.display = 'block';
            
            // Focus the input and clear any previous value
            categoryNameInput.value = '';
            setTimeout(() => {
                categoryNameInput.focus();
            }, 100);
        }
    }

    hideCategoryInput() {
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const newCategoryInput = document.getElementById('newCategoryInput');
        const categoryNameInput = document.getElementById('categoryNameInput');

        if (addCategoryBtn && newCategoryInput && categoryNameInput) {
            newCategoryInput.style.display = 'none';
            addCategoryBtn.style.display = 'block';
            categoryNameInput.value = '';
        }
    }

    async saveNewCategory() {
        const categoryNameInput = document.getElementById('categoryNameInput');
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        
        if (!categoryNameInput || !saveCategoryBtn) return;

        const categoryName = categoryNameInput.value.trim();
        
        if (!categoryName) {
            categoryNameInput.focus();
            return;
        }

        // Check for problematic characters that cause URL issues
        if (categoryName.includes('/') || categoryName.includes('\\')) {
            this.showMessage('Category names cannot contain forward slashes (/) or backslashes (\\)', 'error');
            categoryNameInput.focus();
            categoryNameInput.select();
            return;
        }

        // Check if category already exists
        if (this.transactionManager.categories.includes(categoryName)) {
            this.showMessage(`Category "${categoryName}" already exists`, 'error');
            categoryNameInput.focus();
            categoryNameInput.select();
            return;
        }

        // Show loading state
        const originalText = saveCategoryBtn.textContent;
        saveCategoryBtn.disabled = true;
        saveCategoryBtn.textContent = 'Saving...';

        try {
            // Create the category using the dedicated API endpoint
            await window.apiClient.createCategory(categoryName);
            
            // Reload categories to include the new one
            await this.transactionManager.loadCategories();
            this.populateCategoryFilter();
            
            // Refresh the transaction display to show the new category
            this.transactionManager.renderTransactions();
            
            // Update the category count in the stats
            this.updateStats();
            
            this.hideCategoryInput();
            this.showMessage(`Category "${categoryName}" created successfully!`, 'success');

        } catch (error) {
            console.error('Error creating category:', error);
            this.showMessage(`Failed to create category: ${error.message}`, 'error');
            categoryNameInput.focus();
        } finally {
            saveCategoryBtn.disabled = false;
            saveCategoryBtn.textContent = originalText;
        }
    }

    showMessage(message, type = 'success') {
        // Use the transaction manager's message system
        if (this.transactionManager) {
            this.transactionManager.showMessage(message, type);
        } else {
            // Fallback to UIUtils
            if (type === 'error') {
                UIUtils.showError(message);
            } else {
                UIUtils.showSuccess(message);
            }
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
        document.getElementById('transactionType').value = transaction.type || 'EXPENSE';
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionDescription').value = transaction.description || '';
        
        if (transaction.transactionDate) {
            const date = new Date(transaction.transactionDate);
            document.getElementById('transactionDate').value = date.toISOString().split('T')[0];
        }

        // Update category field state based on transaction type
        this.handleTransactionTypeChange();

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

package com.rain.finapp.model;

/**
 * Enum to represent different types of transactions
 */
public enum TransactionType {
    INCOME("Income"),
    EXPENSE("Expense");

    private final String displayName;

    TransactionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}

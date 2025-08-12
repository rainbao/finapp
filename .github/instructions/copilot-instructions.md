# Personal Finance Tracker - Copilot Instructions

## Project Architecture

This is a **Spring Boot 3.2 + vanilla JavaScript** personal finance app with JWT cookie authentication and PostgreSQL. The frontend uses modular ES6 classes with dynamic HTML rendering, while the backend follows standard Spring layered architecture.

### Key Components
- **Backend**: Spring Boot with JPA entities using UUIDs, BigDecimal for money, and OffsetDateTime for timezone-aware dates
- **Frontend**: Vanilla JS with class-based modules (`ApiClient`, `TransactionManager`, `DashboardController`) 
- **Authentication**: JWT tokens stored in HTTP-only cookies, handled by `JwtFilter`
- **Database**: PostgreSQL with environment-based config via `start-app.bat`

## Critical Developer Workflows

### Running the Application
- **Always use** `start-app.bat` (not `mvnw spring-boot:run`) - sets required environment variables for DB/JWT
- Database runs on Supabase PostgreSQL with credentials in batch file
- App serves static files from `src/main/resources/static/` on port 8080

### Project Structure Patterns
```
src/main/java/com/rain/finapp/
├── model/          # JPA entities (User, Transaction, Category)
├── controller/     # REST endpoints with Authentication parameter
├── service/        # Business logic layer
├── repository/     # Spring Data JPA interfaces
├── config/         # Security, JWT, cookie config
└── filter/         # JWT authentication filter

src/main/resources/static/
├── js/             # Modular ES6 classes
├── css/           # Grid-based responsive styling  
└── *.html         # SPA-style pages with dynamic content
```

## Code Conventions & Patterns

### Backend Patterns
- **UUIDs everywhere**: All entities use `UUID` primary keys, never Long/Integer
- **BigDecimal for money**: Transaction amounts use `BigDecimal` with `@Column(precision = 19, scale = 2)`
- **OffsetDateTime**: All timestamps use `OffsetDateTime` for timezone awareness
- **Authentication parameter**: All controller methods include `Authentication authentication` parameter
- **Service layer validation**: Business logic and category management in `TransactionService`

### Frontend Patterns
- **Class-based modules**: Each major feature has its own class (`TransactionManager`, `DashboardController`)
- **Global instances**: Classes instantiated as `window.transactionManager`, `window.apiClient`
- **Dynamic HTML**: Extensive use of template literals with `renderCategorySection()`, `renderTransaction()` methods
- **Cookie-based auth**: No localStorage tokens - authentication via HTTP-only cookies with `credentials: 'include'`

### API Patterns
- **RESTful with query params**: `/api/transactions?category=Food&startDate=2024-01-01`
- **Bulk operations**: Special endpoints like `/api/transactions/categories/{name}/transactions` for batch deletes
- **Budget tracking**: Category budgets stored separately with spending calculations

## Integration Points

### Authentication Flow
1. Login via `/api/login` sets HTTP-only cookie
2. `JwtFilter` validates cookie on each request  
3. Frontend `ApiClient` automatically includes `credentials: 'include'`
4. 401 responses trigger automatic logout via `window.authManager.logout()`

### Transaction Management
- **Income vs Expense**: Controlled by `TransactionType` enum, Income always uses "Income" category
- **Category lifecycle**: Categories auto-created on transaction creation, managed via separate endpoints
- **Budget integration**: Real-time budget calculations in `getCategoryBudgets()` service method

### Frontend State Management
- **Local arrays**: `TransactionManager` maintains `this.transactions`, `this.categories` arrays
- **Reactive rendering**: Changes trigger `renderTransactions()` which rebuilds entire category sections
- **Event delegation**: Dynamic buttons use `onclick` attributes with escaped category names

## Common Pitfalls

- **Category name escaping**: Use `escapeForJS()` method for category names in onclick handlers
- **Date handling**: Frontend sends ISO strings, backend expects `OffsetDateTime`
- **Authentication context**: Always pass `Authentication` parameter to service methods
- **Error handling**: Backend returns structured JSON errors, frontend parses from error messages
- **Budget calculations**: Use service layer methods, not manual aggregation

## Testing & Debugging

- **Debug endpoint**: `/debug.html` for testing authentication and API calls
- **SQL logging**: Enabled via `spring.jpa.show-sql=true` in application.properties
- **Console logging**: Extensive console.log usage in frontend for API request/response tracking
- **Error boundaries**: Try-catch blocks around all async operations with user-friendly error messages

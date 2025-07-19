# Personal Finance Tracker - Developer Notes

## 🔧 Stack Overview

- **Backend**: Java 21 + Spring Boot 3.2
- **Frontend**: HTML, CSS, JavaScript (vanilla or lightweight framework)
- **Database**: PostGresSQL 
- **Build Tool**: Maven
- **Deployment Plan**: Supabase/Render for backend, Netlify/GitHub Pages for frontend

---

## 👤 User Roles

- **User**:
  - Can register and log in
  - Can add, edit, delete financial transactions
  - Can set and view spending categories and monthly budget goals
  - Can view visualizations (charts)

---

## 📂 Java Project Structure (Spring Boot)

- `model/` → JPA entity classes (e.g., User, Transaction, Category)
- `controller/` → REST API controllers
- `service/` → Business logic layer
- `repository/` → Spring Data JPA interfaces
- `resources/` → `application.properties`, static files (if serving frontend here)

---

## 🛠 Planned REST API Endpoints

### AuthController
- `POST /api/register` → Register new user
- `POST /api/login` → Authenticate user and return session/token (optional)

### TransactionController
- `GET /api/transactions` → List user's transactions
- `POST /api/transactions` → Create new transaction
- `PUT /api/transactions/{id}` → Edit a transaction
- `DELETE /api/transactions/{id}` → Delete transaction

### CategoryController
- `GET /api/categories` → List predefined or custom categories
- `POST /api/categories` → Create a new custom category

---

## 📊 Transaction Model (JPA)

```java
@Entity
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String category;
    private Double amount;
    private String note;
    private LocalDate date;
}

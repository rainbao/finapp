
# 💰 Personal Finance Tracker

A secure, full-stack web application for managing income, expenses, and budget goals with visual insights. Built with a **Java Spring Boot** backend, **HTML/CSS/JavaScript** frontend, and **PostgreSQL** for persistent data storage. Implements modern security best practices including JWT authentication and HTTPS-only cookies.

---


## ✨ Features

- Secure user registration, login, and session management (JWT + HTTPS-only cookies)
- Budgeting and real-time budget progress tracking
- Add, edit, and delete financial transactions
- Categorize expenses (e.g., Food, Rent, Utilities)
- Advanced filtering (date range, category, specific date)
- Visualizations:
  - Pie chart: Spending by category
  - Bar chart: Monthly spending overview
- Responsive design for desktop and mobile
- RESTful API backend with Spring Security and role-based access control

---


## 🛠️ Tech Stack

| Layer         | Technology                                 |
|-------------- |--------------------------------------------|
| Backend       | Java 21, Spring Boot 3.2, Spring Security  |
| Auth/Security | JWT (JSON Web Tokens), HTTPS-only cookies  |
| Frontend      | HTML, CSS, JavaScript (modular, ES6+)      |
| Database      | PostgreSQL (compatible: MySQL, MongoDB)    |
| Build Tool    | Maven                                      |
| Charts        | Chart.js                                   |
| IDE           | VS Code + GitHub Copilot                   |

---

## 🔒 Security & Authentication

- **JWT-based authentication**: Stateless, scalable, and secure
- **HTTPS-only, HttpOnly cookies**: Prevents XSS and session hijacking
- **Spring Security**: Role-based access control, secure endpoints
- **Input validation**: Prevents SQL injection and XSS
- **CSRF protection**: Secure state management

---

## 📄 Sample Resume Bullet Points

- Developed secure full-stack financial application with JWT authentication and HTTPS-only cookies, protecting sensitive user data
- Implemented Spring Security for robust authentication, authorization, and session management
- Built RESTful API backend with role-based access controls and input validation to prevent unauthorized access
- Designed responsive dashboard with real-time analytics, budget tracking, and advanced filtering
- Engineered secure database operations using PostgreSQL and parameterized queries
- Created modular JavaScript frontend with secure API communication and client-side validation

---

---




## 📦 Setup Instructions

### 🔧 Prerequisites

- Java 21+
- Maven
- PostgreSQL server (or MySQL/MongoDB with config changes)

### ⚙️ Backend Setup

1. Clone the repository:
  ```bash
  git clone https://github.com/rainbao/finapp.git
  cd finapp
  ```
2. Configure your database in `src/main/resources/application.properties`.
3. Run migrations:
  ```bash
  ./run-migration.bat
  ```
4. Start the backend:
  ```bash
  ./start-app.bat
  ```

### 🖥️ Frontend

Static files are served from `src/main/resources/static/` by Spring Boot. Open `http://localhost:8080` after backend starts.

---


# 💰 Personal Finance Tracker

A secure, full-stack web application for managing income, expenses, and budget goals with visual insights. Built with a **Java Spring Boot** backend, **HTML/CSS/JavaScript** frontend, and **PostgreSQL** for persistent data storage. Implements modern security best practices including JWT authentication and HTTPS-only cookies.

**🚀 [Live Demo](#)** • **📚 [Documentation](DEPLOYMENT.md)** • **🐳 [Docker Hub](#)**

[![CI/CD Pipeline](https://github.com/rainbao/finapp/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/rainbao/finapp/actions/workflows/ci-cd.yml)

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

| Layer          | Technology                                 |
|--------------- |--------------------------------------------|
| Backend        | Java 21, Spring Boot 3.2, Spring Security  |
| Auth/Security  | JWT (JSON Web Tokens), HTTPS-only cookies  |
| Frontend       | HTML, CSS, JavaScript (modular, ES6+)      |
| Database       | PostgreSQL (compatible: MySQL, MongoDB)    |
| Build Tool     | Maven                                      |
| Containerization | Docker, Docker Compose                   |
| CI/CD          | GitHub Actions                             |
| Deployment     | Railway                                    |
| Charts         | Chart.js                                   |
| IDE            | VS Code + GitHub Copilot                   |

---

## Security & Authentication

- **JWT-based authentication**: Stateless, scalable, and secure
- **HTTPS-only, HttpOnly cookies**: Prevents XSS and session hijacking
- **Spring Security**: Role-based access control, secure endpoints
- **Input validation**: Prevents SQL injection and XSS
- **CSRF protection**: Secure state management

---

## Docker & CI/CD

- **Deployed containerized Spring Boot application** to production using Docker, GitHub Actions CI/CD, and Railway/AWS hosting
- **Implemented automated CI/CD pipeline** with GitHub Actions for continuous testing, Docker image building, and deployment
- Developed secure full-stack financial application with JWT authentication and HTTPS-only cookies, protecting sensitive user data
- **Architected multi-stage Docker builds** reducing image size by 75% and optimizing container performance with JVM tuning
- Implemented Spring Security for robust authentication, authorization, and session management
- Built RESTful API backend with role-based access controls and input validation to prevent unauthorized access
- **Configured infrastructure-as-code** with Docker Compose for reproducible development and production environments
- Designed responsive dashboard with real-time analytics, budget tracking, and advanced filtering
- Engineered secure database operations using PostgreSQL with HikariCP connection pooling for optimal performance
- Created modular JavaScript frontend with secure API communication and client-side validation

---


Quick Start

### 🐳 Using Docker (Recommended)

The fastest way to run the application:

```bash
# Clone the repository
git clone https://github.com/rainbao/finapp.git
cd finapp

# Start with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:8080
```

That's it! Docker Compose automatically sets up PostgreSQL and the application.

---

### 🔧 Manual Setup

**Prerequisites**: Java 21+, Maven, PostgreSQL

1. **Clone the repository**
   ```bash
   git clone https://github.com/rainbao/finapp.git
   cd finapp
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the application**
   ```bash
   ./start-app.bat  # Windows
   # or
   ./mvnw spring-boot:run  # Linux/Mac
   ```

4. **Access the application**
   - App: http://localhost:8080
   - API: http://localhost:8080/api
   - Health: http://localhost:8080/actuator/health

---

## 🚀 Deployment

**Full deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

### Quick Deploy Options

**Railway (Easiest - 5 minutes)**
```bash
railway login
railway init
railway up
```

**Docker (Any Platform)**
```bash
docker build -t finapp .
docker run -p 8080:8080 finapp
```

**AWS, Render, or other platforms** - See detailed guides in [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
- ✅ Builds and tests on every push
- ✅ Creates Docker images
- ✅ Pushes to GitHub Container Registry
- ✅ Optionally deploys to production

See [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) for configuration

Static files are served from `src/main/resources/static/` by Spring Boot. Open `http://localhost:8080` after backend starts.

---

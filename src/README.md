# Secure Task Management System (API)
A production-ready backend service built with a focus on data isolation and secure authentication.

## 🚀 Live Demo
- **API Base URL:** https://task-manager-api-7po6.onrender.com
- **Health Check:** https://task-manager-api-7po6.onrender.com/health

## 🛠 Tech Stack
- **Runtime:** Node.js (Express)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Auth:** JWT (JSON Web Tokens) with Bcrypt password hashing
- **Deployment:** Render (CI/CD)

## 🔐 Key Engineering Features
- **Middleware-based Authentication:** Centralized logic for route protection.
- **Data Isolation:** Queries are scoped to the `userId` to prevent unauthorized data access.
- **Relational Mapping:** Clean User-to-Task relationship implementation.

## 📡 API Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/users` | Register a new user | No |
| POST | `/login` | Authenticate and get JWT | No |
| GET | `/tasks` | Retrieve all user tasks | Yes |
| POST | `/tasks` | Create a new task | Yes |
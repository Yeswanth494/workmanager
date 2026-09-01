

# WorkSphere

> A full-stack workforce and project management system designed to manage employees, departments, projects, tasks, attendance, leave requests, timesheets, reports, and notifications.

WorkSphere is built around a **Spring Boot REST API backend** with **PostgreSQL** for data persistence and a modern React-based frontend.

---

## 📌 Overview

WorkSphere provides a centralized platform for managing organizational workflows.

The backend handles:

* User authentication and authorization
* Role-based access control
* Employee management
* Department management
* Project management
* Task management
* Attendance tracking
* Leave request management
* Timesheet management and approvals
* Dashboard analytics
* Reports
* Notifications

---

# 🏗️ System Architecture

The application follows a layered backend architecture:

```text
Client / Frontend
        │
        ▼
REST Controllers
        │
        ▼
Service Layer
        │
        ▼
Repository Layer
        │
        ▼
PostgreSQL Database
```

### Request Flow

```text
HTTP Request
     │
     ▼
Controller
     │
     ▼
Service
     │
     ▼
Repository
     │
     ▼
PostgreSQL
     │
     ▼
Response DTO
     │
     ▼
HTTP Response
```

---

# 🚀 Backend Technology Stack

| Technology      | Purpose                          |
| --------------- | -------------------------------- |
| Java            | Backend programming language     |
| Spring Boot     | Backend framework                |
| Spring Web      | REST API development             |
| Spring Security | Authentication and authorization |
| JWT             | Stateless authentication         |
| Spring Data JPA | Database persistence             |
| Hibernate       | ORM implementation               |
| PostgreSQL      | Relational database              |
| Flyway          | Database migration               |
| Maven           | Dependency and build management  |
| Bean Validation | Request validation               |

---

# 🔐 Authentication & Security

WorkSphere uses **JWT-based authentication**.

### Authentication Flow

```text
User Login
    │
    ▼
Authentication Request
    │
    ▼
Validate Credentials
    │
    ▼
Generate JWT Token
    │
    ▼
Return Token to Client
    │
    ▼
Client sends JWT with future requests
```

Protected requests use:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 👥 User Roles

## 👑 ADMIN

Administrators can manage organization-wide data, including:

* Employees
* Departments
* Projects
* Tasks
* Reports
* Organization-level information

## 👨‍💼 MANAGER

Managers can:

* Manage team members
* Manage projects and tasks
* Review leave requests
* Review employee timesheets
* Access management dashboards
* View reports

## 👨‍💻 EMPLOYEE

Employees can:

* View assigned tasks
* Manage leave requests
* Create and submit timesheets
* View personal dashboard information
* Track work-related activities

---

# 📂 Backend Project Structure

```text
backend/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
│
├── .mvn/
│
└── src/
    │
    └── main/
        │
        ├── java/
        │   │
        │   └── com/
        │       └── sri/
        │           └── worksphere/
        │               ├── config/
        │               ├── controller/
        │               ├── dto/
        │               │   ├── request/
        │               │   └── response/
        │               ├── entity/
        │               ├── exception/
        │               ├── repository/
        │               └── service/
        │
        └── resources/
            └── application.properties
```

---

# 🧩 Core Backend Modules

## 🔐 Authentication

Handles user registration, login, and JWT-based authentication.

```text
POST /api/auth/register
POST /api/auth/login
```

---

## 👨‍💼 Employee Management

Supports:

* Creating employees
* Viewing employee details
* Updating employee information
* Deleting employees
* Associating employees with users
* Associating employees with departments

---

## 🏢 Department Management

Supports:

* Creating departments
* Viewing departments
* Updating department information
* Deleting departments

---

## 📁 Project Management

Supports:

* Creating projects
* Viewing projects
* Updating projects
* Deleting projects
* Assigning managers

---

## ✅ Task Management

Typical task statuses include:

```text
TODO
IN_PROGRESS
REVIEW
DONE
```

Supports:

* Creating tasks
* Assigning employees
* Updating tasks
* Updating task status
* Tracking project tasks

---

## 🕒 Attendance Management

Supports employee attendance tracking and attendance-based dashboard statistics.

---

## 🏖️ Leave Management

Supports:

* Applying for leave
* Viewing leave requests
* Viewing pending requests
* Approving leave requests
* Rejecting leave requests
* Cancelling eligible leave requests

---

## ⏱️ Timesheet Management

The timesheet workflow supports:

```text
DRAFT
  │
  ▼
SUBMITTED
  │
  ▼
Manager Review
  │             │
  ▼             ▼
APPROVED     REJECTED
```

Employees can:

* Create timesheets
* Update timesheets
* Submit timesheets
* View personal timesheets

Managers can:

* View submitted timesheets
* Approve timesheets
* Reject timesheets

---

## 📊 Dashboard

Dashboard data includes:

* Total employees
* Total projects
* Total tasks
* Pending leave requests
* Attendance statistics
* Task status summaries
* Employee-specific statistics

---

## 📈 Reports

The reporting module provides summarized information related to:

* Employees
* Departments
* Projects
* Tasks
* Leave requests
* Timesheets

---

## 🔔 Notifications

Provides backend support for application notifications and workflow updates.

---

# 🗄️ Database

WorkSphere uses **PostgreSQL**.

Example configuration:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/worksphere
spring.datasource.username=postgres
spring.datasource.password=YOUR_DATABASE_PASSWORD
```

The main configuration file is located at:

```text
backend/src/main/resources/application.properties
```

### JPA / Hibernate

```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### Flyway

```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=1
```

---

# ⚙️ Prerequisites

Install the following:

* Java
* PostgreSQL
* Maven
* Git

Verify your installation:

```bash
java -version
psql --version
```

---

# 🚀 Running the Backend

## 1. Clone the Repository

```bash
git clone https://github.com/Yeswanth494/workmanager.git
```

Move into the project:

```bash
cd workmanager
```

---

## 2. Configure PostgreSQL

Create the database:

```sql
CREATE DATABASE worksphere;
```

Update:

```text
backend/src/main/resources/application.properties
```

Configure your PostgreSQL credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/worksphere
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

---

## 3. Run the Backend

Move into the backend directory:

```bash
cd backend
```

### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
./mvnw spring-boot:run
```

---

# 📦 Build the Backend

### Windows

```powershell
.\mvnw.cmd clean package
```

### Linux / macOS

```bash
./mvnw clean package
```

The generated JAR will be available in:

```text
backend/target/
```

---

# 🔌 API Overview

The backend exposes REST APIs for the following modules:

```text
/api/auth
/api/dashboard
/api/employees
/api/departments
/api/projects
/api/tasks
/api/leave
/api/timesheets
/api/attendance
/api/reports
/api/notifications
```

---

# 🧪 Example Login Request

```http
POST /api/auth/login
Content-Type: application/json
```

Example request body:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Protected API requests require:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 🛡️ Security

The backend implements:

* JWT authentication
* Password encryption
* Role-based authorization
* Protected API endpoints
* Stateless authentication
* Request validation

Supported roles:

```text
ADMIN
MANAGER
EMPLOYEE
```

---

# ⚠️ Error Handling

The backend handles common scenarios such as:

* Resource not found
* Invalid requests
* Duplicate data
* Unauthorized access
* Forbidden operations
* Invalid workflow states

---

# 🔄 Example Business Workflow

## Timesheet Approval Workflow

```text
Employee
   │
   ▼
Create Timesheet
   │
   ▼
DRAFT
   │
   ▼
Submit Timesheet
   │
   ▼
SUBMITTED
   │
   ▼
Manager Review
   │
   ├──────────────► APPROVED
   │
   └──────────────► REJECTED
```

---

# 📋 Project Status

## Backend

* [x] Authentication
* [x] JWT security
* [x] Role-based authorization
* [x] Employee management
* [x] Department management
* [x] Project management
* [x] Task management
* [x] Attendance management
* [x] Leave management
* [x] Timesheet management
* [x] Timesheet approval workflow
* [x] Dashboard APIs
* [x] Reports
* [x] Notifications
* [x] PostgreSQL integration
* [x] JPA/Hibernate integration
* [x] Flyway configuration

---

# 🔮 Future Improvements

* Refresh token support
* Email notifications
* Swagger / OpenAPI documentation
* Audit logging
* Docker support
* CI/CD pipeline
* Production environment profiles
* Environment-variable-based secrets
* Rate limiting
* Advanced reporting
* Automated testing

---

# 🔒 Security Note

**Do not commit real database passwords, JWT secrets, API keys, or other sensitive credentials to GitHub.**

Use environment variables or separate local configuration files for sensitive values.

---

# 👨‍💻 Author

**Srinivasa Yeswanth Kona**

B.Tech Computer Science and Engineering

---

# 📄 License

This project is currently intended for educational and portfolio purposes.

---

## ⭐ WorkSphere

A centralized workforce and project management platform built using modern full-stack technologies.

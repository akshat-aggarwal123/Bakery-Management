# 🍞 Bakery Management System

A full-stack bakery management system with Node.js backend and React frontend, featuring user management, product catalog, shopping cart, and order system with RabbitMQ + PostgreSQL integration.

## ✨ Key Features

### *Backend (Node.js + Express)*
| Component | Details |
|-----------|---------|
| *User Management* | JWT authentication • Role-based access control |
| *Product Catalog* | CRUD operations • Prisma ORM integration • PostgreSQL database |
| *Shopping Cart* | Cart operations with real-time validations |
| *Order System* | RabbitMQ message queuing for order processing |
| *Performance* | Optimized Prisma queries • Dockerized microservices architecture |

### *Frontend (React)*
- User login and registration
- Product browsing and shopping cart management
- Token-based session handling (JWT)
- Responsive UI 
- Axios for API communication
- Role-based access views (user/admin)

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User((User)) -->|Access| Frontend[React Frontend]
    Frontend -->|API Requests| Backend[Node.js Backend]
    
    Backend -->|Authentication| JWT[JWT Auth]
    Backend -->|Database Operations| DB[(PostgreSQL)]
    Backend -->|Queue Orders| RMQ[RabbitMQ]
    
    RMQ -->|Process| Consumer[Order Processor]
    Consumer -->|Update| DB
    
    subgraph "Core Workflows"
        Frontend -->|1. Auth| Backend
        Frontend -->|2. Browse Products| Backend
        Frontend -->|3. Cart Management| Backend
        Frontend -->|4. Place Order| Backend
    end


---

## ⚙ Tech Stack

*Backend*
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)

*Frontend*
![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)


---

## 🚀 Quick Start

### Docker Setup (Recommended)
```bash
# Start all services
docker-compose up --build

# Access:
- API Server: http://localhost:3000 (or your backend port)
- React Frontend: http://localhost:3001 (or your frontend port)
- RabbitMQ Dashboard: http://localhost:15672 (guest/guest)
- PostgreSQL database: localhost:5432

🔧 Implementation Details
Prisma (ORM)
Database schema management

Auto-migration system

Type-safe queries

RabbitMQ
Order processing queue

Event-driven notifications

Scalable background job handling

PostgreSQL
Persistent relational database

Data models managed by Prisma

React Frontend
JWT authentication flow (login, register)

Cart system with live updates

Product browsing UI

Role-based dashboard access

🛠 Local Development
Backend:
cd backend
npm install
node src/index.js

Frontend:
cd frontend
npm install
npm run dev

📝 Environment Variables
Backend (bakery-backend/.env)
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db:5432/bakery_db
JWT_SECRET=yourSuperSecretKey
RABBITMQ_URL=amqp://guest:guest@localhost:5672
ALLOW_ADMIN_CREATION=true
PORT=Port_no.

Frontend (frontend/.env)
REACT_APP_API_URL=http://localhost:3000/api
# 🏪 Vendora — Omnichannel Retail POS & Inventory Management System

[![CI Pipeline](https://github.com/rajan2008/Omnichannel-project/actions/workflows/ci.yml/badge.svg)](https://github.com/rajan2008/Omnichannel-project/actions)

> A cloud-native, omnichannel Point of Sale and Inventory Management System that unifies physical and digital retail operations into a single source of truth.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [System Schema Diagram](#system-schema-diagram)
- [Features](#features)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────────────────┐ │
│  │  React.js   │  │  Redux   │  │   Offline Storage       │ │
│  │  (Vite)     │  │  Toolkit │  │   (localStorage)        │ │
│  │  Tailwind   │  │          │  │   auto-sync on reconnect│ │
│  └──────┬──────┘  └────┬─────┘  └────────────┬────────────┘ │
└─────────┼──────────────┼─────────────────────┼──────────────┘
          │              │                     │
          ▼              ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│                 REST API (Express.js)                        │
│  ┌───────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │   JWT +   │  │   RBAC       │  │   Rate Limiting       │  │
│  │   bcrypt  │  │   Middleware │  │   (express-rate-limit)│  │
│  └───────────┘  └──────────────┘  └───────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                     │   │
│  │  • Atomic Transactions (MongoDB Sessions)             │   │
│  │  • Stock Predictions (30-day velocity algorithm)      │   │
│  │  • Self-Healing Inventory Engine                      │   │
│  │  • Offline-to-Online Bulk Sync                        │   │
│  └───────────────────────────────────────────────────────┘   │
└───────────┬──────────────────────────────┬───────────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────┐    ┌─────────────────────────────┐
│   MongoDB (Mongoose)  │    │   Redis (In-Memory Cache)   │
│   • Users             │    │   • Product catalog cache   │
│   • Products          │    │   • Smart invalidation      │
│   • Orders            │    │   • Graceful fallback       │
│   • Inventory Ledger  │    │     (works without Redis)   │
│   • Stores            │    └─────────────────────────────┘
│   • Activity Logs     │
│   • OTP Records       │
└───────────────────────┘
```

### Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Decoupled frontend/backend** | Independent scaling, separate deployment pipelines |
| **MongoDB Replica Set** | Required for multi-document ACID transactions |
| **Redis with graceful fallback** | System works without Redis; caching is a performance enhancement |
| **Redux Toolkit for state** | Centralized cart + auth state; supports offline mode |
| **JWT (stateless auth)** | Horizontal scalability — no session storage needed |
| **Offline-first POS** | Retail can't stop selling during network outages |

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React.js (Vite) | 19.x |
| **Styling** | Tailwind CSS | 4.x |
| **State** | Redux Toolkit | 2.x |
| **Backend** | Node.js + Express.js | 20.x / 4.x |
| **Database** | MongoDB (Mongoose ODM) | 9.x |
| **Caching** | Redis (ioredis) | 5.x |
| **Auth** | JWT + bcrypt | — |
| **Testing** | Jest | 29.x |
| **Containerization** | Docker + Docker Compose | — |
| **CI/CD** | GitHub Actions | — |
| **Image Upload** | Cloudinary + Multer | — |

---

## 📊 System Schema Diagram

```
┌──────────────┐       ┌──────────────┐        ┌───────────────┐
│    User      │─────▶│    Store     │◀───────│   Product     │
│              │  ref  │              │  ref   │               │
│ • name       │       │ • name       │        │ • name        │
│ • email      │       │ • location   │        │ • sku (unique)│
│ • password   │       │ • admin (ref)│        │ • category    │
│ • role (enum)│       │ • phone      │        │ • costPrice   │
│ • store (ref)│       │ • isActive   │        │ • basePrice   │
│ • isActive   │       │              │        │ • stock       │
│ • isVerified │       │ [Cascade Del]│        │ • threshold   │
└──────┬───────┘       └──────────────┘        │ • promotions  │
       │                                        │ [Text Index]  │
       │                                        └───────┬───────┘
       │                                                │
       ▼                                                ▼
┌──────────────┐                              ┌──────────────────┐
│    Order     │────────────────────────────▶│ Inventory Ledger │
│              │                              │                  │
│ • cashier    │                              │ • product (ref)  │
│ • store      │                              │ • type (IN/OUT)  │
│ • items[]    │                              │ • quantity       │
│ • subtotal   │                              │ • previousStock  │
│ • tax        │                              │ • newStock       │
│ • total      │                              │ • performedBy    │
│ • payment    │                              │ • notes          │
│ • status     │                              └──────────────────┘
│ • channel    │
│ [Compound    │
│  Index]      │
└──────────────┘
```

### RBAC Role Hierarchy

| Role          | Permissions                                                              |
|---------------|--------------------------------------------------------------------------|
| **Admin**     | Full system access: users, stores, products, orders, settings, self-heal |
| **Manager**   | Store-scoped: products, orders, predictions, store management            |
| **Cashier**   | Store-scoped: view products, place orders, cancel orders                 |

---

## ✨ Features

### Core Business Features
- ✅ **Unified Product Catalog** — Multi-variant items with SKU, hierarchical categories, dynamic pricing
- ✅ **Real-Time POS Terminal** — Rapid item addition, cart management, multi-modal payment (cash/card/UPI)
- ✅ **Atomic Transactions** — MongoDB sessions ensure stock + order + ledger update atomically
- ✅ **Omnichannel Order Management** — Orders from POS terminals with store-based routing

### Advanced Features
- ✅ **Offline-to-Online Sync** — Orders saved in localStorage during outages, auto-synced on reconnect
- ✅ **Stock Predictions** — 30-day sales velocity algorithm predicts days-until-stockout
- ✅ **Self-Healing Inventory** — Auto-detects and corrects negative stock anomalies
- ✅ **Redis Caching** — Product catalog cached with smart invalidation; graceful fallback
- ✅ **Cross-Store Recommendations** — Find same product available in other store locations
- ✅ **Bulk Operations** — CSV product upload, category-wide price adjustments
- ✅ **Activity Audit Logs** — Every product/order action logged for compliance
- ✅ **Cascading Deletion** — Store deletion auto-cleans users, products, orders, ledger entries

### Security
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **Role-Based Access Control** — 3-tier RBAC middleware
- ✅ **Rate Limiting** on auth endpoints
- ✅ **Email OTP Verification** for registration
- ✅ **Password Reset** via email token

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **Docker** & Docker Compose
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/rajan2008/Omnichannel-project.git
cd Omnichannel-project
git checkout develop
```

### 2. Start Infrastructure (MongoDB + Redis)

```bash
docker-compose up -d
```

This starts:
- MongoDB with Replica Set (required for transactions) on port `27017`
- Redis on port `6379`

### 3. Backend Setup

```bash
cd backend
cp .env.example .env   # Configure your environment variables
npm install
npm run dev            # Starts on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev            # Starts on http://localhost:5173
```

### 5. Seed Initial Data

```bash
cd backend
node src/utils/seedRealData.js
```

This creates default admin, stores, and sample products.

---

## 📚 API Documentation

### Interactive Swagger UI

Once the backend is running, visit:

```
http://localhost:5000/api-docs
```

### Raw OpenAPI Spec

```
http://localhost:5000/api-docs.json
```

### API Endpoints Summary

| Module       | Endpoint                 | Methods                    |
|--------------|--------------------------|----------------------------|
| Auth         | `/api/auth/*`            | POST, GET, PUT             |
| Inventory    | `/api/inventory/*`       | GET, POST, PATCH, DELETE   |
| Orders       | `/api/orders/*`          | GET, POST, PATCH           |
| Stores       | `/api/stores/*`          | GET, POST, PUT, DELETE     |
| Dashboard    | `/api/dashboard/stats`   | GET                        |
| Admin        | `/api/admin/*`           | All CRUD                   |
| Manager      | `/api/manager/*`         | Scoped CRUD                |
| Cashier      | `/api/cashier/*`         | Orders only                |

---

## 📁 Project Structure

```
Omnichannel-project/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── backend/
│   ├── Dockerfile              # Production container
│   ├── server.js               # Express entry point
│   ├── src/
│   │   ├── config/
│   │   │   ├── connectdb.js    # MongoDB connection
│   │   │   ├── redis.js        # Redis with graceful fallback
│   │   │   ├── cloudinary.js   # Image upload config
│   │   │   └── swagger.js      # OpenAPI/Swagger config
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── orderController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── storeController.js
│   │   │   └── selfHealingController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT + RBAC
│   │   │   ├── errorMiddleware.js
│   │   │   └── rateLimiter.js
│   │   ├── models/
│   │   │   ├── userSchema.js
│   │   │   ├── productSchema.js
│   │   │   ├── orderSchema.js
│   │   │   ├── storeSchema.js
│   │   │   ├── inventoryLedgerSchema.js
│   │   │   └── activityLogSchema.js
│   │   ├── routes/             # Swagger-annotated routes
│   │   └── utils/
│   │       ├── activityLogger.js
│   │       ├── seedRealData.js
│   │       └── sendEmail.js
│   └── tests/
│       ├── transaction.test.js
│       ├── product.test.js
│       ├── roleBasedApi.test.js
│       └── advanced.test.js
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios instances + API modules
│   │   ├── Components/         # Reusable UI components
│   │   ├── pages/              # Route pages (Dashboard, POS, etc.)
│   │   ├── redux/              # Redux Toolkit store + slices
│   │   ├── App.jsx             # Route configuration
│   │   └── main.jsx            # Entry point
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker-compose.yml          # MongoDB RS + Redis
├── api_documentation.md        # API reference guide
└── README.md
```

---

## 🧪 Testing

### Run Unit Tests

```bash
cd backend
npm test
```

Tests cover:
- **Transaction integrity** — Commit/rollback on checkout
- **Stock validation** — Insufficient stock handling
- **Role-based access** — Endpoint permission verification
- **Product CRUD** — Create/read/update/delete operations

### Test Structure

| File                      | Coverage                                         |
|---------------------------|--------------------------------------------------|
| `transaction.test.js`     | MongoDB session transactions, atomic rollback    |
| `product.test.js`         | Product CRUD operations                          |
| `roleBasedApi.test.js`    | RBAC middleware enforcement                      |
| `advanced.test.js`        | Edge cases and advanced flows                    |

---

## 🚢 Deployment

### Backend (Docker)

```bash
cd backend
docker build -t vendora-backend .
docker run -p 5000:5000 --env-file .env vendora-backend
```

### Frontend (Vercel)

```bash
cd frontend
npm run build     # Generates dist/ folder
# Deploy dist/ to Vercel
```

### Full Stack (Docker Compose)

```bash
docker-compose up -d    # MongoDB + Redis
cd backend && npm start # or use Docker
cd frontend && npm run dev
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vendora
JWT_SECRET=your_jwt_secret_here
SALT_ROUNDS=10
REDIS_URL=redis://127.0.0.1:6379

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 👥 Team

Built as part of the **Infotact Technical Internship Program** — Bengaluru, Karnataka.

---

## 📄 License

This project is for educational and evaluation purposes under the Infotact internship program.

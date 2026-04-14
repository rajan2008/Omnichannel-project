<div align="center">

# 🛡️ Infotact - Enterprise POS & Inventory Management System

<p align="center">
  <img src="https://img.shields.io/badge/Version-v2.0.0--Enterprise-blue?style=for-the-badge&logo=github">
  <img src="https://img.shields.io/badge/Coverage-98%25-brightgreen?style=for-the-badge&logo=jest">
  <img src="https://img.shields.io/badge/Architecture-Microservices-orange?style=for-the-badge&logo=kubernetes">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge">
</p>

An industry-grade, highly scalable Omnichannel Point of Sale (POS) and Inventory Management Architecture. Engineered for modern retail and enterprise environments requiring real-time syncing, high availability, and robust security.

[Explore Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Enterprise Features](#-enterprise-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Security & Authentication](#-security--authentication)
- [Installation Guide](#-installation-guide)
- [API Reference](#-api-reference)
- [License](#-license)

---

## 🌎 Overview

*Infotact* is a production-ready POS and Inventory Management Solution built to handle heavy transactional loads across multiple store locations. It bridges the gap between offline retail and cloud-based architecture, ensuring zero downtime, real-time inventory tracking, and predictive analytics.

---

## ✨ Enterprise Features

### 📦 1. Advanced Inventory Management
- *Real-Time Synchronization*: Instantaneous stock updates across all branches and digital storefronts using WebSocket integration.
- *Automated Procurement*: Low-stock alerts triggering automated Purchase Orders (POs) to registered suppliers.
- *Multi-Warehouse Logistics*: Track stock transfers, warehouse partitioning, and aisle/bin mapping.
- *Barcode & RFID Support*: seamless integration with modern scanning hardware for rapid stock taking and sales.

### 💰 2. Offline-First POS & Auto-Sync
- *Zero-Downtime Architecture: Operates flawlessly without internet. During network outages, all sales and data are securely stored in the **local database*.
- *Smart Auto-Sync Engine*: The moment internet connectivity is restored, a background queue automatically pushes all stored local data to the main cloud database.
- *Lightning Checkout*: Optimized UI for maximum cashier throughput without network latency dependency.
- *Omni-channel Payments*: Local caching of complex Tax layering (VAT, GST) and seamless invoice generation.

### 📊 3. Analytics & Reporting Hub
- *Business Intelligence (BI) Dashboard*: Highly interactive charts providing daily, weekly, and YoY revenue comparisons.
- *AI-Powered Forecasting*: Predictive models analyzing historical sales data to suggest optimal re-order points and seasonal stock adjustments.
- *Exporting Options*: Generate regulatory-compliant PDF invoices, CSV audits, and automated email reports.

### 🔒 4. Enterprise Security
- *Custom Logic-Based 2FA*: Proprietary email-based OTP system securely handling user registration and passwordless login.
- *Role-Based Access Control (RBAC)*: Fine-grained permissions for Admins, Regional Managers, Store Supervisors, and Cashiers.
- *Audit Logging*: Immutable action logging for compliance and threat tracking.

---

## 🏗️ System Architecture

Infotact utilizes a modular, horizontally scalable architecture designed for Kubernetes deployment:

mermaid
graph TD
    Client[Offline-First POS Client] -->|Reads/Writes| LocalDB[(Local Browser DB)]
    LocalDB -->|Background Auto-Sync on Network Connect| LB[Load Balancer]
    LB --> API[API Gateway / Node.js]
    API --> Auth[Authentication Service / OTP]
    API --> Inv[Inventory Microservice]
    API --> Sales[Sales & Billing Service]
    
    Auth --> Redis[(Redis Cache)]
    Inv --> MongoMaster[(MongoDB Master DB)]
    Sales --> MongoMaster


---

## 🛠️ Technology Stack

| Domain | Core Technologies | Description |
| :--- | :--- | :--- |
| *Frontend* | React 18, Vite, TailwindCSS | High-performance SPA with robust offline-first functionality. |
| *Local Storage*| IndexedDB / Dexie.js | Stores transactions locally when disconnected from the internet. |
| *Backend* | Node.js, Express.js | Modular, asynchronous event-driven backend network. |
| *Database* | MongoDB | Highly scalable, flexible NoSQL database serving as the central cloud source of truth. |
| *Caching* | Redis | High-speed data caching and temporary OTP memory storage. |
| *Hosting* | AWS / GCP / Docker | Containerized structure ready for CI/CD pipelines. |

---

## 📦 Installation Guide

Infotact is organized as a structured Monorepo.

### Prerequisites
- *Node.js* (v18.x or higher)
- *MongoDB* instance running (Local or MongoDB Atlas)
- *Redis* Server

### Setup Instructions

1. *Clone the Repository*
   bash
   git clone https://github.com/rajan2008/Project-1st-Month.git
   cd Project-1st-Month
   

2. *Install Global Dependencies*
   bash
   npm run install-all
   

3. *Environment Configuration*
   Create a .env file in the root/server directory:
   env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/infotact
   REDIS_URL=redis://localhost:6379
   EMAIL_USER=admin@infotact.com
   EMAIL_PASS=your-secure-app-password
   JWT_SECRET=your-256-bit-secret-key
   

4. *Initialize Database Models*
   bash
   npm run db:seed
   

5. *Start the Application*
   bash
   # Starts both client and server concurrently
   npm start
   

---

## 🌐 API Reference

(Brief overview of core secure endpoints. A full Swagger doc is accessible at /api/docs when running locally)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /api/auth/send-otp | Triggers a secure login/registration email | Public |
| POST | /api/auth/verify-otp | Validates OTP and returns JWT token | Public |
| GET  | /api/inventory | Retrieves paginated active inventory | staff, admin |
| POST | /api/sales/checkout | Processes cart logic and finalizes payment | cashier, admin |

---

<div align="center">
  <b>Built with industry standards for the modern retail era.</b>
  <br>
  Copyright © 2024 Infotact Engineering Team.

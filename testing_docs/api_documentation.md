# Vendora POS & Inventory - Backend API Documentation

This document provides all the necessary details for the frontend team to integrate with the backend.

## Base URL
`http://localhost:5000` (or as configured in `.env`)

---

## 1. Authentication Endpoints (`/api/auth`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/register` | `POST` | Public | Register a new user (Default role: Cashier). |
| `/login` | `POST` | Public | Authenticate user and receive JWT. |
| `/forgot-password` | `POST` | Public | Send a password reset email. |
| `/reset-password/:token` | `PUT` | Public | Reset password using the token from email. |
| `/create-user` | `POST` | Admin/Manager | Manually create Admin, Manager, or Cashier accounts. |
| `/profile` | `GET` | Protected | Fetch current user's profile details. |

---

## 2. Inventory Management (`/api/inventory`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Protected | List products. Supports query params: `page`, `limit`, `search`. |
| `/` | `POST` | Admin/Manager | Create a new product. |
| `/predictions` | `GET` | Admin/Manager | Get AI-driven stock depletion predictions (Days remaining). |
| `/bulk-price-update` | `PATCH` | Admin | Update prices for an entire category by percentage. |
| `/bulk-upload` | `POST` | Admin | Upload a list of products in bulk. |
| `/:productId/recommendations` | `GET` | Protected | Find the same product in other stores (for out-of-stock scenarios). |
| `/self-heal` | `POST` | Admin | Trigger system self-healing for inventory data integrity. |

---

## 3. Order & POS Operations (`/api/orders`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/checkout` | `POST` | Protected | Process a new sale, update stock atomically. |
| `/bulk-sync` | `POST` | Protected | Sync multiple orders from offline storage (localDB). |
| `/:id/cancel` | `PATCH` | Protected | Cancel an order and automatically restore stock. |

---

## 4. Store Management (`/api/stores`)

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Protected | Fetch all active store locations. |
| `/:id` | `GET` | Protected | Get detailed info for a specific store. |
| `/` | `POST` | Admin/Manager | Register a new physical store location. |
| `/:id` | `PUT` | Admin/Manager | Update store details (address, contact, etc.). |
| `/:id` | `DELETE` | Admin | Delete a store (triggers cascading deletion of products). |

---

## Core System Features (For Team List)

1.  **Real-time Omnichannel Tracking**: Sync stock across multiple physical locations seamlessly.
2.  **Intelligent Stock Predictions**: Predicts stockout dates based on the last 30 days of sales data.
3.  **Self-Healing Mechanism**: Background logic that identifies and corrects stock level discrepancies automatically.
4.  **Offline-to-Online Sync**: Robust `/bulk-sync` logic to handle sales made during internet outages.
5.  **Atomic Transactions**: MongoDB sessions ensure that order placement and stock reduction happen together or not at all (no partial failures).
6.  **Smart Store Recommendations**: If a product is out of stock in Store A, the system tells you which nearby Store B has it.
7.  **Bulk Price Engine**: Adjust pricing for thousands of items instantly via category-based bulk updates.
8.  **Automated Activity Logs**: Every major product change is logged for auditing purposes.
9.  **Cascading Data Cleanup**: Deleting a store automatically removes all associated inventory and logs to prevent "ghost data".
10. **Redis Caching**: High-performance caching for frequently accessed product data.

---

## Important Frontend Tips:
- **Auth Header**: All "Protected" routes require `Authorization: Bearer <token>`.
- **Error Handling**: The backend returns standardized error messages in `{ "message": "error description" }` format.
- **Role Control**: Use the `role` field from the login response (`admin`, `manager`, `cashier`) to toggle UI elements.

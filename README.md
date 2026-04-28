# Omnichannel POS & Inventory System

## Recent Updates

### 1. Dashboard API Integration
- **Backend**: 
  - Created a new `dashboardController.js` to aggregate and compute overall statistics (Total Users, Total Products, Total Orders, and Total Revenue).
  - Created `dashboardRoutes.js` with a protected endpoint (`GET /api/dashboard/stats`).
  - Mounted the dashboard routes in `server.js`.
- **Frontend**: 
  - Configured a global request interceptor in `src/api/axios.js` to automatically attach the `Bearer` token to all outbound API requests.
  - Connected the `Dashboard.jsx` frontend page to the backend API.
  - Rendered the fetched dynamic statistics onto the dashboard view using Axios.

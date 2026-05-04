# 🚀 Testing & CI/CD Guide

This project now includes enterprise-grade CI/CD and automated testing to ensure stability before every deployment.

## 1. Automated Testing (Local)

### 🧪 E2E Testing (Cypress)
Cypress runs real browser tests to simulate user actions (Login, Add to Cart, Inventory Management).

*   **To open the interactive Test Runner:**
    ```bash
    cd frontend
    npx cypress open
    ```
    *Pick "E2E Testing" -> "Chrome" -> Run any `.cy.js` file.*

*   **To run tests in Headless Mode (Fast):**
    ```bash
    cd frontend
    npm run test:e2e
    ```

### ⚙️ Unit Testing (Jest)
Tests individual functions and API logic.

*   **Backend Tests:**
    ```bash
    cd backend
    npm test
    ```
*   **Frontend Component Tests:**
    ```bash
    cd frontend
    npm test
    ```

---

## 2. CI/CD Pipeline (GitHub Actions)

Every time you `git push` to `develop` or `main`, GitHub automatically runs the workflow defined in `.github/workflows/ci.yml`.

### What happens in the pipeline?
1.  **Environment Setup**: Installs Node.js and dependencies.
2.  **Lint Check**: Ensures code follows consistent formatting rules.
3.  **Build Verification**: Checks if both Backend and Frontend can build without errors.
4.  **Security Audit**: Scans for vulnerable dependencies.
5.  **Automated Tests**: Runs Jest and Cypress (headless) to ensure nothing is broken.

### How to check results?
1.  Go to your repository on **GitHub**.
2.  Click on the **Actions** tab.
3.  You will see a list of "Workflows". Green checkmark (✅) means everything is fine. Red cross (❌) means something failed.

---

## 3. Production Deployment (Render/Docker)

If you are using Render.com or Docker:
*   **Render**: Connected to your GitHub `develop` branch. It will only deploy **AFTER** the GitHub Actions (CI) pass successfully.
*   **Docker**: 
    ```bash
    docker-compose up --build
    ```
    This will start the entire stack (MongoDB, Redis, Backend, Frontend) locally exactly as it would run in production.

---

## 🛠 Troubleshooting
*   **Port Conflicts**: Ensure your local Backend (5000) and Frontend (5173) are running if you are running Cypress locally.
*   **Environment Variables**: Double-check `.env` in both folders for DB connections.

> [!TIP]
> Always run `npm run test:e2e` locally before pushing code to ensure you don't break the CI pipeline!

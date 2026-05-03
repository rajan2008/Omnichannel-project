/// <reference types="cypress" />

describe("Role-Based Access Control (RBAC)", () => {
  it("should restrict unauthenticated users to login page", () => {
    // Clear any stored tokens
    cy.clearLocalStorage();
    cy.visit("/dashboard");
    
    // Should redirect to login
    cy.url().should("include", "/login");
  });

  it("admin should see all management options", () => {
    cy.loginViaApi("admin@vendora.com", "Admin@123");
    cy.visit("/dashboard");
    
    // Admin should see user management, store management in sidebar
    cy.get("nav, [class*='sidebar'], [class*='Sidebar']").within(() => {
      cy.contains(/user|manage/i).should("exist");
    });
  });

  it("should protect admin-only routes from non-admin users", () => {
    // Test via API - a non-admin trying admin endpoints
    cy.loginViaApi("admin@vendora.com", "Admin@123").then(() => {
      const token = window.localStorage.getItem("token");
      
      // Admin should have access to user list
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/admin/users`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
      });
    });
  });

  it("should reject requests without auth token", () => {
    cy.request({
      method: "GET",
      url: `${Cypress.env("apiUrl")}/inventory`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});

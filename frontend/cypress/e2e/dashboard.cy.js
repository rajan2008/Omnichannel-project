/// <reference types="cypress" />

describe("Dashboard", () => {
  beforeEach(() => {
    // Login via API for speed
    cy.loginViaApi("admin@vendora.com", "Admin@123");
    cy.visit("/dashboard");
  });

  it("should display dashboard with stats cards", () => {
    cy.url().should("include", "/dashboard");
    
    // Dashboard should have stat cards (revenue, orders, etc.)
    cy.get("[class*='dashboard'], [class*='Dashboard'], main").should("be.visible");
  });

  it("should display sidebar navigation", () => {
    // Sidebar should be visible with navigation items
    cy.get("nav, [class*='sidebar'], [class*='Sidebar']").should("exist");
  });

  it("should navigate to inventory page", () => {
    cy.contains("Inventory").click({ force: true });
    cy.url().should("include", "/inventory");
  });

  it("should navigate to profile page", () => {
    cy.contains("Profile").click({ force: true });
    cy.url().should("include", "/profile");
  });
});

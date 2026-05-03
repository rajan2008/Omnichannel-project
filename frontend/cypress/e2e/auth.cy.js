/// <reference types="cypress" />

describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should display the login page", () => {
    cy.url().should("include", "/login");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });

  it("should show error on invalid credentials", () => {
    cy.get('input[type="email"]').type("wrong@email.com");
    cy.get('input[type="password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();
    
    // Should show error toast or stay on login page
    cy.url().should("include", "/login");
  });

  it("should login successfully with valid credentials and redirect to dashboard", () => {
    // Use the seeded admin account
    cy.get('input[type="email"]').type("rajanprajapati41190@gmail.com");
    cy.get('input[type="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should("include", "/dashboard", { timeout: 10000 });
    
    // Verify token is stored
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.not.be.null;
    });
  });

  it("should navigate to register page", () => {
    cy.contains("Create your workspace account").click();
    cy.url().should("include", "/register");
  });

  it("should navigate to forgot password page", () => {
    cy.contains("Reset Passcode").click();
    cy.url().should("include", "/forgot-password");
  });
});

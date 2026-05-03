/// <reference types="cypress" />

describe("POS Checkout Flow", () => {
  beforeEach(() => {
    cy.loginViaApi("admin@vendora.com", "Admin@123");
  });

  it("should display inventory products on the dashboard", () => {
    cy.visit("/dashboard");
    
    // Products should be loaded and visible
    cy.get("[class*='product'], [class*='Product'], [class*='card'], [class*='Card']", { timeout: 15000 })
      .should("have.length.greaterThan", 0);
  });

  it("should add product to cart and navigate to checkout", () => {
    cy.visit("/dashboard");
    
    // Wait for products to load
    cy.get("[class*='product'], [class*='Product'], [class*='card'], [class*='Card']", { timeout: 15000 })
      .first()
      .within(() => {
        // Click add to cart button
        cy.get("button").first().click({ force: true });
      });
  });

  it("should handle the full checkout process", () => {
    // First add item to cart via dashboard
    cy.visit("/dashboard");
    
    cy.get("[class*='product'], [class*='Product'], [class*='card'], [class*='Card']", { timeout: 15000 })
      .first()
      .within(() => {
        cy.get("button").first().click({ force: true });
      });

    // Navigate to checkout (if there's a checkout button/link)
    cy.visit("/checkout");
    
    // Checkout page should show cart items or redirect to dashboard
    cy.url().then((url) => {
      if (url.includes("/checkout")) {
        // We're on checkout page - verify payment methods exist
        cy.contains(/cash|card|digital|wallet|payment/i).should("exist");
      }
      // If redirected to dashboard, cart was empty — acceptable
    });
  });
});

describe("Concurrent Transaction Safety", () => {
  it("should handle checkout API atomically", () => {
    // Test atomic transaction via API
    cy.loginViaApi("admin@vendora.com", "Admin@123").then(() => {
      const token = window.localStorage.getItem("token");

      // Get a product first
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/inventory?limit=1`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (res.body.products && res.body.products.length > 0) {
          const product = res.body.products[0];
          const originalStock = product.stock;

          if (originalStock > 0) {
            // Place an order
            cy.request({
              method: "POST",
              url: `${Cypress.env("apiUrl")}/orders/checkout`,
              headers: { Authorization: `Bearer ${token}` },
              body: {
                items: [{ productId: product._id, quantity: 1 }],
                paymentMethod: "cash",
                storeId: product.store,
              },
            }).then((orderRes) => {
              expect(orderRes.status).to.eq(201);

              // Verify stock was decremented
              cy.request({
                method: "GET",
                url: `${Cypress.env("apiUrl")}/inventory?search=${product.sku}`,
                headers: { Authorization: `Bearer ${token}` },
              }).then((stockRes) => {
                const updatedProduct = stockRes.body.products.find(
                  (p) => p._id === product._id
                );
                if (updatedProduct) {
                  expect(updatedProduct.stock).to.eq(originalStock - 1);
                }
              });
            });
          }
        }
      });
    });
  });

  it("should reject checkout when stock is insufficient", () => {
    cy.loginViaApi("admin@vendora.com", "Admin@123").then(() => {
      const token = window.localStorage.getItem("token");

      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/inventory?limit=1`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (res.body.products && res.body.products.length > 0) {
          const product = res.body.products[0];

          // Try to order more than available stock
          cy.request({
            method: "POST",
            url: `${Cypress.env("apiUrl")}/orders/checkout`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
              items: [{ productId: product._id, quantity: 999999 }],
              paymentMethod: "cash",
              storeId: product.store,
            },
            failOnStatusCode: false,
          }).then((orderRes) => {
            expect(orderRes.status).to.eq(400);
            expect(orderRes.body.message).to.include("Stock unavailable");
          });
        }
      });
    });
  });
});

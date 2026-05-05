// ***********************************************************
// Cypress E2E Support File
// Loaded before every test file
// ***********************************************************

// Custom commands for Vendora POS

/**
 * Login via API and store token (bypass UI for speed)
 */
Cypress.Commands.add("loginViaApi", (email, password) => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/auth/login`,
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem("token", response.body.token);
    window.localStorage.setItem("user", JSON.stringify(response.body.user));
  });
});

/**
 * Login via the UI form
 */
Cypress.Commands.add("loginViaUI", (email, password) => {
  cy.visit("/login");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

/**
 * Ensure user is logged out
 */
Cypress.Commands.add("logout", () => {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
  cy.visit("/login");
});

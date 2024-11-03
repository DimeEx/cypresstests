// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Cypress.Commands.add('loginToApp', () => {
//   cy.visit('/login');
//   cy.get('[placeholder="Email"]').type('dime@dime.com ');
//   cy.get('[placeholder="Password"]').type('123456');
//   cy.get('form').submit();
// });

Cypress.Commands.add('loginToApp', () => {
  const userData = {
    user: {
      // email: 'dime@dime.com',
      // password: '123456',
      email: Cypress.env('username'),
      password: Cypress.env('password'),
    },
  };

  cy.request(
    'POST',
    'https://conduit-api.bondaracademy.com/api/users/login',
    userData
  )
    .its('body')
    .then((body) => {
      const token = body.user.token;
      cy.wrap(token).as('token');
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('jwtToken', token);
        },
      });
    });
  cy.get('.navbar-nav a.nav-link')
    .eq(3)
    .invoke('attr', 'href')
    .then((attr) => {
      expect(attr).to.contain('/profile/');
    });
  cy.get('app-article-preview').should('be.visible');
  cy.screenshot('Capturing the screenshot after successful login');
});

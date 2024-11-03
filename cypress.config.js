const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'rfwec2',
  viewportHeight: 1080,
  viewportWidth: 1920,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Api testing with Cypress',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  env: {
    username: 'dime@dime.com',
    password: '123456',
  },
  video: false,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('cypress-mochawesome-reporter/plugin')(on);
    },
    baseUrl: 'https://conduit.bondaracademy.com/',
    watchForFileChanges: false,
  },
});

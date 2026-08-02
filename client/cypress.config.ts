import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        specPattern: 'cypress/integration/**/*.spec.{js,ts}',
        supportFile: 'cypress/support/e2e.ts',
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
    env: {
        adminUser: 'admin@example.com',
        adminPass: 'AdminPass1!',
        appUser: 'testuser@example.com',
        appPass: 'Password1!'
    },
    viewportWidth: 1280,
    viewportHeight: 720,
});

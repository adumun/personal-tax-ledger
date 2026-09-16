const baseURL = process.env.PTL_E2E_BASE_URL || 'http://127.0.0.1:5173';

export default {
  testDir: './e2e',
  testMatch: /il-004-.*\.spec\.mjs$/,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  webServer: {
    command: 'make up',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000
  },
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
};

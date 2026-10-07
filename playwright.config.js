import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'tests/browser', timeout:90000, workers:1,
  use:{ baseURL:'http://127.0.0.1:4173', viewport:{ width:1600, height:1000 }, ignoreHTTPSErrors:true },
  webServer:{ command:'node scripts/serve-tests.mjs', url:'http://127.0.0.1:4173', reuseExistingServer:true },
});

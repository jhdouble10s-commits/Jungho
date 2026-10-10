import { defineConfig } from '@playwright/test';
const port=Number(process.env.SITESCOUT_TEST_PORT || 4173);
const baseURL=process.env.SITESCOUT_TEST_BASE_URL || `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir:'tests/browser', timeout:90000, workers:1,
  use:{ baseURL, viewport:{ width:1600, height:1000 }, ignoreHTTPSErrors:true },
  webServer:{ command:`PORT=${port} node scripts/serve-tests.mjs`, url:baseURL, reuseExistingServer:true },
});

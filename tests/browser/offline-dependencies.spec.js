import { test, expect } from '@playwright/test';
import { mockApprovedSession } from './approved-session.js';

test('editor starts without public CDN requests', async ({page}) => {
  await mockApprovedSession(page);
  const externalRequests = [];
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.route(/^https:\/\/(?:cdn\.jsdelivr\.net|esm\.sh|unpkg\.com|cdnjs\.cloudflare\.com)\//, route => {
    externalRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await expect(page.locator('.sb-header')).toBeVisible();
  await expect(page.locator('#phonePreview')).toBeVisible();
  await expect(page.locator('#preview')).toBeVisible();
  await expect(page.locator('.ProseMirror')).toBeAttached();
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  expect(externalRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
});

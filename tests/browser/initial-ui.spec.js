import {cacheCdn} from './cdn-cache.js';
import { test, expect } from '@playwright/test';

const supabaseUrl = 'https://htzojicodwueivybovhy.supabase.co';
const user = {
  id: '00000000-0000-4000-8000-000000000001', email: 'jungho@users.sitescout.local',
  app_metadata: {}, user_metadata: { username: 'jungho' }, is_anonymous: false,
};

async function arrangeBoot(page, { withSavedProject = false } = {}) {
  await cacheCdn(page);
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const session = {
    access_token: `header.${Buffer.from(JSON.stringify({ sub: user.id, exp: expiresAt })).toString('base64url')}.signature`,
    refresh_token: 'boot-test-refresh', expires_at: expiresAt, expires_in: 3600,
    token_type: 'bearer', user,
  };
  await page.addInitScript(({ authSession, saved }) => {
    localStorage.setItem('sb-htzojicodwueivybovhy-auth-token', JSON.stringify(authSession));
    if (!saved) return;
    const request = indexedDB.open('epub-builder-projects', 20);
    request.onupgradeneeded = () => {
      const database = request.result;
      const projects = database.createObjectStore('projects', { keyPath: ['ownerId', 'title'] });
      projects.createIndex('ownerId', 'ownerId');
      projects.createIndex('updatedAt', 'updatedAt');
      const assets = database.createObjectStore('assets', { keyPath: ['ownerId', 'title', 'name'] });
      assets.createIndex('[ownerId+title]', ['ownerId', 'title']);
      assets.createIndex('ownerId', 'ownerId');
      database.createObjectStore('workspace', { keyPath: 'ownerId' });
    };
    request.onsuccess = () => {
      const transaction = request.result.transaction(['projects', 'workspace'], 'readwrite');
      transaction.objectStore('projects').put({ ownerId: authSession.user.id, title: '저장된 원고', payload: { title: '저장된 원고', chapters: [{ id: 'saved-chapter', title: '저장된 장', xhtml: '<p>보존된 본문</p>', body: '<p>보존된 본문</p>', fileName: 'saved.xhtml', originalPath: 'EPUB/text/saved.xhtml' }], selectedChapterId: 'saved-chapter' }, updatedAt: new Date().toISOString() });
      transaction.objectStore('workspace').put({ ownerId: authSession.user.id, title: '저장된 원고' });
      transaction.oncomplete = () => request.result.close();
    };
  }, { authSession: session, saved: withSavedProject });
  await page.route(`${supabaseUrl}/**`, async route => {
    const path = new URL(route.request().url()).pathname;
    const body = path.endsWith('/user') ? user
      : path.endsWith('/user_profiles') ? { user_id: user.id, username: 'jungho', display_name: 'jungho', role: 'admin', status: 'approved' }
        : [];
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    window.__bootFrames = [];
    const sample = () => {
      const app = document.querySelector('.app');
      if (app) window.__bootFrames.push({ visibility: getComputedStyle(app).visibility, current: document.documentElement.dataset.appUiReady === 'true' && Boolean(document.querySelector('.sb-header')) });
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

for (const [label, options] of [
  ['hard refresh without a project', { withSavedProject: false }],
  ['new tab with a saved Dexie project', { withSavedProject: true }],
]) {
  test(`initial UI never exposes legacy markup during ${label}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => console.log('Failed request:', request.url(), request.failure()?.errorText));
    page.on('console', message => { if (message.type() === 'error') console.log(message.text()); });
    await arrangeBoot(page, options);
    await page.goto('/');
    await expect(page.locator('.app')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#accessMessage')).toBeHidden();
    expect(await page.locator('.workspace-tabs').count()).toBe(0);
    expect(await page.locator('#pageTitle').count()).toBe(0);
    if (options.withSavedProject) {
      await expect(page.locator('#title')).toHaveValue('저장된 원고');
      await expect(page.frameLocator('.preview-isolated-frame').locator('body')).toContainText('보존된 본문');
    }
    const frames = await page.evaluate(() => window.__bootFrames);
    expect(frames.some(frame => frame.visibility !== 'hidden' && !frame.current)).toBe(false);
    await page.reload();
    await expect(page.locator('.app')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#accessMessage')).toBeHidden();
    const reloadFrames = await page.evaluate(() => window.__bootFrames);
    expect(reloadFrames.some(frame => frame.visibility !== 'hidden' && !frame.current)).toBe(false);
    await expect(page.locator('.ProseMirror')).toBeAttached({ timeout: 30000 });
    await page.locator('.new-book').click();
    await page.locator('#add').click();
    await expect(page.locator('#list .chapter')).toHaveCount(3);
    if (!options.withSavedProject) {
      await page.locator('#title').fill('부팅 복구 회귀 테스트');
      await page.locator('.ProseMirror').fill('편집 후 저장한 본문');
      await expect(page.frameLocator('.preview-isolated-frame').locator('body')).toContainText('편집 후 저장한 본문');
      await page.getByRole('button', { name: '임시저장', exact: true }).click();
      await expect(page.locator('#status')).toContainText('로컬');
      await page.reload();
      await expect(page.locator('.app')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('#title')).toHaveValue('부팅 복구 회귀 테스트');
      await expect(page.frameLocator('.preview-isolated-frame').locator('body')).toContainText('편집 후 저장한 본문');
    }
    expect(errors).toEqual([]);
  });
}


test('startup screen follows real access and editor phases, fits mobile and respects reduced motion', async ({ page }, testInfo) => {
  await arrangeBoot(page);
  let releaseAccess, releaseEditor;
  const accessGate = new Promise(resolve => { releaseAccess = resolve; });
  const editorGate = new Promise(resolve => { releaseEditor = resolve; });
  await page.route(`${supabaseUrl}/rest/v1/user_profiles*`, async route => { await accessGate; await route.fallback(); });
  await page.route('**/ui.js?*', async route => { await editorGate; await route.continue(); });
  try {
    await page.goto('/', { waitUntil: 'commit' });
    const screen = page.locator('#accessMessage');
    await expect(screen).toHaveAttribute('data-phase', 'access');
    await expect(page.getByRole('status').first()).toContainText('작업 공간을 준비');
    await expect(page.locator('.app')).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath('startup-desktop.png') });
    releaseAccess();
    await expect(screen).toHaveAttribute('data-phase', 'editor', { timeout: 30000 });
    await expect(screen).toContainText('작업 공간을 준비');
    await expect(page.locator('.app')).toBeHidden();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.startup-spinner')).toHaveCSS('animation-name', 'none');
    const card = await page.locator('.startup-card').boundingBox();
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(375);
    await page.screenshot({ path: testInfo.outputPath('startup-mobile.png') });
    releaseEditor();
    await expect(page.locator('.app')).toBeVisible({ timeout: 30000 });
    await expect(screen).toBeHidden();
  } finally { releaseAccess(); releaseEditor(); }
});

test('module load failure shows a recoverable error without exposing legacy UI', async ({ page }) => {
  await arrangeBoot(page);
  await page.route('**/editor-tools.js', route => route.fulfill({ status: 404, body: 'missing' }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('편집기를 불러오지 못했습니다.');
  await expect(page.locator('.startup-progress')).toBeHidden();
  await expect(page.locator('.app')).toBeHidden();
  await page.unroute('**/editor-tools.js');
  await page.getByRole('link', { name: '다시 시도' }).click();
  await expect(page.locator('.app')).toBeVisible({ timeout: 30000 });
});

test('initialization rejection keeps the app hidden and reports the failure', async ({ page }) => {
  await arrangeBoot(page);
  await page.route('**/ui.js?*', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'export async function initializeApp() { throw new Error("startup failure"); }',
  }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('편집기를 불러오지 못했습니다.');
  await expect(page.locator('.app')).toBeHidden();
  await expect(page.getByRole('link', { name: '다시 시도' })).toBeVisible();
});

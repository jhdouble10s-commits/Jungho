import { test, expect } from '@playwright/test';
import { mockApprovedSession } from './approved-session.js';
test('Monaco NEW → mode/chapter 전환 → Dexie reload에서 A/B/C 원문 보존', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockApprovedSession(page);
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await expect(page.locator('.new-book')).toBeVisible();
  await page.locator('.new-book').click();
  await page.locator('#title').fill('독립 저장 테스트');
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await page.locator('[data-mode-toggle]').click();
  for (const name of ['A','B','C']) {
    await page.locator('#add').click();
    await page.locator('#ctitle').fill(name);
    await page.evaluate(value => window.epubMonacoEditor.setValue(`<p>${value}</p>`), name);
  }
  await page.locator('#list .chapter[data-i]').filter({ hasText:'B' }).click({ position:{ x:50, y:15 } });
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p id="new">NEW<br /><img src="../Image/a.jpg" alt="a" /></p>'));
  await page.locator('[data-mode-toggle]').click();
  await page.locator('[data-mode-toggle]').click();
  await expect.poll(() => page.evaluate(() => window.epubMonacoEditor.getValue())).toContain('NEW');
  await page.keyboard.press('ControlOrMeta+s');
  await expect(page.locator('#status')).toContainText('저장');
  await page.waitForTimeout(500);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await expect(page.locator('#title')).toHaveValue('독립 저장 테스트');
  await page.locator('[data-mode-toggle]').click();
  for (const [name, value] of [['A','>A<'],['B','NEW'],['C','>C<']]) {
    await page.locator('#list .chapter[data-i]').filter({ hasText:name }).click({ position:{ x:50, y:15 } });
    await expect.poll(() => page.evaluate(() => window.epubMonacoEditor.getValue())).toContain(value);
  }
  expect(errors.filter(message => message !== 'Canceled')).toEqual([]);
});

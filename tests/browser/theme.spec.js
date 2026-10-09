import { test, expect } from '@playwright/test';
import { setTheme, openApiSettings } from './ui-helpers.js';
import { mockApprovedSession } from './approved-session.js';

test('semantic Light/Dark tokens reach UI and Monaco without modifying content or layout', async ({page}) => {
  await mockApprovedSession(page);
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor), {timeout:30000});
  await expect(page.locator('#app-theme-tooltip')).toBeAttached({timeout:30000});
  await page.locator('#add').click();
  await page.locator('[data-mode-toggle]').click();
  const source = '<p id="theme-safe" class="kept" style="color:#234567">테마 전환 <strong>원문</strong><br /><a href="notes.xhtml#n1">각주</a></p>';
  await page.evaluate(value => window.epubMonacoEditor.setValue(value), source);
  const selected = await page.locator('#list .chapter.active').getAttribute('data-chapter-id');
  const geometry = () => page.locator('main').boundingBox();
  const before = await geometry();
  const colorMatches = (selector, property, token) => page.evaluate(({selector,property,token}) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const rgba = color => {
      ctx.clearRect(0,0,1,1); ctx.fillStyle=color; ctx.fillRect(0,0,1,1);
      return [...ctx.getImageData(0,0,1,1).data].join(',');
    };
    return rgba(getComputedStyle(document.querySelector(selector))[property]) ===
      rgba(getComputedStyle(document.documentElement).getPropertyValue(token).trim());
  }, {selector,property,token});
  for (const mode of ['light','dark']) {
    await setTheme(page, mode);
    await expect(page.locator('html')).toHaveAttribute('data-theme',mode);
    const values = await page.evaluate(() => {
      const css = getComputedStyle(document.documentElement);
      return ['--background','--sidebar','--accent','--primary','--muted','--muted-foreground'].map(key => css.getPropertyValue(key).trim());
    });
    expect(values[0]).toBe(mode === 'light' ? 'oklch(0.9383 0.0042 236.4993)' : 'oklch(0.1493 0.0188 262.4048)');
    expect(values[1]).toBe(mode === 'light' ? 'oklch(0.9030 0.0046 258.3257)' : 'oklch(0.23 0.02 267)');
    expect(values[2]).toBe(values[3]);
    expect(values[4]).toBe(values[5]);
    for (const [selector,property,token] of [
      ['#app-sidebar','backgroundColor','--sidebar'],
      ['.app .card.editor','backgroundColor','--card'],
      ['#title','backgroundColor','--input'],
      ['#xhtml-monaco-editor .monaco-editor','backgroundColor','--editor-background'],
    ]) await expect.poll(() => colorMatches(selector,property,token), {message:`${mode}: ${selector} → ${token}`}).toBe(true);
    expect(await geometry()).toEqual(before);
    expect(await page.evaluate(() => window.epubMonacoEditor.getValue())).toBe(source);
    await expect(page.locator('#list .chapter.active')).toHaveAttribute('data-chapter-id',selected);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await openApiSettings(page);
    await expect(page.locator('.gemini-settings-dialog[open]')).toBeVisible();
    expect(await colorMatches('.gemini-settings-dialog','backgroundColor','--popover')).toBe(true);
    expect(await colorMatches('input[name="apiKey"]','backgroundColor','--input')).toBe(true);
    expect(await colorMatches('.gemini-settings-dialog .primary','backgroundColor','--primary')).toBe(true);
    await page.screenshot({path:test.info().outputPath(`theme-${mode}.png`)});
    await page.keyboard.press('Escape');
    await page.locator('#app-sidebar .settings-button').hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expect(page.getByRole('tooltip')).toHaveCSS('pointer-events','none');
    expect(await colorMatches('#app-theme-tooltip','backgroundColor','--popover')).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).not.toBeVisible();
    await expect(page.locator('#app-sidebar .settings-button')).toHaveAttribute('title',/.+/);
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});

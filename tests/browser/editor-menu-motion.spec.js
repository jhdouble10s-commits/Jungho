import { test, expect } from '@playwright/test';
import { mockApprovedSession } from './approved-session.js';

async function openEditor(page) {
  await mockApprovedSession(page);
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor && document.querySelector('.ProseMirror')));
  await page.locator('#add').click();
}

test('editor menus share motion, stay anchored, and dismiss without trapping input', async ({page}) => {
  await openEditor(page);
  const tableButton = page.getByRole('button', {name:'표 편집', exact:true});
  await tableButton.click();
  const table = page.locator('.editor-tools-table');
  await expect(table).toBeVisible();
  await expect(tableButton).toHaveAttribute('aria-expanded','true');
  const tableMotion = await table.evaluate(node => ({
    duration:getComputedStyle(node).transitionDuration,
    rect:node.getBoundingClientRect().toJSON(),
  }));
  expect(tableMotion.duration).toContain('0.18s');
  const anchor = await tableButton.boundingBox();
  expect(tableMotion.rect.y).toBeGreaterThan(anchor.y);
  await page.getByRole('button', {name:'2×2 표 삽입'}).click();
  await expect(table).toBeVisible();
  const closingTransitions = await page.evaluate(() => {
    document.querySelector('button[aria-label="표 편집"]').click();
    return document.querySelector('.editor-tools-table').getAnimations().map(animation => animation.transitionProperty);
  });
  expect(closingTransitions).toContain('opacity');
  await expect(table).toBeHidden();
  await tableButton.click();
  await page.keyboard.press('Escape');
  await expect(table).toBeHidden();
  await expect(tableButton).toBeFocused();
  await tableButton.click();
  await tableButton.click();
  await tableButton.click();
  await expect(table).toBeVisible();
  await page.getByRole('button', {name:'찾기 및 바꾸기 (Ctrl+F)'}).click();
  const search = page.locator('.editor-tools-search');
  await expect(search).toBeVisible();
  await expect(table).toBeHidden();
  await expect(search).toHaveClass(/editor-popover-motion/);
  const searchClosing = await page.evaluate(() => {
    document.querySelector('button[aria-label="찾기 닫기"]').click();
    return document.querySelector('.editor-tools-search').getAnimations().map(animation => animation.transitionProperty);
  });
  expect(searchClosing).toContain('opacity');
  await page.getByRole('button', {name:'찾기 및 바꾸기 (Ctrl+F)'}).click();
  await page.keyboard.press('Escape');
  await expect(search).toBeHidden();
  await expect(page.locator('.ProseMirror')).toBeFocused();

  await page.keyboard.press('ControlOrMeta+Shift+f');
  const chapterSearch = page.locator('.chapter-search-panel');
  await expect(chapterSearch).toBeVisible();
  await expect(chapterSearch).toHaveClass(/editor-popover-motion/);
  await page.keyboard.press('Escape');
  await expect(chapterSearch).toBeHidden();
  await expect(page.locator('.ProseMirror')).toBeFocused();
  await page.locator('.parent-toc-button').click();
  const toc = page.locator('.parent-toc-menu');
  await expect(toc).toBeVisible();
  await expect(toc).toHaveClass(/editor-popover-motion/);
  await page.keyboard.press('Escape');
  await expect(toc).toBeHidden();
  await expect(page.locator('.parent-toc-button')).toBeFocused();

  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p>broken'));
  await page.locator('.editor-error-alert').click();
  await expect(page.locator('.chapter-error-popover')).toBeVisible();
  await expect(page.locator('.chapter-error-popover')).toHaveClass(/editor-popover-motion/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.chapter-error-popover')).toBeHidden();
  await expect(page.locator('.editor-error-alert')).toBeFocused();
});

test('reduced motion removes menu displacement', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await openEditor(page);
  await page.getByRole('button', {name:'표 편집', exact:true}).click();
  const style = await page.locator('.editor-tools-table').evaluate(node => ({
    translate:getComputedStyle(node).translate,
    duration:getComputedStyle(node).transitionDuration,
  }));
  expect(style.translate).toBe('0px');
  expect(style.duration).not.toContain('0.18s');
});

import { test, expect } from '@playwright/test';
import { mockApprovedSession } from './approved-session.js';

test('XHTML attribute Tab/Enter snippets and outside Emmet preserve context', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockApprovedSession(page);
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.locator('.new-book').click();
  await page.waitForFunction(() => window.epubMonacoEditor && window.emmetMonaco);
  await page.locator('#add').click();
  if ((await page.locator('[data-mode-toggle]').textContent()).includes('XHTML편집')) {
    await page.locator('[data-mode-toggle]').click();
  }
  const source = () => page.evaluate(() => window.epubMonacoEditor.getValue());
  const prepare = async (text, suggest = true, offset = text.length) => {
    await page.keyboard.press('Escape');
    await page.evaluate(({ text, offset, suggest }) => {
      const editor = window.epubMonacoEditor;
      editor.setValue(text);
      editor.setPosition(editor.getModel().getPositionAt(offset));
      editor.focus();
      if (suggest) editor.trigger('test', 'editor.action.triggerSuggest', {});
    }, { text, offset, suggest });
    if (suggest) await expect(page.locator('#xhtml-monaco-editor .suggest-widget.visible')).toBeVisible();
  };
  for (const key of ['Tab', 'Enter']) {
    for (const text of ['<div class', '<a href', '<a epub:type', '<img src', '<p id', '<p xml:lang', '<div\n class', '<a title="a > b" epub:type']) {
      await prepare(text);
      await page.keyboard.press(key);
      await expect.poll(source).toBe(`${text}=""`);
      expect(await page.evaluate(() => {
        const editor = window.epubMonacoEditor;
        return editor.getModel().getOffsetAt(editor.getPosition());
      })).toBe(text.length + 2);
      await page.keyboard.type('value');
      await expect.poll(source).toBe(`${text}="value"`);
    }
  }
  // Tab also completes immediately, before the suggestion popup has opened.
  await prepare('<div class', false);
  await page.keyboard.press('Tab');
  await expect.poll(source).toBe('<div class=""');

  await prepare('<img src />', true, '<img src'.length);
  await page.keyboard.press('Tab');
  await expect.poll(source).toBe('<img src="" />');
  await prepare('<a ', false);
  await page.keyboard.type('epub:type');
  await expect(page.locator('#xhtml-monaco-editor .suggest-widget.visible')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect.poll(source).toBe('<a epub:type=""');
  await prepare('<div class="keep" cl');
  await expect(page.locator('#xhtml-monaco-editor .suggest-widget').getByText('class', { exact:true })).toHaveCount(0);

  for (const key of ['Tab', 'Enter']) {
    await prepare('div.foo', key === 'Enter');
    await page.keyboard.press(key);
    await expect.poll(source).toBe('<div class="foo"></div>');
  }
  await prepare('img', false);
  await page.keyboard.press('Tab');
  await expect.poll(source).toMatch(/^<img\b[^>]*\/>$/);
  expect(errors).toEqual([]);
});

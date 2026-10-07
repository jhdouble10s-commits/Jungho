import { test, expect } from '@playwright/test';

test('느린 Tiptap + 복원 원고는 DOM에 중복 잔존하지 않으며 새 책/reload/개별 프로젝트 삭제가 보존된다', async ({page}) => {
  await page.route('**/htzojicodwueivybovhy.supabase.co/**', route => route.fulfill({status:503,body:'offline fixture'}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await expect(page.locator('.ProseMirror')).toBeAttached({timeout:30000});
  await page.locator('.new-book').click();
  await page.locator('#title').fill('삭제할 테스트 원고');
  await page.locator('#coverInput').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=','base64')});
  await expect(page.locator('.cover-read-only-view img')).toHaveCount(1);
  await page.locator('#add').click();
  await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p>이 책을 향한 찬사들 — 잔존 검사 원문</p>'));
  await page.keyboard.press('ControlOrMeta+s');
  await expect(page.locator('#status')).toContainText('로컬');
  expect(await page.evaluate(async () => {
    const {default:Dexie} = await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');
    const db = new Dexie('epub-builder-projects'); await db.open();
    try { return await db.table('assets').count(); } finally { db.close(); }
  })).toBeGreaterThan(0);

  let release;
  const gate = new Promise(resolve => { release=resolve; });
  await page.route('https://esm.sh/**', async route => { await gate; await route.continue(); });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#title')).toHaveValue('삭제할 테스트 원고');
  await expect(page.locator('.ProseMirror')).toHaveCount(0);
  // Inspect the whole host, not just .ProseMirror: stale siblings caused the bug.
  await expect(page.locator('.rich-editor')).not.toContainText('잔존 검사 원문');
  release();
  await expect(page.locator('.ProseMirror')).toBeAttached({timeout:30000});
  await expect(page.locator('.rich-editor')).toContainText('잔존 검사 원문');
  expect(await page.locator('.rich-editor').evaluate(el => Array.from(el.childNodes).filter(node => !node.classList?.contains('ProseMirror')).map(node => node.textContent).join(''))).toBe('');

  await page.locator('.new-book').click();
  for (let i=0;i<2;i++) {
    await page.locator('#add').click();
    await expect(page.locator('.rich-editor')).not.toContainText('잔존 검사 원문');
    await expect(page.locator('#preview')).not.toContainText('잔존 검사 원문');
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await expect(page.locator('#title')).toHaveValue('');
  await expect(page.locator('#list .chapter')).toHaveCount(2);
  await page.locator('.side .tab[data-view="editorView"]').click();
  await expect(page.locator('.draft-item')).toHaveCount(1);
  await page.evaluate(() => localStorage.setItem('epub-gemini-api-key-v1','test-preserve-key'));
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button',{name:'삭제할 테스트 원고 삭제',exact:true}).click();
  await expect(page.locator('#status')).toContainText('삭제했습니다');
  await expect(page.getByRole('button',{name:'임시저장 전체 삭제',exact:true})).toHaveCount(0);
  await expect(page.locator('.drafts-empty')).toBeVisible();
  const storage = await page.evaluate(async () => {
    const {default:Dexie} = await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');
    const db = new Dexie('epub-builder-projects'); await db.open();
    try { return {projects:await db.table('projects').count(), assets:await db.table('assets').count(),key:localStorage.getItem('epub-gemini-api-key-v1')}; }
    finally { db.close(); }
  });
  expect(storage).toEqual({projects:0,assets:0,key:'test-preserve-key'});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await page.locator('#add').click();
  await expect(page.locator('.rich-editor')).not.toContainText('잔존 검사 원문');
  await expect(page.locator('#preview')).not.toContainText('잔존 검사 원문');
  await page.locator('.side .tab[data-view="editorView"]').click();
  await expect(page.locator('.drafts-empty')).toBeVisible();
});

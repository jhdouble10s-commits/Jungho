import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { loadSemanticEpub } from '../../scripts/lib/epub-semantic.mjs';

async function start(page) {
  await page.route('**/htzojicodwueivybovhy.supabase.co/**', route => route.fulfill({status:503,body:'offline fixture'}));
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await expect(page.locator('.ProseMirror')).toBeAttached({timeout:30000});
  await page.locator('#title').fill('표지 복구 회귀');
}
async function save(page) {
  await page.locator('.draft-save').click();
  await expect(page.locator('#status')).toContainText('로컬');
  await expect(page.locator('.draft-save')).toBeEnabled();
  return page.evaluate(async () => {
    const {default:Dexie} = await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');
    const db = new Dexie('epub-builder-projects'); await db.open();
    try { return (await db.table('projects').get(['local',document.querySelector('#title').value])).payload; }
    finally { db.close(); }
  });
}
const rows = page => page.locator('#list .chapter');
const ids = page => rows(page).evaluateAll(nodes => nodes.map(node => node.dataset.chapterId));
const bodyIdentity = draft => draft.chapters.filter(chapter => chapter.type !== 'cover').map(chapter => ({
  id:chapter.id, originalPath:chapter.originalPath, xhtml:chapter.xhtml,
  title:chapter.title, tocTitle:chapter.tocTitle, fileName:chapter.fileName,
}));
async function selectId(page,id) { await page.locator(`#list [data-chapter-id="${id}"]`).click({position:{x:55,y:15}}); }
async function addBody(page,title) {
  await page.locator('#add').click();
  await page.locator('#ctitle').fill(title);
  if(await page.locator('[data-mode-toggle]').textContent()==='XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(title => window.epubMonacoEditor.setValue(`<p id="${title}">${title}</p>`), title);
}

test('cover missing: first Add restores only cover, second Add is normal; A/B and reload stay intact', async ({page}) => {
  await start(page);
  await rows(page).filter({hasText:'각주 페이지'}).click({position:{x:55,y:15}});
  await page.locator('#del').click();
  await addBody(page,'A'); await addBody(page,'B');
  const initial = await save(page);
  const originalIds = await ids(page);
  // A/F: existing cover goes through the unchanged normal chapter branch.
  await page.locator('#add').click();
  await expect(rows(page)).toHaveCount(4);
  expect((await ids(page)).slice(0,3)).toEqual(originalIds);
  await expect(page.locator('#list .cover-chapter')).toHaveCount(1);
  await page.locator('#del').click();
  await page.locator('#list .cover-chapter').click({position:{x:55,y:15}});
  await page.locator('#del').click();
  await selectId(page,initial.chapters.find(chapter=>chapter.title==='B').id);
  await expect(rows(page)).toHaveCount(2);
  const before = await save(page);
  const bodyIds = await ids(page);
  const selectedId = before.selectedChapterId;
  // B/D: no second click or save is needed to create the single cover row.
  await page.locator('#add').click();
  await expect(rows(page)).toHaveCount(3);
  await expect(rows(page).first()).toHaveClass(/cover-chapter/);
  expect((await ids(page)).slice(1)).toEqual(bodyIds);
  await expect(page.locator('#list .active')).toHaveAttribute('data-chapter-id',selectedId);
  const restored = await save(page);
  expect(bodyIdentity(restored)).toEqual(bodyIdentity(before));
  expect(restored.chapters.filter(chapter=>chapter.type==='cover')).toHaveLength(1);
  // C: preserving B selection keeps the original sibling insertion location.
  await page.locator('#add').click();
  await expect(rows(page)).toHaveCount(4);
  expect((await ids(page)).slice(1,3)).toEqual(bodyIds);
  await expect(rows(page).last()).toContainText('새 장');
  await expect(page.locator('#list .cover-chapter')).toHaveCount(1);
  await page.locator('#del').click();
  const coverId = restored.chapters.find(chapter=>chapter.type==='cover').id;
  await selectId(page,coverId);
  await expect(page.locator('#preview')).toHaveAttribute('data-chapter-id',coverId);
  await expect(page.locator('.rich-editor')).toHaveAttribute('data-chapter-id',coverId);
  await expect(page.locator('.code-editor')).toHaveAttribute('data-chapter-id',coverId);
  await expect.poll(()=>page.evaluate(()=>window.epubMonacoEditor.getValue())).toBe('');
  await page.locator('[data-mode-toggle]').click();
  await expect(page.locator('.cover-read-only-view')).toHaveCount(1);
  await page.locator('#coverInput').setInputFiles({name:'restored.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=','base64')});
  await expect(page.locator('.cover-read-only-view img')).toBeVisible();
  await expect(page.locator('#preview img')).toBeVisible();
  const withImage = await save(page);
  expect(withImage.assets.filter(asset=>asset.isCover)).toHaveLength(1);
  expect(bodyIdentity(withImage)).toEqual(bodyIdentity(before));
  // E: restored page, ID, image and body snapshots survive Dexie reload.
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#list .cover-chapter')).toHaveAttribute('data-chapter-id',coverId);
  await expect(page.locator('#list .active')).toHaveAttribute('data-chapter-id',coverId);
  await expect(page.locator('.cover-read-only-view img')).toBeVisible();
  await expect(page.locator('#preview img')).toBeVisible();
  expect(bodyIdentity(await save(page))).toEqual(bodyIdentity(before));
});

test('empty project Add creates one selected cover and then one normal chapter', async ({page}) => {
  await start(page);
  await page.locator('#del').click(); await page.locator('#del').click();
  await expect(rows(page)).toHaveCount(0);
  await page.locator('#add').click();
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toHaveClass(/cover-chapter/);
  await expect(rows(page).first()).toHaveClass(/active/);
  await expect(page.locator('.cover-read-only-view')).toHaveCount(1);
  await page.locator('#add').click();
  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page).last()).toContainText('새 장');
  await expect(page.locator('.cover-read-only-view')).toHaveCount(0);
});

test('imported cover restore reconnects original path/resource/metadata without changing body chapters', async ({page}) => {
  test.setTimeout(180000);
  await start(page);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('input[type=file][accept^=".epub"]').setInputFiles('기도먼저.epub');
  await expect(page.locator('#status')).toContainText('불러왔', {timeout:30000});
  await page.locator('#list .cover-chapter').click({position:{x:55,y:15}});
  await page.locator('#del').click();
  const deleted = await save(page);
  expect(deleted.importedSource.coverDeleted).toBe(true);
  const originalOrder = await ids(page);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#title')).toHaveValue(deleted.title);
  await page.waitForFunction(()=>Boolean(window.epubMonacoEditor));
  await expect(rows(page)).toHaveCount(deleted.chapters.length);
  const before = await save(page);
  await page.locator('#add').click();
  await expect(rows(page)).toHaveCount(deleted.chapters.length+1);
  expect((await ids(page)).slice(1)).toEqual(originalOrder);
  const restored = await save(page);
  expect(bodyIdentity(restored)).toEqual(bodyIdentity(before));
  expect(restored.importedSource.coverDeleted).toBe(false);
  const cover = restored.chapters.find(chapter=>chapter.type==='cover');
  expect(restored.importedSource.coverPagePaths).toContain(cover.originalPath);
  expect(restored.assets.some(asset=>asset.originalPath===restored.importedSource.coverImagePath && asset.isCover)).toBe(true);
  await selectId(page,cover.id);
  await expect(page.locator('#preview img')).toBeVisible();
  if(await page.locator('[data-mode-toggle]').textContent()==='일반편집') await page.locator('[data-mode-toggle]').click();
  await expect(page.locator('.cover-read-only-view img')).toBeVisible();
  const source = await loadSemanticEpub(await readFile('기도먼저.epub'));
  const download = page.waitForEvent('download');
  await page.locator('#export').click();
  const exported = await loadSemanticEpub(await readFile(await (await download).path()));
  // The EPUB2 fixture declares its cover in metadata, not EPUB3 cover-image.
  // Export must restore the exact imported resource as an EPUB3 cover-image.
  expect(exported.cover).toEqual([restored.importedSource.coverImagePath]);
  expect(exported.images).toEqual(source.images);
  expect(exported.spine).toEqual(source.spine);
  expect(exported.brokenResources).toEqual([]);
});

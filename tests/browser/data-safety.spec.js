import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import { readFile, writeFile } from 'node:fs/promises';
import { DOMParser } from '@xmldom/xmldom';
import { createHash } from 'node:crypto';
import {immutableAssetPath} from '../../cloud-asset-path.js';
import { approvedUser, mockApprovedSession } from './approved-session.js';
import { loadSemanticEpub } from '../../scripts/lib/epub-semantic.mjs';

const firstPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=', 'base64');
const newCover = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64');
const sourceBody = `<section class="keep" style="letter-spacing:2px" xml:lang="ko"><p id="a">A<ruby>漢<rt>한</rt></ruby> $1 $$ $&amp; $20 <img src="../Image/pic.png" onerror="window.parent.__previewBreakout=true" alt="pic" /></p><p id="b">B<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><circle cx="1" cy="1" r="1" /></svg></p><script>window.parent.__previewBreakout=true;</script></section>`;
const xml = source => new DOMParser({ onError:(level, message) => { if (level !== 'warning') throw new Error(message); } }).parseFromString(source, 'application/xml');

async function fixture() {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip');
  zip.file('META-INF/container.xml', '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  zip.file('OPS/package.opf', '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">fixture</dc:identifier><dc:title>보존 시험</dc:title><dc:language>ko</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="cover" href="Image/cover.png" media-type="image/png" properties="cover-image"/><item id="coverpage" href="Text/cover.xhtml" media-type="application/xhtml+xml"/><item id="chapter" href="Text/ch.xhtml" media-type="application/xhtml+xml"/><item id="pic" href="Image/pic.png" media-type="image/png"/><item id="css" href="Styles/book.css" media-type="text/css"/></manifest><spine><itemref idref="coverpage" linear="no"/><itemref idref="chapter"/></spine></package>');
  zip.file('OPS/Text/cover.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>표지</title></head><body><img src="../Image/cover.png" alt="표지" /></body></html>');
  zip.file('OPS/Text/ch.xhtml', `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>장</title></head><body>${sourceBody}</body></html>`);
  zip.file('OPS/nav.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>목차</title></head><body><nav epub:type="toc"><ol><li><a href="Text/ch.xhtml#a">첫 위치</a><ol><li><a href="Text/ch.xhtml#b">둘째 위치</a></li></ol></li></ol></nav></body></html>');
  zip.file('OPS/Styles/book.css', '#title { display:none !important } body { background:rgb(2,3,4) }');
  zip.file('OPS/Image/cover.png', firstPng); zip.file('OPS/Image/pic.png', firstPng);
  return zip.generateAsync({ type:'nodebuffer' });
}
async function start(page) {
  await mockApprovedSession(page);
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor && document.querySelector('.ProseMirror')), null, {timeout:30000});
}
async function save(page) {
  await page.locator('.draft-save').click();
  await expect(page.locator('.draft-save')).toBeEnabled();
  await expect(page.locator('#status')).toContainText('서버 저장 완료');
}
async function storedDraft(page, title) {
  return page.evaluate(async ({ownerId,title}) => {
    const {default:Dexie} = await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');
    const db = new Dexie('epub-builder-projects'); await db.open();
    try { return (await db.table('projects').get([ownerId,title]))?.payload; }
    finally { db.close(); }
  }, {ownerId:approvedUser.id,title});
}

test('import, safe edit, save, reload and export retain XHTML, dollars, cover bytes, image, spine and nested anchor TOC', async ({page}) => {
  await start(page);
  page.once('dialog', dialog => dialog.accept());
  const inputBytes=await fixture();
  await writeFile(test.info().outputPath('preservation-input.epub'),inputBytes);
  await page.locator('input[type=file][accept^=".epub"]').setInputFiles({ name:'safe.epub', mimeType:'application/epub+zip', buffer:inputBytes });
  await expect(page.locator('#status')).toContainText('불러왔');
  await expect(page.locator('#title')).toBeVisible();
  await expect(page.locator('#title')).not.toHaveCSS('display', 'none');
  const preview = page.frameLocator('.preview-isolated-frame');
  await expect(preview.locator('#a')).toBeVisible();
  expect(await page.evaluate(() => window.__previewBreakout)).toBeUndefined();
  await page.locator('[data-mode-toggle]').click();
  await expect(page.locator('.visual-read-only-notice')).toBeVisible();
  await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable', 'false');
  await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => window.epubMonacoEditor.setValue(window.epubMonacoEditor.getValue().replace('A<ruby>', 'AA<ruby>')));
  expect(await page.locator('#body').inputValue()).toContain('AA<ruby>');
  await page.locator('#list .cover-chapter').click({position:{x:55,y:15}});
  await page.locator('#coverInput').setInputFiles({name:'new-cover.png',mimeType:'image/png',buffer:newCover});
  await save(page);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#title')).toHaveValue('보존 시험');
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await page.locator('#list .chapter').filter({hasText:'첫 위치'}).click({position:{x:55,y:15}});
  expect(await page.locator('#body').inputValue()).toContain('AA<ruby>');
  const download = page.waitForEvent('download'); await page.locator('#export').click();
  const bytes = await readFile(await (await download).path());
  await writeFile(test.info().outputPath('preservation-roundtrip.epub'),bytes);
  const zip = await JSZip.loadAsync(bytes);
  for (const path of Object.keys(zip.files).filter(path => path.endsWith('.xhtml'))) xml(await zip.file(path).async('string'));
  const semantic = await loadSemanticEpub(bytes);
  expect(semantic.brokenResources).toEqual([]);
  expect(semantic.brokenHrefs).toEqual([]);
  const chapter = await zip.file('OPS/Text/ch.xhtml').async('string');
  const doc = xml(chapter);
  const section = doc.getElementsByTagName('section')[0];
  expect(section.getAttribute('class')).toBe('keep');
  expect(section.getAttribute('style')).toBe('letter-spacing:2px');
  expect(section.getAttribute('xml:lang')).toBe('ko');
  expect(chapter).toContain('<ruby>漢<rt>한</rt></ruby>');
  expect(chapter).toContain('<svg');
  expect(chapter).toContain('AA<ruby>');
  expect(chapter).toContain('$1 $$ $&amp; $20');
  expect(await zip.file('OPS/Image/cover.png').async('nodebuffer')).toEqual(newCover);
  expect(await zip.file('OPS/Image/pic.png').async('nodebuffer')).toEqual(firstPng);
  const nav = xml(await zip.file('OPS/nav.xhtml').async('string'));
  const links = [...nav.getElementsByTagName('a')];
  expect(links.map(link => link.getAttribute('href'))).toEqual(['Text/ch.xhtml#a','Text/ch.xhtml#b']);
  expect(links[0].parentNode.getElementsByTagName('ol').length).toBe(1);
  const packageDoc = xml(await zip.file('OPS/package.opf').async('string'));
  expect([...packageDoc.getElementsByTagName('itemref')].map(node => node.getAttribute('idref'))).toEqual(['coverpage','chapter']);
  expect([...packageDoc.getElementsByTagName('item')].some(node => node.getAttribute('href') === 'Image/cover.png' && node.getAttribute('properties')?.includes('cover-image'))).toBe(true);
});

test('lossless ordinary XHTML stays editable while attribute order and void spelling are normalized', async ({page}) => {
  await start(page);
  await page.locator('#title').fill('안전한 일반편집');
  await page.locator('#add').click();
  const chapterId = await page.locator('#list .chapter.active').getAttribute('data-chapter-id');
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p class="keep" id="safe">앞<br />뒤</p>'));
  await page.locator('[data-mode-toggle]').click();
  await expect(page.locator('.visual-read-only-notice')).toBeHidden();
  await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable', 'true');
  await page.locator('.ProseMirror p').click();
  await page.keyboard.press('End');
  await page.keyboard.type(' 수정');
  await save(page);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#title')).toHaveValue('안전한 일반편집');
  await page.locator(`#list [data-chapter-id="${chapterId}"]`).click({position:{x:55,y:15}});
  const body = await page.locator('#body').inputValue();
  expect(body).toContain('id="safe"');
  expect(body).toContain('class="keep"');
  expect(body).toContain('수정');
});

test('footnote content survives undo, chapter navigation, redo, save and reload', async ({page}) => {
  await start(page);
  await page.locator('#title').fill('각주 보존 시험');
  await page.locator('#add').click();
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => {
    const editor = window.epubMonacoEditor;
    editor.setValue('<p>본문</p>');
    editor.setPosition(editor.getModel().getPositionAt(5));
  });
  const chapterId = await page.locator('#list .chapter.active').getAttribute('data-chapter-id');
  page.once('dialog', dialog => dialog.accept('원본 각주 내용'));
  await page.locator('.footnote-insert').click();
  await expect.poll(() => page.locator('#body').inputValue()).toContain('data-sitescout-footnote');
  await page.locator('[data-editor-action="undo"]').click();
  await expect.poll(() => page.locator('#body').inputValue()).not.toContain('data-sitescout-footnote');
  await page.locator('#add').click();
  await page.locator(`#list [data-chapter-id="${chapterId}"]`).click({position:{x:55,y:15}});
  await page.locator('[data-editor-action="redo"]').click();
  await expect.poll(() => page.locator('#body').inputValue()).toContain('data-sitescout-footnote');
  await save(page);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await page.locator(`#list [data-chapter-id="${chapterId}"]`).click({position:{x:55,y:15}});
  expect(await page.locator('#body').inputValue()).toContain('data-sitescout-footnote');
  const download = page.waitForEvent('download'); await page.locator('#export').click();
  const bytes = await readFile(await (await download).path());
  await writeFile(test.info().outputPath('footnote-roundtrip.epub'),bytes);
  const zip = await JSZip.loadAsync(bytes);
  const paths = Object.keys(zip.files).filter(path => path.endsWith('.xhtml'));
  const documents = await Promise.all(paths.map(path => zip.file(path).async('string')));
  documents.forEach(xml);
  expect(documents.join('\n')).toContain('원본 각주 내용');
  expect(documents.join('\n')).toContain('epub:type="noteref"');
});

test('undo followed by a new edit drops the redo branch without exporting an orphan footnote', async ({page}) => {
  await start(page);
  await page.locator('#title').fill('각주 분기 시험');
  await page.locator('#add').click();
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => {
    const editor = window.epubMonacoEditor;
    editor.setValue('<p>본문</p>'); editor.setPosition(editor.getModel().getPositionAt(5));
  });
  page.once('dialog', dialog => dialog.accept('버려질 각주'));
  await page.locator('.footnote-insert').click();
  await expect.poll(() => page.locator('#body').inputValue()).toContain('data-sitescout-footnote');
  await page.locator('[data-editor-action="undo"]').click();
  await expect.poll(() => page.locator('#body').inputValue()).not.toContain('data-sitescout-footnote');
  await page.evaluate(() => window.epubMonacoEditor.trigger('keyboard', 'type', {text:'새 분기'}));
  await expect.poll(() => page.locator('#body').inputValue()).toContain('새 분기');
  await expect(page.locator('[data-editor-action="redo"]')).toBeDisabled();
  await save(page);
  const stored = await storedDraft(page, '각주 분기 시험');
  expect(stored.footnotes).toEqual([]);
  await page.reload({waitUntil:'domcontentloaded'});
  const download = page.waitForEvent('download'); await page.locator('#export').click();
  const output = await JSZip.loadAsync(await readFile(await (await download).path()));
  const xhtml = (await Promise.all(Object.keys(output.files).filter(path => path.endsWith('.xhtml')).map(path => output.file(path).async('string')))).join('\n');
  expect(xhtml).not.toContain('버려질 각주');
});

test('failed image restore preserves manifest through save, blocks export and recovers on retry', async ({page}) => {
  await start(page);
  const cloudWrites = [];
  page.on('request', request => {
    if (request.method() !== 'GET' && /\/(?:rest\/v1\/(?:epub_drafts|rpc\/save_epub_project)|storage\/v1\/object)\b/.test(request.url())) cloudWrites.push(`${request.method()} ${request.url()}`);
  });
  await page.locator('#title').fill('복구 실패 시험');
  await page.locator('#add').click();
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  const chapterId = await page.locator('#list .chapter.active').getAttribute('data-chapter-id');
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p><img src="../Image/pic.png" alt="pic" /></p>'));
  await page.locator('#image').setInputFiles({name:'pic.png',mimeType:'image/png',buffer:firstPng});
  await save(page);
  const initial = await storedDraft(page, '복구 실패 시험');
  expect(initial.assets).toHaveLength(1);
  const remaining = await page.evaluate(async ({ownerId,title}) => {
    const {default:Dexie} = await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');
    const db = new Dexie('epub-builder-projects'); await db.open();
    try { await db.table('assets').delete([ownerId,title,'pic.png']); return await db.table('assets').get([ownerId,title,'pic.png']); }
    finally { db.close(); }
  }, {ownerId:approvedUser.id,title:'복구 실패 시험'});
  expect(remaining).toBeUndefined();
  let recovered = false;
  let failureStatus = 404;
  const storageRequests = [];
  await page.route('**/storage/v1/**', route => {
    if (route.request().method() !== 'GET') return route.fallback();
    storageRequests.push(route.request().url());
    return recovered ? route.fulfill({status:200,contentType:'image/png',body:firstPng}) : route.fulfill({status:failureStatus,body:'asset unavailable'});
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect.poll(() => storageRequests.length).toBeGreaterThan(0);
  await page.locator('.left-tab[data-panel="assetsPanel"]').click();
  await expect(page.locator('.asset-recovery')).toBeVisible();
  await expect(page.locator('.asset-recovery')).toContainText('1개');
  await page.locator('.left-tab[data-panel="chaptersPanel"]').click();
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await page.locator(`#list [data-chapter-id="${chapterId}"]`).click({position:{x:55,y:15}});
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p>이미지 복구 중 편집 <img src="../Image/pic.png" alt="pic" /></p>'));
  const writesBeforeBlockedSave = cloudWrites.length;
  await save(page);
  const blockedSave = await storedDraft(page, '복구 실패 시험');
  expect(blockedSave.assets).toEqual(initial.assets);
  expect(blockedSave.chapters.some(chapter => chapter.body.includes('이미지 복구 중 편집'))).toBe(true);
  expect(cloudWrites).toHaveLength(writesBeforeBlockedSave);
  await expect(page.locator('#status')).toContainText('서버 동기화');
  await page.locator('#export').click();
  await expect(page.locator('#status')).toContainText('내보낼 수 없습니다');
  await page.locator('.left-tab[data-panel="assetsPanel"]').click();
  failureStatus = 503;
  const retry = page.getByRole('button',{name:'이미지 다시 불러오기'});
  await retry.click();
  await expect(retry).toBeEnabled({timeout:45000});
  await expect(page.locator('.asset-recovery')).toBeVisible();
  recovered = true;
  await retry.click();
  await expect(page.locator('.asset-recovery')).toBeHidden();
  await expect(page.frameLocator('.preview-isolated-frame').locator('img')).toHaveAttribute('src', /^blob:/);
  await save(page);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('.asset-recovery')).toBeHidden();
  await page.locator(`#list [data-chapter-id="${chapterId}"]`).click({position:{x:55,y:15}});
  expect(await page.locator('#body').inputValue()).toContain('이미지 복구 중 편집');
  const download = page.waitForEvent('download'); await page.locator('#export').click();
  const zip = await JSZip.loadAsync(await readFile(await (await download).path()));
  expect(await zip.file('EPUB/Image/pic.png').async('nodebuffer')).toEqual(firstPng);
});

test('legacy encoded image path is retried after the hashed compatibility path misses', async ({page}) => {
  await start(page);
  await page.locator('#title').fill('이전 서버 이미지');
  await page.locator('#add').click();
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p><img src="../Image/pic.png" alt="pic" /></p>'));
  await page.locator('#image').setInputFiles({name:'pic.png',mimeType:'image/png',buffer:firstPng});
  await save(page);
  const remote = structuredClone(await storedDraft(page, '이전 서버 이미지'));
  delete remote.assets[0].storagePath;
  remote.serverRevision++;
  remote.syncPending = false;
  remote.updatedAt = new Date(Date.parse(remote.updatedAt) + 1).toISOString();
  await page.evaluate(async ({ownerId,title}) => {
    const {default:Dexie} = await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');
    const db = new Dexie('epub-builder-projects'); await db.open();
    try { await db.table('assets').delete([ownerId,title,'pic.png']); }
    finally { db.close(); }
  }, {ownerId:approvedUser.id,title:remote.title});
  const downloads = [];
  await page.route('**/rest/v1/epub_drafts*', route => route.fulfill({json:[{payload:remote,project_id:remote.projectId,revision:remote.serverRevision,updated_at:remote.updatedAt}]}));
  await page.route('**/storage/v1/**', route => {
    if (route.request().method() !== 'GET') return route.fallback();
    downloads.push(route.request().url());
    return downloads.length === 1
      ? route.fulfill({status:404,json:{message:'hashed compatibility path missing'}})
      : route.fulfill({status:200,contentType:'image/png',body:firstPng});
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect.poll(() => downloads.length).toBe(2);
  await expect(page.locator('.asset-recovery')).toBeHidden();
  await expect(page.frameLocator('.preview-isolated-frame').locator('img')).toHaveAttribute('src', /^blob:/);
});

test('newer server asset hash wins over same-name local cache and remains current after save and reload', async ({page}) => {
  await start(page);
  await page.locator('#title').fill('이미지 버전 시험');
  await page.locator('#add').click();
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p><img src="../Image/pic.png" alt="pic" /></p>'));
  await page.locator('#image').setInputFiles({name:'pic.png',mimeType:'image/png',buffer:firstPng});
  await save(page);
  const remote = structuredClone(await storedDraft(page, '이미지 버전 시험'));
  remote.assets[0].hash = createHash('sha256').update(newCover).digest('hex');
  remote.assets[0].storagePath = immutableAssetPath(approvedUser.id,remote.projectId,remote.assets[0].hash);
  remote.serverRevision++; remote.syncPending=false;
  remote.updatedAt = new Date(Date.parse(remote.updatedAt) + 1).toISOString();
  await page.route('**/rest/v1/epub_drafts*', route => route.fulfill({json:[{payload:remote,project_id:remote.projectId,revision:remote.serverRevision}]}));
  await page.route('**/storage/v1/**', route => route.request().method() === 'GET'
    ? route.fulfill({status:200,contentType:'image/png',body:newCover}) : route.fallback());
  await page.reload({waitUntil:'domcontentloaded'});
  await expect.poll(async () => page.evaluate(async () => {
    const frame = document.querySelector('.preview-isolated-frame');
    const src = frame?.contentDocument?.querySelector('img')?.src;
    if (!src?.startsWith('blob:')) return null;
    return Array.from(new Uint8Array(await (await fetch(src)).arrayBuffer()));
  })).toEqual([...newCover]);
  await save(page);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect.poll(async () => page.evaluate(async () => {
    const src = document.querySelector('.preview-isolated-frame')?.contentDocument?.querySelector('img')?.src;
    return src?.startsWith('blob:') ? Array.from(new Uint8Array(await (await fetch(src)).arrayBuffer())) : null;
  })).toEqual([...newCover]);
  const download = page.waitForEvent('download'); await page.locator('#export').click();
  const zip = await JSZip.loadAsync(await readFile(await (await download).path()));
  expect(await zip.file('EPUB/Image/pic.png').async('nodebuffer')).toEqual(newCover);
});

test('a local image reference without bytes cannot produce a successful EPUB download', async ({page}) => {
  await start(page);
  await page.locator('#title').fill('누락 이미지 시험');
  await page.locator('#add').click();
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p><img src="../Image/lost.png" alt="lost" /></p>'));
  let downloads = 0; page.on('download', () => { downloads++; });
  await page.locator('#export').click();
  await expect(page.locator('#status')).toContainText('찾지 못해 EPUB을 내보낼 수 없습니다');
  expect(downloads).toBe(0);
});

test('NCX-only EPUB keeps two anchors and nesting when exported with an EPUB 3 nav', async ({page}) => {
  const zip = await JSZip.loadAsync(await fixture());
  zip.remove('OPS/nav.xhtml');
  const packageText = await zip.file('OPS/package.opf').async('string');
  zip.file('OPS/package.opf', packageText.replace(
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>'
  ).replace('<spine>', '<spine toc="ncx">'));
  const ncx = '<?xml version="1.0"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head/><docTitle><text>보존 시험</text></docTitle><navMap><navPoint id="n1" playOrder="1"><navLabel><text>첫 위치</text></navLabel><content src="Text/ch.xhtml#a"/><navPoint id="n2" playOrder="2"><navLabel><text>둘째 위치</text></navLabel><content src="Text/ch.xhtml#b"/></navPoint></navPoint></navMap></ncx>';
  zip.file('OPS/toc.ncx', ncx);
  await start(page);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('input[type=file][accept^=".epub"]').setInputFiles({
    name:'ncx.epub', mimeType:'application/epub+zip', buffer:await zip.generateAsync({type:'nodebuffer'}),
  });
  await expect(page.locator('#status')).toContainText('불러왔');
  const download = page.waitForEvent('download'); await page.locator('#export').click();
  const output = await JSZip.loadAsync(await readFile(await (await download).path()));
  expect(await output.file('OPS/toc.ncx').async('string')).toBe(ncx);
  const nav = xml(await output.file('OPS/nav.xhtml').async('string'));
  const links = [...nav.getElementsByTagName('a')];
  expect(links.map(link => link.getAttribute('href'))).toEqual(['Text/ch.xhtml#a','Text/ch.xhtml#b']);
  expect(links[0].parentNode.getElementsByTagName('ol')).toHaveLength(1);
  const opf = xml(await output.file('OPS/package.opf').async('string'));
  expect([...opf.getElementsByTagName('item')].some(item => item.getAttribute('properties') === 'nav' && item.getAttribute('href') === 'nav.xhtml')).toBe(true);
});

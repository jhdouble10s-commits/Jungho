import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';
import { cloudAssetPath } from '../../cloud-asset-path.js';
import { mockApprovedSession } from './approved-session.js';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=','base64');
const row = (page,name) => page.locator('.asset-row').filter({has:page.getByRole('button',{name:`${name} 관리`,exact:true})});
const source = page => page.evaluate(() => window.epubMonacoEditor.getValue());
async function start(page) {
  await mockApprovedSession(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.epubMonacoEditor && document.querySelector('.ProseMirror'));
  await page.locator('.new-book').click(); await page.locator('#title').fill('이미지 회귀');
}
async function upload(page,name) { await page.locator('#image').setInputFiles({name,mimeType:'image/png',buffer:png}); }
async function add(page,title,body) {
  await page.locator('.left-tab[data-panel="chaptersPanel"]').click();
  await page.locator('#add').click(); await page.locator('#ctitle').fill(title);
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(value => window.epubMonacoEditor.setValue(value),body);
}
async function actions(page,name) {
  await page.locator('.left-tab[data-panel="assetsPanel"]').click();
  const item = row(page,name);
  if (await item.locator('.asset-actions').isHidden()) await item.locator('.asset-rename').click();
  return item;
}
async function rename(page,name,next) {
  const item = await actions(page,name); await item.getByRole('button',{name:'이름변경',exact:true}).click();
  await item.getByRole('textbox',{name:'이미지 파일명'}).fill(next);
  await item.getByRole('textbox',{name:'이미지 파일명'}).press('Enter');
  await expect(row(page,next)).toBeVisible();
}
async function save(page) { await page.locator('.draft-save').click(); await expect(page.locator('#status')).toContainText('로컬'); }

test('inline rename supports Escape, updates both chapters and CSS, preserves selection and survives reload',async ({page}) => {
  await start(page); await upload(page,'a.png'); await upload(page,'unused.png');
  await add(page,'첫 장','<p id="first">A<img src="../Image/a.png" alt="A" /></p>');
  await add(page,'둘째 장','<p id="second"><img src="../Image/a.png" /><a href="#second">각주</a></p>');
  await page.evaluate(() => window.epubCssMonacoEditor.setValue('/* keep */\np { background-image:url(../Image/a.png); }'));
  const selected = await page.locator('#list .active').getAttribute('data-chapter-id');
  let dialogs = 0; page.on('dialog',async dialog => { dialogs++; await dialog.dismiss(); });
  let item = await actions(page,'a.png');
  await item.getByRole('button',{name:'이름변경'}).click();
  await item.locator('input').fill('cancel.png'); await item.locator('input').press('Escape');
  await expect(row(page,'a.png')).toBeVisible();
  await item.getByRole('button',{name:'이름변경'}).click();
  await item.locator('input').fill('blur.png'); await item.locator('input').press('Tab');
  await expect(row(page,'blur.png')).toBeVisible();
  await rename(page,'blur.png','a.png');
  await rename(page,'a.png','새 이름.png');
  expect(dialogs).toBe(0);
  await expect(page.locator('#list .active')).toHaveAttribute('data-chapter-id',selected);
  expect(await source(page)).toContain(encodeURIComponent('새 이름.png'));
  await expect(page.frameLocator('.preview-isolated-frame').locator('img')).toHaveAttribute('src',/^blob:/);
  expect(await page.locator('#css').inputValue()).toContain(encodeURIComponent('새 이름.png'));
  item = await actions(page,'unused.png'); await item.getByRole('button',{name:'삭제',exact:true}).click();
  await expect(row(page,'unused.png')).toHaveCount(0); expect(dialogs).toBe(0);
  await save(page); await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.epubMonacoEditor);
  await page.locator('.left-tab[data-panel="assetsPanel"]').click();
  await expect(row(page,'새 이름.png')).toBeVisible(); await expect(row(page,'a.png')).toHaveCount(0);
  await page.locator('.left-tab[data-panel="chaptersPanel"]').click();
  await page.locator('#list .chapter').filter({hasText:'첫 장'}).click();
  expect(await source(page)).toContain(encodeURIComponent('새 이름.png'));
  await expect(page.frameLocator('.preview-isolated-frame').locator('img')).toHaveAttribute('src',/^blob:/);
});

test('used-image warning contains chapter and line; cancel preserves asset, deletion preserves XHTML',async ({page}) => {
  await start(page); await upload(page,'used.png'); await upload(page,'unused.png');
  await add(page,'사용 장','<p>unused.png <!-- <img src="../Image/unused.png" /> --></p>\n<p><img src="../Image/used.png" /></p>');
  let item = await actions(page,'used.png'); const before = await source(page);
  const dialogPromise = page.waitForEvent('dialog'); const clicking = item.getByRole('button',{name:'삭제',exact:true}).click();
  const dialog = await dialogPromise; expect(dialog.message()).toContain('사용 장'); expect(dialog.message()).toContain('2행'); await dialog.dismiss(); await clicking;
  await expect(row(page,'used.png')).toBeVisible();
  page.once('dialog',dialog => dialog.accept()); await item.getByRole('button',{name:'삭제',exact:true}).click();
  await expect(row(page,'used.png')).toHaveCount(0); expect(await source(page)).toBe(before);
  let warned = false; page.once('dialog',async dialog => { warned = true; await dialog.dismiss(); });
  item = await actions(page,'unused.png'); await item.getByRole('button',{name:'삭제',exact:true}).click();
  await expect(row(page,'unused.png')).toHaveCount(0); expect(warned).toBe(false);
  await save(page);
  let downloads = 0; page.on('download', () => { downloads++; });
  await page.locator('#export').click();
  await expect(page.locator('#status')).toContainText('찾지 못해 EPUB을 내보낼 수 없습니다');
  expect(downloads).toBe(0);
  expect(await source(page)).toBe(before);
});

test('imported EPUB rename/delete updates image entries and manifest while retaining original chapter paths',async ({page}) => {
  const zip = new JSZip(); zip.file('mimetype','application/epub+zip');
  zip.file('META-INF/container.xml','<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OPS/book.opf" /></rootfiles></container>');
  zip.file('OPS/book.opf','<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">test</dc:identifier><dc:title>가져온 책</dc:title><dc:language>ko</dc:language></metadata><manifest><item id="ch" href="Text/ch.xhtml" media-type="application/xhtml+xml"/><item id="pic" href="Image/a.png" media-type="image/png"/><item id="unused" href="Other/a.png" media-type="image/png"/><item id="css" href="Styles/book.css" media-type="text/css"/></manifest><spine><itemref idref="ch"/></spine></package>');
  zip.file('OPS/Text/ch.xhtml',`<html xmlns="http://www.w3.org/1999/xhtml"><head><title>장</title><link rel="stylesheet" href="../Styles/book.css"/></head><body><p id="keep">${'본문 내용입니다. '.repeat(12)}<img src="../Image/a.png" alt="원본" /></p></body></html>`);
  zip.file('OPS/Styles/book.css','/* unchanged */ p { color:red; }'); zip.file('OPS/Image/a.png',png); zip.file('OPS/Other/a.png',png);
  await start(page);
  page.once('dialog',dialog => dialog.accept());
  await page.locator('input[type=file][accept^=".epub"]').setInputFiles({name:'fixture.epub',mimeType:'application/epub+zip',buffer:await zip.generateAsync({type:'nodebuffer'})});
  await expect(page.locator('#status')).toContainText('불러왔');
  await rename(page,'a.png','b.png');
  await upload(page,'added.png'); await rename(page,'added.png','uploaded.png');
  const item = await actions(page,'a-2.png'); await item.getByRole('button',{name:'삭제',exact:true}).click();
  await expect(row(page,'a-2.png')).toHaveCount(0);
  await save(page);
  const downloadPromise = page.waitForEvent('download'); await page.locator('#export').click();
  const result = await JSZip.loadAsync(await readFile(await (await downloadPromise).path()));
  expect(result.file('OPS/Image/a.png')).toBeNull(); expect(result.file('OPS/Other/a.png')).toBeNull();
  expect(await result.file('OPS/Image/b.png').async('nodebuffer')).toEqual(png);
  expect(await result.file('OPS/Image/uploaded.png').async('nodebuffer')).toEqual(png);
  expect(await result.file('OPS/Text/ch.xhtml').async('string')).toContain('src="../Image/b.png"');
  expect(await result.file('OPS/book.opf').async('string')).toContain('Image/b.png');
  expect(await result.file('OPS/Styles/book.css').async('string')).toBe('/* unchanged */ p { color:red; }');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.epubMonacoEditor);
  await page.locator('.left-tab[data-panel="assetsPanel"]').click();
  await expect(row(page,'b.png')).toBeVisible(); await expect(row(page,'uploaded.png')).toBeVisible();
  await expect(row(page,'a-2.png')).toHaveCount(0);
});

test('server cleanup follows payload save, is scoped to this project, and retries after failure',async ({page}) => {
  const user = {id:'asset-user',email:'asset@users.sitescout.local',user_metadata:{username:'asset'}};
  await mockApprovedSession(page, {user});
  let failRemove = true; const removed = [], events = [];
  await page.route('**/htzojicodwueivybovhy.supabase.co/**',async route => {
    const request = route.request(), url = request.url();
    if (request.method() === 'DELETE' && url.includes('/storage/')) {
      events.push('remove'); removed.push(request.postDataJSON());
      return route.fulfill(failRemove ? {status:403,json:{message:'fixture denied'}} : {json:[]});
    }
    if (url.includes('/epub_drafts') && request.method() === 'POST') { events.push('payload'); return route.fulfill({json:[]}); }
    if (url.includes('/storage/') && request.method() === 'POST') return route.fulfill({json:{Key:'fixture'}});
    return route.fallback();
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.account-button')).toContainText('asset');
  await page.waitForFunction(() => window.epubMonacoEditor && document.querySelector('.ProseMirror'));
  await page.locator('.new-book').click(); await page.locator('#title').fill('이미지 회귀');
  await upload(page,'unused.png'); await save(page); await expect(page.locator('#status')).toContainText('서버 동기화됨');
  const item = await actions(page,'unused.png'); await item.getByRole('button',{name:'삭제',exact:true}).click();
  await page.locator('.draft-save').click(); await expect(page.locator('#status')).toContainText('서버 정리에 실패');
  expect(removed[0].prefixes).toEqual([await cloudAssetPath(user.id,'이미지 회귀','unused.png')]);
  expect(events.slice(-2)).toEqual(['payload','remove']);
  failRemove = false;
  await page.locator('.draft-save').click(); await expect(page.locator('#status')).toContainText('서버 동기화됨');
  expect(removed).toHaveLength(2);
});

test('cover deletion warns and preserves chapter IDs and XHTML',async ({page}) => {
  await start(page);
  await page.locator('#list .cover-chapter').click();
  const coverId = await page.locator('#list .active').getAttribute('data-chapter-id');
  await page.locator('#coverInput').setInputFiles({name:'cover.png',mimeType:'image/png',buffer:png});
  await rename(page,'cover.png','renamed-cover.png');
  const before = await source(page);
  const item = await actions(page,'renamed-cover.png');
  let message;
  page.once('dialog',async dialog => { message = dialog.message(); await dialog.accept(); });
  await item.getByRole('button',{name:'삭제',exact:true}).click();
  expect(message).toContain('표지 이미지');
  expect(await source(page)).toBe(before);
  await expect(page.locator('#list .active')).toHaveAttribute('data-chapter-id',coverId);
  await save(page);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#list .cover-chapter')).toHaveAttribute('data-chapter-id',coverId);
});

test('renaming an image in a generated footnote survives note synchronization and reload',async ({page}) => {
  await start(page); await upload(page,'note.png');
  await add(page,'각주 원문','<p id="a">AAA</p>');
  await page.evaluate(() => window.epubMonacoEditor.setPosition({lineNumber:1,column:14}));
  page.once('dialog',dialog => dialog.accept('이미지각주'));
  await page.getByRole('button',{name:'각주 삽입',exact:true}).click();
  await page.locator('#list .chapter').filter({hasText:'각주 페이지'}).click();
  await page.evaluate(() => {
    const editor = window.epubMonacoEditor, model = editor.getModel();
    const match = model.findMatches('이미지각주',false,false,false,null,false)[0];
    editor.executeEdits('fixture',[{range:match.range,text:'<img src="../Image/note.png" alt="각주" />'}]);
  });
  await page.locator('#list .chapter').filter({hasText:'각주 원문'}).click();
  await rename(page,'note.png','renamed-note.png');
  await save(page); await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.epubMonacoEditor);
  await page.locator('.left-tab[data-panel="chaptersPanel"]').click();
  await page.locator('#list .chapter').filter({hasText:'각주 페이지'}).click();
  expect(await source(page)).toContain('../Image/renamed-note.png');
  await expect(page.frameLocator('.preview-isolated-frame').locator('img')).toHaveAttribute('src',/^blob:/);
});

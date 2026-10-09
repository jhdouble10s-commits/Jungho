import { test, expect } from '@playwright/test';
import { openApiSettings } from './ui-helpers.js';
import { readFile } from 'node:fs/promises';
import { loadSemanticEpub } from '../../scripts/lib/epub-semantic.mjs';
import { mockApprovedSession } from './approved-session.js';
async function start(page) {
  await mockApprovedSession(page);
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await expect(page.locator('.ProseMirror')).toBeAttached({timeout:30000});
  await page.locator('.new-book').click();
  await page.locator('#title').fill('회귀 테스트');
}
async function add(page, name, xhtml) {
  await page.locator('#add').click();
  await page.locator('#ctitle').fill(name);
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(value => window.epubMonacoEditor.setValue(value), xhtml);
}
async function select(page, name) { await page.locator('#list .chapter[data-i]').filter({hasText:name}).click({position:{x:55,y:15}}); }
test('표지 DOM 조건부 렌더 / 기본 표지와 각주 삭제 / reload에서 삭제 유지', async ({page}) => {
  await start(page);
  await expect(page.locator('#list .chapter')).toHaveCount(2);
  await expect(page.locator('.cover-read-only-view')).toHaveCount(1);
  await page.locator('#coverInput').setInputFiles({name:'cover.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=','base64')});
  await expect(page.locator('.cover-read-only-view img')).toHaveCount(1);
  await expect(page.locator('#preview img')).toHaveCount(1);
  await add(page, '본문 A', '<p>AAA</p>');
  await expect(page.locator('.cover-read-only-view')).toHaveCount(0);
  await select(page,'표지');
  await page.locator('[data-mode-toggle]').click();
  await expect(page.locator('.cover-read-only-view img')).toHaveCount(1);
  await page.locator('#del').click();
  await expect(page.locator('.cover-read-only-view')).toHaveCount(0);
  await select(page,'각주 페이지'); await page.locator('#del').click();
  await expect(page.locator('#list .chapter')).toHaveCount(1);
  await expect(page.frameLocator('.preview-isolated-frame').locator('body')).toContainText('AAA');
  await page.keyboard.press('ControlOrMeta+s');
  await expect(page.locator('#status')).toContainText('저장');
  await page.waitForTimeout(400); await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#title')).toHaveValue('회귀 테스트');
  await expect(page.locator('#list .chapter')).toHaveCount(1);
  await expect(page.locator('.cover-read-only-view')).toHaveCount(0);
});
test('전체 장 빈 태그 수정 / 유효하지 않은 XHTML 저장 차단', async ({page}) => {
  await start(page);
  await add(page,'본문 A','<p>A<br></p><p>안녕하세요 <strong>세계</strong></p>');
  await add(page,'본문 B','<p>B<img src="../Image/a.jpg" alt="A > B"></p>');
  await page.getByRole('button',{name:'XHTML 자동수정',exact:true}).click();
  await expect(page.locator('#status')).toContainText('2개 장');
  await select(page,'본문 A');
  await expect.poll(() => page.evaluate(() => window.epubMonacoEditor.getValue())).toContain('<br />');
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p id="broken">X</div>'));
  await page.keyboard.press('ControlOrMeta+s');
  await expect(page.locator('#status')).toContainText('열');
  await expect(page.locator('#status')).toHaveClass(/error/);
});
test('각주 생성 → 중앙 페이지 → 원문 왕복, 각주 삭제 후 재생성', async ({page}) => {
  await start(page);
  await select(page,'각주 페이지'); await page.locator('#del').click();
  await add(page,'본문 A','<p id="a">AAA</p>');
  await page.evaluate(() => { const e=window.epubMonacoEditor; e.setPosition({lineNumber:1,column:14}); });
  page.once('dialog', dialog => dialog.accept('각주 내용'));
  await page.getByRole('button',{name:'각주 삽입',exact:true}).click();
  await expect(page.locator('#list .chapter').filter({hasText:'각주 페이지'})).toHaveCount(1);
  await page.frameLocator('.preview-isolated-frame').locator('a').click();
  await expect(page.locator('#ctitle')).toHaveValue('각주 페이지');
  await expect(page.frameLocator('.preview-isolated-frame').locator('body')).toContainText('각주 내용');
  await page.frameLocator('.preview-isolated-frame').locator('aside a').click();
  await expect(page.locator('#ctitle')).toHaveValue('본문 A');
});
test('설정 dialog 중앙, 외부 클릭 닫기, 성공 닫기, 실패 유지', async ({page}) => {
  await start(page);
  await openApiSettings(page);
  const dialog=page.locator('dialog').filter({has:page.locator('input[name="apiKey"]')});
  await expect(dialog).toBeVisible();
  const bounds=await dialog.boundingBox();
  expect(Math.abs(bounds.x+bounds.width/2-800)).toBeLessThan(2);
  await dialog.locator('h2').click(); await expect(dialog).toBeVisible();
  await dialog.getByRole('button',{name:'저장',exact:true}).click(); await expect(dialog).toBeVisible();
  await page.mouse.click(5,5); await expect(dialog).not.toBeVisible();
  await openApiSettings(page);
  await dialog.locator('[name="apiKey"]').fill('test-only-not-a-real-key');
  await dialog.getByRole('button',{name:'저장',exact:true}).click(); await expect(dialog).not.toBeVisible();
});

test('일반편집 붙여넣기는 한 번만 반영 / 빠른 장 전환 후 다른 장 내용 잔존 없음', async ({page,context}) => {
  await start(page);
  await add(page,'본문 A','<p>AAA</p>');
  await add(page,'본문 B','<p>BBB</p>');
  await add(page,'본문 C','<p>CCC</p>');
  await page.locator('[data-mode-toggle]').click();
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.evaluate(() => navigator.clipboard.writeText('붙여넣기 검증'));
  await page.locator('.ProseMirror').click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.press('ControlOrMeta+v');
  await expect(page.locator('.ProseMirror')).toContainText('붙여넣기 검증');
  expect((await page.locator('.ProseMirror').innerText()).match(/붙여넣기 검증/g)).toHaveLength(1);
  for (const name of ['본문 A','표지','본문 B','표지','본문 C']) await select(page,name);
  await expect(page.locator('.ProseMirror')).toContainText('CCC');
  await expect(page.locator('.ProseMirror')).not.toContainText('AAA');
  await expect(page.locator('.ProseMirror')).not.toContainText('BBB');
  await expect(page.frameLocator('.preview-isolated-frame').locator('body')).toContainText('CCC');
  const ids=await page.locator('#list .active[data-chapter-id]').getAttribute('data-chapter-id');
  await expect(page.locator('.rich-editor')).toHaveAttribute('data-chapter-id',ids);
  await expect(page.locator('#preview')).toHaveAttribute('data-chapter-id',ids);
});

test('같은 문장의 Preview·Tiptap·Monaco 위치 구분 / drag 후 선택 ID·본문 보존', async ({page}) => {
  await start(page);
  await add(page,'본문 A','<p>AAA</p>');
  await add(page,'본문 B','<p id="first">동일 문장</p><p id="second">동일 문장</p>');
  await page.frameLocator('.preview-isolated-frame').locator('#second').click();
  await expect.poll(() => page.evaluate(() => { const e=window.epubMonacoEditor; return e.getModel().getLineContent(e.getPosition().lineNumber); })).toContain('id="second"');
  await expect(page.locator('#accessMessage')).toBeHidden();
  if (await page.locator('[data-mode-toggle]').textContent() === '일반편집') await page.locator('[data-mode-toggle]').click();
  await expect(page.locator('.rich-editor')).toBeVisible();
  await page.locator('.ProseMirror #first').click();
  await expect(page.frameLocator('.preview-isolated-frame').locator('#first')).toHaveClass(/preview-focus/);
  await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => {
    const e=window.epubMonacoEditor;
    e.focus(); e.setPosition({lineNumber:1,column:1});
    // Use Monaco's cursor command; ArrowDown is a visual wrapped-line move.
    e.trigger('keyboard', 'cursorBottom', {});
  });
  await expect.poll(() => page.evaluate(() => { const e=window.epubMonacoEditor; return e.getModel().getLineContent(e.getPosition().lineNumber); })).toContain('id="second"');
  await expect(page.frameLocator('.preview-isolated-frame').locator('#second')).toHaveClass(/preview-focus/);
  const selectedId = await page.locator('#list .active[data-chapter-id]').getAttribute('data-chapter-id');
  const before = await page.evaluate(() => window.epubMonacoEditor.getValue());
  const source = page.locator(`#list [data-chapter-id="${selectedId}"] .drag-handle`);
  await source.dragTo(page.locator('#list .chapter').filter({hasText:'본문 A'}), { targetPosition:{x:45,y:3} });
  await expect(page.locator(`#list [data-chapter-id="${selectedId}"]`)).toHaveClass(/active/);
  await expect.poll(() => page.evaluate(() => window.epubMonacoEditor.getValue())).toBe(before);
});

test('실제 EPUB 찬사 본문은 해당 장에만 표시 / 전환·reload·새 책에 잔존 없음 / export 보존', async ({page}) => {
  test.setTimeout(180000);
  await start(page);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('input[type=file][accept^=".epub"]').setInputFiles('기도먼저.epub');
  await expect(page.locator('#status')).toContainText('불러왔', {timeout:30000});
  // This EPUB's great.xhtml is untitled in the NCX and uses the book title.
  // Resolve its position from the fixture spine, not the visible heading text.
  const source = await loadSemanticEpub(await readFile('기도먼저.epub'));
  const praise = page.locator('#list .chapter').nth(source.spine.findIndex(item => item.href === 'OEBPS/Text/great.xhtml'));
  await praise.click({position:{x:55,y:15}});
  await page.locator('[data-mode-toggle]').click();
  await expect(page.locator('.ProseMirror')).toContainText('매트 카터');
  const other = page.locator('#list .chapter[data-i]').filter({hasNotText:'이 책을 향한 찬사들'}).filter({hasNotText:'표지'}).last();
  const selectedId = await other.getAttribute('data-chapter-id');
  await other.click({position:{x:55,y:15}});
  await expect(page.locator('.ProseMirror')).not.toContainText('매트 카터');
  const textBefore = (await page.locator('.ProseMirror').innerText()).replace(/\s+/g,' ').trim();
  expect(textBefore.length).toBeGreaterThan(0);
  await page.keyboard.press('ControlOrMeta+s');
  await expect(page.locator('#status')).toContainText('저장');
  await page.waitForTimeout(500); await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator(`#list [data-chapter-id="${selectedId}"]`)).toHaveClass(/active/);
  await expect(page.locator('.ProseMirror')).toBeAttached({timeout:30000});
  await expect.poll(async () => (await page.locator('.ProseMirror').innerText()).replace(/\s+/g,' ').trim()).toBe(textBefore);
  await expect(page.locator('.ProseMirror')).not.toContainText('매트 카터');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await downloadPromise;
  const exported = await loadSemanticEpub(await readFile(await download.path()));
  expect(exported.spine).toEqual(source.spine);
  expect(exported.flatToc).toEqual(source.flatToc);
  expect(exported.images).toEqual(source.images);
  expect(exported.stylesheets).toEqual(source.stylesheets);
  expect(exported.brokenResources).toEqual([]);
  expect(exported.brokenHrefs).toEqual([]);
  await page.locator('.new-book').click();
  await select(page,'각주 페이지');
  await expect(page.locator('.ProseMirror')).not.toContainText('매트 카터');
  await expect(page.frameLocator('.preview-isolated-frame').locator('body')).not.toContainText('매트 카터');
});

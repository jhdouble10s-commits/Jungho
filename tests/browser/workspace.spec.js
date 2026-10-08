import { test, expect } from '@playwright/test';
import { setTheme, openApiSettings } from './ui-helpers.js';
import { approvedUser, mockApprovedSession } from './approved-session.js';

async function start(page) {
  await mockApprovedSession(page);
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubCssMonacoEditor), null, {timeout:30000});
  await expect(page.locator('.ProseMirror')).toBeAttached({timeout:30000});
}
async function record(page, title) {
  return page.evaluate(async ({ ownerId, title }) => {
    const {default:Dexie} = await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');
    const db = new Dexie('epub-builder-projects'); await db.open();
    try { return (await db.table('projects').get([ownerId,title]))?.payload; }
    finally { db.close(); }
  },{ownerId:approvedUser.id,title});
}

test('file actions share the book information card, align centrally and wrap within the 30px main padding', async ({page}) => {
  await start(page);
  const card=page.locator('.epub-topbar');
  await expect(card.locator('.epub-file-actions button')).toHaveCount(3);
  await expect(page.locator('main > .epub-file-actions')).toHaveCount(0);
  for(const width of [1600,1280,768,700,390,320,2560]) {
    await page.setViewportSize({width,height:1000});
    await expect.poll(async ()=>(await card.boundingBox()).y).toBe(width<=700?66:30);
    for(const id of ['title','author','language']) await expect(card.locator(`#${id}`)).toBeVisible();
    const geometry=await card.evaluate(node=>{
      const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,center:r.top+r.height/2};};
      return {card:rect(node),items:[...node.querySelectorAll('.field,.epub-file-actions button')].map(rect),
        inputs:[...node.querySelectorAll('.book-inline input')].map(rect),
        actions:rect(node.querySelector('.epub-file-actions')),
        overflow:document.documentElement.scrollWidth-innerWidth};
    });
    expect(geometry.overflow).toBe(0);
    for(const item of geometry.items) {
      expect(item.left).toBeGreaterThanOrEqual(geometry.card.left);
      expect(item.right).toBeLessThanOrEqual(geometry.card.right);
      expect(item.top).toBeGreaterThanOrEqual(geometry.card.top);
      expect(item.bottom).toBeLessThanOrEqual(geometry.card.bottom);
    }
    for(let i=0;i<geometry.items.length;i++) for(let j=i+1;j<geometry.items.length;j++) {
      const a=geometry.items[i],b=geometry.items[j];
      expect(a.right<=b.left || b.right<=a.left || a.bottom<=b.top || b.bottom<=a.top).toBe(true);
    }
    if(width>=1600) for(const input of geometry.inputs) expect(Math.abs(input.center-geometry.actions.center)).toBeLessThanOrEqual(1);
    expect(geometry.card.right-geometry.actions.right).toBeLessThanOrEqual(30);
    if([1600,390].includes(width)) await page.screenshot({path:test.info().outputPath(`book-actions-${width}.png`)});
  }
  await page.setViewportSize({width:1920,height:1080});
  for (const label of ['불러오기','내보내기']) {
    const button = card.getByRole('button',{name:label,exact:true});
    await expect(button).toHaveCSS('font-size','14px');
    await expect(button).toHaveCSS('font-weight','600');
    await expect(button).toHaveCSS('height','34px');
  }
  await expect(card.locator('#title')).toHaveCSS('font-size','14px');
  await expect(card.locator('#title')).toHaveCSS('height','34px');
  expect((await card.boundingBox()).height).toBeLessThanOrEqual(54);
});

test('compact workspace actions, fixed chapter footer, CSS backgrounds, settings and automatic preview', async ({page}) => {
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await start(page);
  await expect(page.locator('.sb-brand')).toHaveText('JJH Studio');
  await expect(page.locator('.sb-brand-mark')).toHaveCSS('border-radius','50%');
  await expect(page.locator('.sb-content summary')).toHaveText('EPUB MAKE');
  await expect(page.locator('.sb-submenu .tab')).toHaveText('프로젝트');
  await expect(page.locator('.epub-file-actions button')).toHaveCount(3);
  await expect(page.getByRole('button',{name:'미리보기 갱신',exact:true})).toHaveCount(0);
  await expect(page.locator('.clear-drafts')).toHaveCount(0);
  await expect(page.locator('.rich-toolbar .footnote-insert svg')).toHaveCount(1);
  await expect(page.locator('.editor > .toolbar .draft-save')).toHaveAttribute('aria-label','임시저장');
  const tools=page.locator('.editor > .toolbar > button');
  expect(await tools.evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')))).toEqual(['맞춤법 교정','XHTML 자동수정','임시저장']);
  await expect(tools.locator('svg')).toHaveCount(3);
  const a=await tools.nth(0).boundingBox(), b=await tools.nth(1).boundingBox();
  expect(a.y).toBe(b.y);
  const footer=page.locator('.chapter-footer');
  const before=await footer.boundingBox();
  for(let i=0;i<30;i++) await page.locator('#add').click();
  await expect(page.locator('#list .chapter')).toHaveCount(32);
  expect(await footer.boundingBox()).toEqual(before);
  await page.locator('#list').evaluate(node=>{node.scrollTop=node.scrollHeight;});
  const last=await page.locator('#list .chapter').last().boundingBox();
  expect(last.y+last.height).toBeLessThanOrEqual(before.y+1);
  await expect(page.locator('.chapter-footer #del')).toHaveText('삭제');
  await page.locator('#del').click();
  await expect(page.locator('#list .chapter')).toHaveCount(31);
  await page.locator('[data-mode-toggle]').click();
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p id="live">자동 미리보기</p>'));
  await expect(page.locator('#preview #live')).toHaveText('자동 미리보기');
  await page.locator('.left-tab[data-panel="cssPanel"]').click();
  await page.evaluate(()=>window.epubCssMonacoEditor.setValue('#live { color: rgb(12, 34, 56); }'));
  await expect(page.locator('#preview #live')).toHaveCSS('color','rgb(12, 34, 56)');
  for(const theme of ['light','dark']) {
    await setTheme(page,theme);
    const backgrounds=await page.locator('#css-monaco-editor').evaluate(host=>[
      host,host.querySelector('.monaco-editor'),host.querySelector('.monaco-editor-background'),host.querySelector('.margin')
    ].map(node=>getComputedStyle(node).backgroundColor));
    expect(new Set(backgrounds).size).toBe(1);
    expect(await page.evaluate(()=>window.epubCssMonacoEditor.getOption(window.monaco.editor.EditorOption.renderLineHighlight))).toBe('none');
  }
  await page.screenshot({path:test.info().outputPath('workspace-css-dark.png')});
  await page.locator('.left-tab[data-panel="chaptersPanel"]').click();
  await page.screenshot({path:test.info().outputPath('workspace-dark.png')});
  await openApiSettings(page);
  await expect(page.locator('input[name="apiKey"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(errors).toEqual([]);
});

test('save and immediate project reopen read latest selected chapter; other chapters/projects and reload stay independent', async ({page}) => {
  await start(page);
  await page.locator('#title').fill('프로젝트 A');
  for(const name of ['A','B','C']) {
    await page.locator('#add').click();
    await page.locator('#ctitle').fill(name);
    if(await page.locator('[data-mode-toggle]').textContent()==='XHTML편집') await page.locator('[data-mode-toggle]').click();
    await page.evaluate(name=>window.epubMonacoEditor.setValue(`<p>${name}</p>`),name);
  }
  await page.locator('.draft-save').click();
  await expect(page.locator('#status')).toContainText('로컬');
  await page.locator('.sb-projects .tab').click();
  const original=await record(page,'프로젝트 A');
  const selected=original.selectedChapterId;
  await page.evaluate(()=>{
    window.epubMonacoEditor.setValue('<p id="latest">최신 CCC<br /></p>');
    // Same browser task: the project row still refers to the previous save.
    document.querySelector('.draft-save').click();
    document.querySelector('.draft-item').click();
  });
  await expect(page.locator('#status')).toContainText('불러왔습니다');
  await expect(page.locator('#preview #latest')).toContainText('최신 CCC');
  const latest=await record(page,'프로젝트 A');
  expect(latest.selectedChapterId).toBe(selected);
  expect(latest.chapters.find(c=>c.id===selected).xhtml).toContain('최신 CCC');
  for(const chapter of original.chapters.filter(c=>c.id!==selected)) expect(latest.chapters.find(c=>c.id===chapter.id)).toEqual(chapter);
  await page.locator('[data-mode-toggle]').click();
  await page.locator('.ProseMirror').press('ControlOrMeta+End');
  await page.keyboard.type(' 일반편집 저장');
  await page.locator('.draft-save').click();
  await expect(page.locator('#status')).toContainText('로컬');
  await page.locator('.epub-file-actions .new-book').click();
  await page.locator('#title').fill('프로젝트 B');
  await page.locator('#add').click();
  await page.locator('.ProseMirror').fill('다른 프로젝트');
  await page.locator('.draft-save').click();
  await expect(page.locator('#status')).toContainText('로컬');
  const other=await record(page,'프로젝트 B');
  await page.getByRole('button',{name:'프로젝트 A',exact:true}).click();
  await expect(page.locator('#preview')).toContainText('일반편집 저장');
  expect(await record(page,'프로젝트 B')).toEqual(other);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#title')).toHaveValue('프로젝트 A');
  await expect(page.locator('#preview')).toContainText('일반편집 저장');
  await expect(page.locator('#list .active')).toHaveAttribute('data-chapter-id',selected);
});

test('moved proofread button sends one request and updates preview; image arrival resolves existing XHTML', async ({page}) => {
  await start(page);
  let requests=0;
  await page.route('https://generativelanguage.googleapis.com/v1/interactions', async route=>{
    requests++;
    const body=route.request().postDataJSON();
    const input=JSON.parse(body.input);
    expect(input.paragraphs.every(p=>!p.text.includes('<p'))).toBe(true);
    await route.fulfill({json:{steps:[{type:'model_output',content:[{type:'text',text:JSON.stringify({paragraphs:input.paragraphs.map(p=>({id:p.id,correctedText:p.text.replace('기도를통해','기도를 통해')}))})}]}]}});
  });
  await openApiSettings(page);
  const api=page.locator('dialog').filter({has:page.locator('input[name="apiKey"]')});
  await api.locator('input[name="apiKey"]').fill('mock-key-no-network');
  await api.getByRole('button',{name:'저장',exact:true}).click();
  await page.locator('#add').click();
  await page.locator('[data-mode-toggle]').click();
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p id="corrected">기도를통해 성장합니다.</p><p><img src="../Image/fixture.png" alt="fixture" /></p>'));
  await page.getByRole('button',{name:'맞춤법 교정',exact:true}).click();
  await expect(page.locator('#preview #corrected')).toHaveText('기도를 통해 성장합니다.');
  expect(requests).toBe(1);
  await expect.poll(()=>page.evaluate(()=>window.epubMonacoEditor.getValue())).toContain('id="corrected"');
  await page.locator('#image').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=','base64')});
  await expect(page.locator('#preview img')).toHaveAttribute('src',/^blob:/);
  await expect.poll(()=>page.evaluate(()=>window.epubMonacoEditor.getValue())).toContain('src="../Image/fixture.png"');
  await page.locator('[data-mode-toggle]').click();
  await expect(page.locator('.ProseMirror img')).toHaveAttribute('src',/^blob:/);
});

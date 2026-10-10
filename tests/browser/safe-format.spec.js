import {test,expect} from '@playwright/test';
import {mockApprovedSession} from './approved-session.js';
test('default Format Document preserves a long Korean paragraph and visual editing',async ({page}) => {
  await mockApprovedSession(page); await page.goto('/');
  await page.waitForFunction(() => window.epubMonacoEditor && document.querySelector('.ProseMirror'));
  await page.locator('#add').click();
  await page.locator('[data-mode-toggle]').click();
  const source = `<p>${'긴 한국어 문장의 본문 공백을 유지해야 합니다. '.repeat(25)}</p>`;
  await page.evaluate(source => window.epubMonacoEditor.setValue(source),source);
  await page.evaluate(() => window.epubMonacoEditor.getAction('editor.action.formatDocument').run());
  expect(await page.locator('#body').inputValue()).toBe(source);
  await page.locator('[data-mode-toggle]').click();
  await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable','true');
});

import JSZip from 'jszip';
import {readFile,writeFile} from 'node:fs/promises';
import {DOMParser} from '@xmldom/xmldom';
import {loadSemanticEpub} from '../../scripts/lib/epub-semantic.mjs';
test('format entry points, repeated formatting, visual paste, save/reopen and actual EPUB output preserve XML',async ({page}) => {
  await mockApprovedSession(page);await page.goto('/');
  await page.waitForFunction(()=>window.epubMonacoEditor && document.querySelector('.ProseMirror'));
  await page.locator('#title').fill('포맷 왕복');
  await page.locator('#add').click();
  await page.locator('[data-mode-toggle]').click();
  const samples = [
    '<p>짧은 첫 문단</p><p>둘째 문단</p>',
    '<p>앞 <strong>강조</strong> 뒤 &amp; &lt; $1 $$ $&amp; $20 \u00a0 끝</p>',
    '<pre><code>  공백\n    다음 줄\n</code></pre>',
    '<p>A<br />B</p><img src="../Image/format.png" alt="A &amp; B" />',
  ];
  for (const source of samples) {
    await page.evaluate(source=>window.epubMonacoEditor.setValue(source),source);
    await page.evaluate(()=>window.epubMonacoEditor.getAction('editor.action.formatDocument').run());
    const formatted=await page.locator('#body').inputValue();
    await page.evaluate(()=>window.epubMonacoEditor.getAction('epub.xhtml.format').run());
    expect(await page.locator('#body').inputValue()).toBe(formatted);
    await page.evaluate(()=>window.epubMonacoEditor.focus());await page.keyboard.press('Shift+Alt+f');
    expect(await page.locator('#body').inputValue()).toBe(formatted);
    await page.locator('[data-mode-toggle]').click();
    await expect(page.locator('.ProseMirror'),`${source} :: ${await page.locator('.visual-read-only-notice').textContent()}`).toHaveAttribute('contenteditable','true');
    await page.locator('[data-mode-toggle]').click();expect(await page.locator('#body').inputValue()).toBe(formatted);
  }
  for(const source of ['<p>A<img src="inline.png" alt="inline" />B</p>','<p><ruby>漢<rt>한</rt></ruby></p>','<p><svg xmlns="http://www.w3.org/2000/svg"><circle r="1" /></svg></p>','<p xml:space="preserve" style="white-space:pre-wrap"> A  B\n C </p>']) {
    await page.evaluate(source=>window.epubMonacoEditor.setValue(source),source);
    await page.evaluate(()=>window.epubMonacoEditor.getAction('editor.action.formatDocument').run());
    await page.locator('[data-mode-toggle]').click();await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable','false');
    expect(await page.locator('#body').inputValue()).toBe(source);
    await page.locator('[data-mode-toggle]').click();
  }
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>붙여넣기: </p>'));
  await page.locator('[data-mode-toggle]').click();
  await page.locator('.ProseMirror').click();await page.keyboard.press('ControlOrMeta+End');
  await page.locator('.ProseMirror').evaluate(node=>{
    const data=new DataTransfer();data.setData('text/html','<strong>A &amp; B</strong> $1 $$ $&amp; $20<br>한글');
    node.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));
  });
  await expect(page.locator('.ProseMirror')).toContainText('A & B');
  await page.locator('[data-mode-toggle]').click();await page.evaluate(()=>window.epubMonacoEditor.getAction('editor.action.formatDocument').run());
  const source=await page.locator('#body').inputValue();
  await page.locator('[data-mode-toggle]').click();await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable','true');
  await page.locator('.draft-save').click();await expect(page.locator('.draft-save')).toBeEnabled();
  await page.reload();await expect(page.locator('#title')).toHaveValue('포맷 왕복');
  expect(await page.locator('#body').inputValue()).toBe(source);
  const download=page.waitForEvent('download');await page.locator('#export').click();
  const bytes=await readFile(await (await download).path());await writeFile(test.info().outputPath('format-roundtrip.epub'),bytes);
  const zip=await JSZip.loadAsync(bytes);const xhtml=[];
  for(const path of Object.keys(zip.files).filter(path=>/\.(xhtml|opf|ncx)$/.test(path))) {
    const text=await zip.file(path).async('string');
    new DOMParser({onError:(level,message)=>{if(level!=='warning')throw new Error(message);}}).parseFromString(text,'application/xml');
    if(path.endsWith('.xhtml'))xhtml.push(text);
  }
  expect(xhtml.join('')).toContain('$1 $$ $&amp; $20');
  const semantic=await loadSemanticEpub(bytes);expect(semantic.brokenResources).toEqual([]);expect(semantic.brokenHrefs).toEqual([]);
});

test('unsupported pasted XHTML is rejected before loss and Korean composition reaches the XML boundary',async ({page})=>{
  await mockApprovedSession(page);await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.epubMonacoEditor && document.querySelector('.ProseMirror'));
  await page.locator('#add').click();await page.locator('.ProseMirror').fill('원문');
  const before=await page.locator('#body').inputValue();
  await page.locator('.ProseMirror').evaluate(node=>{const data=new DataTransfer();data.setData('text/html','<p><ruby>漢<rt>한</rt></ruby></p>');node.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));});
  await expect(page.locator('#status')).toContainText('붙여넣기를 중단');expect(await page.locator('#body').inputValue()).toBe(before);
  await page.locator('.ProseMirror').click();await page.keyboard.press('ControlOrMeta+End');
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.imeSetComposition',{text:'한',selectionStart:1,selectionEnd:1});await cdp.send('Input.insertText',{text:'한글'});
  await expect(page.locator('#body')).toHaveValue(/원문한글/);await cdp.detach();
  const xml=await page.evaluate(async()=>{const {serializeVisualXhtml}=await import('/visual-xhtml.js');return serializeVisualXhtml('<p title="A &amp; B">&lt;&amp;\u00a0<br></p><table><colgroup><col span="2"></colgroup></table><svg xmlns="http://www.w3.org/2000/svg"><circle r="1"></circle></svg>');});
  const document=new DOMParser().parseFromString(`<root xmlns="http://www.w3.org/1999/xhtml">${xml}</root>`,'application/xml');
  expect(document.getElementsByTagName('parsererror').length).toBe(0);expect(document.getElementsByTagName('col').length).toBe(1);expect(document.getElementsByTagName('circle')[0].namespaceURI).toBe('http://www.w3.org/2000/svg');
});

test('a table made with the visual toolbar stays editable after every document-format entry point',async ({page})=>{
  await mockApprovedSession(page);await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.epubMonacoEditor && document.querySelector('.ProseMirror'));
  await page.locator('#add').click();await page.locator('.ProseMirror').click();
  await page.getByRole('button',{name:'표 편집',exact:true}).click();await page.getByRole('button',{name:'2×2 표 삽입',exact:true}).click();await page.keyboard.press('Escape');
  await page.locator('.ProseMirror td,.ProseMirror th').first().click();await page.keyboard.type('표 본문');
  const original=await page.locator('#body').inputValue();await page.locator('[data-mode-toggle]').click();
  await page.evaluate(()=>window.epubMonacoEditor.getAction('editor.action.formatDocument').run());const formatted=await page.locator('#body').inputValue();
  await page.locator('[data-mode-toggle]').click();await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable','true');await expect(page.locator('.ProseMirror')).toContainText('표 본문');
  await page.locator('[data-mode-toggle]').click();await page.locator('#xhtml-monaco-editor .view-lines').click({button:'right'});
  await page.getByRole('menuitem',{name:/Format Document/}).click();expect(await page.locator('#body').inputValue()).toBe(formatted);
  await page.evaluate(()=>window.epubMonacoEditor.getAction('editor.action.quickCommand').run());
  await page.locator('.quick-input-widget input[type=text]').fill('Format Document');await page.keyboard.press('Enter');expect(await page.locator('#body').inputValue()).toBe(formatted);
  await page.locator('[data-editor-action=undo]').click();expect(await page.locator('#body').inputValue()).toBe(original);
  await page.locator('[data-editor-action=redo]').click();expect(await page.locator('#body').inputValue()).toBe(formatted);
});

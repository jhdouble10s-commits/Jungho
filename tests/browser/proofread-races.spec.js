import {test,expect} from '@playwright/test';
import {mockApprovedSession} from './approved-session.js';
import {setFakeGeminiKey,openApiSettings} from './ui-helpers.js';
async function start(page) {
  await mockApprovedSession(page);await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.epubMonacoEditor && document.querySelector('.ProseMirror'));
  await setFakeGeminiKey(page);await page.locator('#add').click();await page.locator('[data-mode-toggle]').click();
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>기도를통해 성장합니다.</p>'));
}
function gate() {let release;const promise=new Promise(resolve=>release=resolve);return {promise,release};}
async function response(route) {
  const {paragraphs}=JSON.parse(route.request().postDataJSON().input);
  await route.fulfill({json:{steps:[{type:'model_output',content:[{type:'text',text:JSON.stringify({paragraphs:paragraphs.map(p=>({...p,correctedText:p.text.replace('기도를통해','기도를 통해')}))})}]}]}});
}
test('changed A retains a comparison result and cancellation permits a new request without late overwrite',async ({page})=>{
  await start(page);const started=gate(),hold=gate();let calls=0;
  await page.route('**/v1/interactions',async route=>{calls++;if(calls===1){started.release();await hold.promise;}await response(route);});
  await page.getByRole('button',{name:'맞춤법 교정',exact:true}).click();await started.promise;
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>요청 중 새 원문</p>'));hold.release();
  await expect(page.locator('.proofread-state')).toContainText('자동 적용하지 않았습니다');
  expect(await page.locator('#body').inputValue()).toBe('<p>요청 중 새 원문</p>');
  await page.getByRole('button',{name:'교정 결과 비교'}).click();await expect(page.getByLabel('교정 결과')).toHaveValue('<p>기도를 통해 성장합니다.</p>');await page.keyboard.press('Escape');
  const late=gate(),secondStarted=gate();await page.route('**/v1/interactions',async route=>{secondStarted.release();await late.promise;await response(route);});
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>기도를통해 성장합니다.</p>'));
  await page.getByRole('button',{name:'맞춤법 교정',exact:true}).click();await secondStarted.promise;
  await page.getByRole('button',{name:'교정 취소',exact:true}).click();await expect(page.getByRole('button',{name:'맞춤법 교정',exact:true})).toBeEnabled();
  late.release();await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>취소 후 원문</p>'));
  await expect(page.locator('#body')).toHaveValue('<p>취소 후 원문</p>');
});

test('API key is memory only and account change clears fields, pending requests and nonsecret settings',async ({page})=>{
  await page.addInitScript(()=>{if(window===top)localStorage.setItem('epub-gemini-api-key-v1','legacy-synthetic-key');});
  await start(page);
  expect(await page.evaluate(()=>localStorage.getItem('epub-gemini-api-key-v1'))).toBeNull();
  await openApiSettings(page);await page.locator('textarea[name=prompt]').fill('A 전용 프롬프트');await page.locator('.gemini-settings-form button[type=submit]').click();
  await page.locator('.account-button').click();await expect(page).toHaveURL(/\/login\//);
  await mockApprovedSession(page,{user:{id:'00000000-0000-4000-8000-000000000002',email:'b@example.test',app_metadata:{},user_metadata:{},is_anonymous:false}});
  await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.epubMonacoEditor);
  await openApiSettings(page);await expect(page.locator('input[name=apiKey]')).toHaveValue('');await expect(page.locator('textarea[name=prompt]')).not.toHaveValue('A 전용 프롬프트');
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'맞춤법 교정',exact:true}).click();await expect(page.getByRole('dialog').filter({hasText:'Gemini API'})).toBeVisible();
});

test('AI completion while a save is awaiting its server response does not rewind the corrected source',async ({page})=>{
  await start(page);await page.locator('#title').fill('저장 교정 경합');
  const saving=gate(),server=gate();await page.route('**/save_epub_project',async route=>{saving.release();await server.promise;await route.fulfill({json:{revision:1}});});
  const ai=gate(),aiStarted=gate();await page.route('**/v1/interactions',async route=>{aiStarted.release();await ai.promise;await response(route);});
  await page.getByRole('button',{name:'맞춤법 교정',exact:true}).click();await aiStarted.promise;
  await page.locator('.draft-save').click();await saving.promise;ai.release();
  await expect(page.locator('#body')).toHaveValue('<p>기도를 통해 성장합니다.</p>');
  await page.locator('#author').fill('응답 대기 중 저자');server.release();await expect(page.locator('.draft-save')).toBeEnabled();
  await expect(page.locator('#body')).toHaveValue('<p>기도를 통해 성장합니다.</p>');await expect(page.locator('#author')).toHaveValue('응답 대기 중 저자');
});

test('chapter deletion and project replacement cancel the captured target and discard late responses',async ({page})=>{
  await start(page);
  for(const action of ['delete','replace']) {
    if(action==='replace') {await page.locator('#add').click();await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>기도를통해</p>'));}
    const started=gate(),hold=gate();
    await page.route('**/v1/interactions',async route=>{started.release();await hold.promise;await response(route);});
    await page.getByRole('button',{name:'맞춤법 교정',exact:true}).click();await started.promise;
    if(action==='delete'){page.once('dialog',dialog=>dialog.accept());await page.locator('#del').click();}
    else await page.locator('.new-book').click();
    await expect(page.getByRole('button',{name:'맞춤법 교정',exact:true})).toBeEnabled();
    const before=await page.locator('#body').inputValue();hold.release();
    await expect(page.locator('.proofread-state')).toContainText('취소');expect(await page.locator('#body').inputValue()).toBe(before);
  }
});

test('timeout and malformed AI response release the request and never write the source',async ({page})=>{
  await start(page);
  await page.evaluate(()=>{const original=AbortSignal.timeout.bind(AbortSignal);AbortSignal.timeout=duration=>original(duration===120000?50:duration);});
  const hold=gate();await page.route('**/v1/interactions',async route=>{await hold.promise;await response(route);});
  await page.getByRole('button',{name:'맞춤법 교정',exact:true}).click();
  await expect(page.locator('.proofread-state')).toContainText(/timeout|timed out/i);hold.release();
  await expect(page.getByRole('button',{name:'맞춤법 교정',exact:true})).toBeEnabled();
  expect(await page.locator('#body').inputValue()).toBe('<p>기도를통해 성장합니다.</p>');
  await page.route('**/v1/interactions',route=>route.fulfill({json:{steps:[{type:'model_output',content:[{type:'text',text:'{broken-json'}]}]}}));
  await page.getByRole('button',{name:'맞춤법 교정',exact:true}).click();await expect(page.getByRole('button',{name:'맞춤법 교정',exact:true})).toBeEnabled();
  expect(await page.locator('#body').inputValue()).toBe('<p>기도를통해 성장합니다.</p>');
});

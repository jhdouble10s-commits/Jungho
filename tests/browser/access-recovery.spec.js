import {cacheCdn} from './cdn-cache.js';
import { test, expect } from '@playwright/test';

const api = 'https://htzojicodwueivybovhy.supabase.co';
const users = [
  { id:'00000000-0000-4000-8000-000000000001', email:'jungho@users.sitescout.local', is_anonymous:false, app_metadata:{}, user_metadata:{} },
  { id:'00000000-0000-4000-8000-000000000002', email:'other@users.sitescout.local', is_anonymous:false, app_metadata:{}, user_metadata:{} },
];
const session = user => {
  const exp = Math.floor(Date.now()/1000)+3600;
  return {access_token:`header.${Buffer.from(JSON.stringify({sub:user.id,exp})).toString('base64url')}.signature`,refresh_token:'browser-recovery',expires_at:exp,expires_in:3600,token_type:'bearer',user};
};
async function arrange(page) {
  await cacheCdn(page);
  let user = users[0]; let status = 'approved'; let outage = false;
  await page.addInitScript(value => {
    if (!localStorage.getItem('sb-htzojicodwueivybovhy-auth-token')) localStorage.setItem('sb-htzojicodwueivybovhy-auth-token', JSON.stringify(value));
  }, session(user));
  await page.route(`${api}/**`, async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/user_profiles')) {
      if (outage) return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'temporary outage'})});
      return route.fulfill({json:{user_id:user.id,username:user.email.split('@')[0],display_name:user.email.split('@')[0],role:'user',status}});
    }
    if (path.endsWith('/user')) return route.fulfill({json:user});
    if (path.endsWith('/token')) return route.fulfill({json:session(user)});
    return route.fulfill({json:[]});
  });
  return { setOutage:value => { outage=value; }, setStatus:value => { status=value; }, switchUser:() => { user=users[1]; } };
}

test('profile 503 keeps unsaved text in memory, retry restores access, real denial redirects', async ({page}) => {
  const auth = await arrange(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await page.locator('#add').click();
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p>저장하지 않은 원고</p>'));
  auth.setOutage(true);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.locator('#accessMessage .startup-retry')).toBeVisible();
  await expect(page.locator('.app')).toHaveJSProperty('inert', true);
  expect(await page.locator('#body').inputValue()).toContain('저장하지 않은 원고');
  auth.setOutage(false);
  await page.locator('#accessMessage .startup-retry').click();
  await expect(page.locator('.app')).toHaveJSProperty('inert', false);
  expect(await page.locator('#body').inputValue()).toContain('저장하지 않은 원고');
  auth.setStatus('rejected');
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page).toHaveURL(/\/login\/\?reason=rejected/);
});

test('account switch reloads into the other owner without exposing the previous draft', async ({page}) => {
  const auth = await arrange(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await page.locator('#title').fill('첫 계정의 원고');
  await page.locator('.draft-save').click();
  await expect(page.locator('#status')).toContainText('서버 저장 완료');
  auth.switchUser();
  await page.evaluate(async () => {
    const {client} = await import('/auth-client.js');
    await client.auth.signInWithPassword({email:'other@users.sitescout.local',password:'fixture'});
  });
  await expect(page.locator('#title')).not.toHaveValue('첫 계정의 원고');
  await expect(page.locator('#title')).toHaveValue('');
  await expect(page.locator('.drafts-panel')).not.toContainText('첫 계정의 원고');
});

test('a 503 preserves an unsaved recovery copy across reload without replacing the saved draft or another account', async ({page}) => {
  const auth = await arrange(page);
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await page.locator('#title').fill('복구할 책');
  await page.locator('#add').click();
  if (await page.locator('[data-mode-toggle]').textContent() === 'XHTML편집') await page.locator('[data-mode-toggle]').click();
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p>기존 저장본</p>'));
  await page.locator('.draft-save').click();
  await expect(page.locator('#status')).toContainText('서버 저장 완료');
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p>503 직전 미저장 원고</p>'));
  auth.setOutage(true);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.locator('#accessMessage .startup-retry')).toBeVisible();
  auth.setOutage(false);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubMonacoEditor));
  await expect(page.locator('#body')).toHaveValue('<p>기존 저장본</p>');
  await expect(page.locator('.draft-recovery')).toBeVisible();
  await page.getByRole('button',{name:'미저장 원고 복구'}).click();
  await expect(page.locator('#body')).toHaveValue('<p>503 직전 미저장 원고</p>');
  auth.switchUser();
  await page.evaluate(async () => {
    const {client} = await import('/auth-client.js');
    await client.auth.signInWithPassword({email:'other@users.sitescout.local',password:'fixture'});
  });
  await expect(page.locator('#body')).not.toHaveValue('<p>503 직전 미저장 원고</p>');
  await expect(page.locator('.draft-recovery')).toBeHidden();
});

test('same-user focus and token refresh coalesce without hiding the editor or resetting cursor/history',async ({page})=>{
  await arrange(page);await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.epubMonacoEditor);
  await page.locator('#add').click();await page.locator('[data-mode-toggle]').click();
  await page.evaluate(()=>{window.epubMonacoEditor.executeEdits('typing',[{range:window.epubMonacoEditor.getModel().getFullModelRange(),text:'<p>포커스 복귀 원고</p>'}]);window.epubMonacoEditor.setPosition({lineNumber:1,column:7});window.epubMonacoEditor.focus();});
  await expect(page.locator('[data-editor-action=undo]')).toBeEnabled();
  const before=await page.evaluate(()=>({model:window.epubMonacoEditor.getModel().uri.toString(),position:window.epubMonacoEditor.getPosition(),source:window.epubMonacoEditor.getValue()}));
  let release,started;const hold=new Promise(resolve=>release=resolve),first=new Promise(resolve=>started=resolve);let queries=0;
  await page.route('**/rest/v1/user_profiles*',async route=>{queries++;started();await hold;await route.fallback();});
  await page.evaluate(()=>{
    window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
  });await first;
  await expect(page.locator('.app')).toHaveJSProperty('inert',false);await expect(page.locator('#accessMessage')).toBeHidden();expect(queries).toBe(1);
  expect(await page.evaluate(()=>({model:window.epubMonacoEditor.getModel().uri.toString(),position:window.epubMonacoEditor.getPosition(),source:window.epubMonacoEditor.getValue()}))).toEqual(before);
  release();await page.evaluate(async()=>{const {client}=await import('/auth-client.js');await client.auth.refreshSession();});
  await expect(page.locator('.app')).toHaveJSProperty('inert',false);await expect(page.locator('#accessMessage')).toBeHidden();
  expect(await page.locator('#body').inputValue()).toBe(before.source);
  await expect(page.locator('[data-editor-action=undo]')).toBeEnabled();
});

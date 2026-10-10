import { test, expect } from '@playwright/test';
import { mockApprovedSession } from './approved-session.js';

test('hashing a save cannot rewind newer text or metadata', async ({page}) => {
  page.on('pageerror', error => console.log('startup error:',error.message));
  page.on('requestfailed', request => console.log('request failed:',request.url(),request.failure()?.errorText));
  await mockApprovedSession(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.epubMonacoEditor && document.querySelector('.ProseMirror'));
  await page.locator('#add').click();
  await page.locator('#title').fill('저장 경합');
  await page.locator('#image').setInputFiles({name:'race.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=','base64')});
  await page.evaluate(() => {
    window.epubMonacoEditor.setValue('<p>저장 전</p>');
    const digest = crypto.subtle.digest.bind(crypto.subtle);
    crypto.subtle.digest = async (...args) => {
      crypto.subtle.digest = digest;
      await new Promise(resolve => { window.releaseHash = resolve; });
      return digest(...args);
    };
    document.querySelector('.draft-save').click();
  });
  await page.waitForFunction(() => window.releaseHash);
  await page.evaluate(() => window.epubMonacoEditor.setValue('<p>저장 중 새 입력</p>'));
  await page.locator('#author').fill('저장 중 새 저자');
  await page.evaluate(() => window.releaseHash());
  await expect(page.locator('.draft-save')).toBeEnabled();
  expect(await page.locator('#body').inputValue()).toBe('<p>저장 중 새 입력</p>');
  await expect(page.locator('#author')).toHaveValue('저장 중 새 저자');
});

import {approvedUser} from './approved-session.js';
import {projectCloud} from './project-cloud-fixture.js';
async function start(page,cloud) {
  await mockApprovedSession(page);await cloud.attach(page);await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.epubMonacoEditor && document.querySelector('.ProseMirror'));
}
async function save(page,cloud,{server=true}={}) {
  const button=page.locator('.draft-save');
  const before=cloud.saveCount;
  await button.click();
  if (server) await expect.poll(()=>cloud.saveCount).toBeGreaterThan(before);
  await expect(button).toBeEnabled();
}
async function expectServerSaved(page) {
  await expect(page.locator('.sync-indicator')).toContainText('서버 저장 완료');
}
async function rows(page) {return page.evaluate(async ownerId=>{
  const {default:Dexie}=await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');const db=new Dexie('epub-builder-projects');await db.open();
  try{return (await db.table('projects').where('ownerId').equals(ownerId).toArray()).map(row=>row.payload);}finally{db.close();}
},approvedUser.id);}
async function wouldWarnOnLeave(page) {
  return page.evaluate(() => {
    const event = new Event('beforeunload',{cancelable:true});
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
}

test('independent profiles reconcile explicit deletion and preserve offline edits as a new-ID recovery',async ({browser,page})=>{
  const cloud=projectCloud();await start(page,cloud);
  await page.locator('#title').fill('shared deletion');await save(page,cloud);
  await expect(page.locator('.sync-indicator')).toContainText('서버 저장 완료');
  expect(await wouldWarnOnLeave(page)).toBe(false);
  const oldId=[...cloud.rows.keys()][0];
  const context=await browser.newContext({ignoreHTTPSErrors:true,baseURL:'http://127.0.0.1:4173'});
  const other=await context.newPage();
  try {
    await start(other,cloud);
    cloud.failSave=true;
    await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>오프라인에서 쓴 본문</p>'));
    await save(page,cloud);
    await expect(page.locator('.sync-indicator')).toContainText('실패·재시도');
    expect(await wouldWarnOnLeave(page)).toBe(true);
    await other.locator('.sb-projects .tab').click();
    await other.getByRole('button',{name:'shared deletion 삭제'}).click();
    await other.getByRole('dialog',{name:'프로젝트 삭제'}).getByRole('button',{name:'삭제'}).click();
    await expect(other.locator('#status')).toContainText('삭제했습니다');
    cloud.failSave=false;
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
    await expect(page.locator('.sync-indicator')).toContainText('서버에서 삭제됨');
    await expect(page.getByRole('button',{name:'shared deletion',exact:true})).toHaveCount(0);
    await expect(page.locator('.draft-recovery')).toBeVisible();
    expect(cloud.deletions.get(oldId).revision).toBe(2);
    await page.getByRole('button',{name:'미저장 원고 복구'}).click();
    await expect(page.locator('#body')).toHaveValue('<p>오프라인에서 쓴 본문</p>');
    await save(page,cloud);
    expect(cloud.rows.size).toBe(1);
    expect([...cloud.rows.keys()][0]).not.toBe(oldId);
  } finally {await context.close();}
});

test('a delayed save and revision-zero retry cannot revive a deleted project',async ({browser,page})=>{
  const cloud=projectCloud();await start(page,cloud);
  await page.locator('#title').fill('race deletion');await save(page,cloud);
  const id=[...cloud.rows.keys()][0];
  const context=await browser.newContext({ignoreHTTPSErrors:true,baseURL:'http://127.0.0.1:4173'});
  const other=await context.newPage();
  try {
    await start(other,cloud);
    let release,started;cloud.saveGate=new Promise(resolve=>release=resolve);
    const entering=new Promise(resolve=>started=resolve);cloud.onSave=started;
    await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>delayed</p>'));
    await page.locator('.draft-save').click();await entering;
    await other.locator('.sb-projects .tab').click();
    await other.getByRole('button',{name:'race deletion 삭제'}).click();
    await other.getByRole('dialog',{name:'프로젝트 삭제'}).getByRole('button',{name:'삭제'}).click();
    await expect(other.locator('#status')).toContainText('삭제했습니다');
    release();await expect(page.locator('.draft-save')).toBeEnabled();
    await expect(page.locator('#status')).toContainText('충돌');
    expect(cloud.rows.has(id)).toBe(false);
    const result=await page.evaluate(async projectId=>fetch('https://htzojicodwueivybovhy.supabase.co/rest/v1/rpc/save_epub_project',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_project_id:projectId,p_expected_revision:0,p_payload:{title:'revive',chapters:[]}})
    }).then(response=>response.status),id);
    expect(result).toBe(409);
    expect(cloud.rows.has(id)).toBe(false);
  } finally {await context.close();}
});

test('server acknowledgement covers only the captured edit and controls the leave warning',async ({page})=>{
  const cloud=projectCloud();await start(page,cloud);
  await page.locator('#title').fill('warning state');await save(page,cloud);
  expect(await wouldWarnOnLeave(page)).toBe(false);
  let release,started;cloud.saveGate=new Promise(resolve=>release=resolve);
  const entering=new Promise(resolve=>started=resolve);cloud.onSave=started;
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>first</p>'));
  await page.locator('.draft-save').click();await entering;
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>newer</p>'));
  let releaseSecond,secondStarted;const secondGate=new Promise(resolve=>releaseSecond=resolve);
  const secondEntering=new Promise(resolve=>secondStarted=resolve);
  cloud.onSave=()=>{if(cloud.saveCount===3){cloud.saveGate=secondGate;secondStarted();}};
  release();await secondEntering;
  expect(await wouldWarnOnLeave(page)).toBe(true);
  expect(await page.locator('.sync-indicator').textContent()).not.toContain('서버 저장 완료');
  releaseSecond();cloud.saveGate=null;
  await expect(page.locator('.draft-save')).toBeEnabled();
  await expectServerSaved(page);
  expect(await wouldWarnOnLeave(page)).toBe(false);
  await expect(page.locator('.sync-indicator')).toContainText('서버 저장 완료');
});

test('lease transfer, expiry, reconnect, and late writes retain local work without resending immutable assets',async ({browser,page})=>{
  const cloud=projectCloud();cloud.leaseEnabled=true;await start(page,cloud);
  await page.locator('#title').fill('lease manuscript');
  await page.locator('#image').setInputFiles({name:'cover.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=','base64')});
  await expect(page.locator('.asset-row')).toHaveCount(1);await save(page,cloud);
  await expectServerSaved(page);
  const projectId=[...cloud.rows.keys()][0];
  const originalLease=structuredClone(cloud.leases.get(projectId));
  const firstUploadCount=cloud.uploadCount,firstUploadBytes=cloud.uploadBytes;
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>text only revision</p>'));
  await save(page,cloud);
  await expectServerSaved(page);
  expect(cloud.uploadCount).toBe(firstUploadCount);
  expect(cloud.uploadBytes).toBe(firstUploadBytes);
  const context=await browser.newContext({ignoreHTTPSErrors:true,baseURL:'http://127.0.0.1:4173'});const other=await context.newPage();
  try {
    // A duplicated tab can inherit sessionStorage from its opener. It must
    // still get a distinct in-memory client ID and become read-only.
    await other.addInitScript(clientId=>sessionStorage.setItem('sitescout-project-editor-client-id',clientId),originalLease.clientId);
    await start(other,cloud);await other.locator('.sb-projects .tab').click();
    await other.getByRole('button',{name:'lease manuscript',exact:true}).click();
    await expect(other.locator('#title')).toHaveValue('lease manuscript');
    await expect(other.getByRole('button',{name:'여기서 편집'})).toBeVisible();
    await expect(other.locator('#title')).toBeDisabled();
    await other.getByRole('button',{name:'여기서 편집'}).click();
    await other.getByRole('dialog',{name:'편집 권한 가져오기'}).getByRole('button',{name:'여기서 편집'}).click();
    await expect(other.locator('#title')).toBeEnabled();
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
    // The previous owner's delayed request must be rejected server-side even
    // if it has not yet received its focus/renewal callback.
    const staleSave=await page.evaluate(async ({projectId,lease,revision})=>fetch('https://htzojicodwueivybovhy.supabase.co/rest/v1/rpc/save_epub_project',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_project_id:projectId,p_expected_revision:revision,p_client_id:lease.clientId,p_generation:lease.generation,p_payload:{title:'late writer',chapters:[]}})
    }).then(response=>response.status),{projectId,lease:originalLease,revision:2});
    expect(staleSave).toBe(423);
    // With two contenders, either tab may reclaim an expired lease. Close the
    // old holder so this specifically tests B's reconnect without a race.
    await page.close();
    const activeLease=cloud.leases.get(projectId);activeLease.expiresAt=Date.now()-1;
    await other.evaluate(()=>window.dispatchEvent(new Event('offline')));
    await expect(other.locator('#title')).toBeDisabled();
    await other.evaluate(()=>window.dispatchEvent(new Event('online')));
    await expect(other.locator('#title')).toHaveValue('lease manuscript',{timeout:30000});
    await expect(other.locator('#title')).toBeEnabled({timeout:30000});
  } finally {await context.close();}
});

test('two tabs reject a stale local revision and deletion preserves an unseen unsynced project',async ({page,context})=>{
  const cloud=projectCloud();await start(page,cloud);
  await page.locator('#title').fill('X');await save(page,cloud);
  const stale=await context.newPage();await start(stale,cloud);await expect(stale.locator('#title')).toHaveValue('X');
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>new A</p>'));await save(page,cloud);
  await stale.evaluate(()=>window.epubMonacoEditor.setValue('<p>stale B</p>'));await save(stale,cloud,{server:false});
  await expect(stale.locator('#status')).toContainText('로컬 저장 충돌');
  expect((await rows(page)).find(row=>row.title==='X').chapters.some(ch=>ch.body.includes('new A'))).toBe(true);
  await stale.locator('.draft-conflict button').filter({hasText:'최신 저장본 확인'}).click();
  await expect(stale.locator('#body')).toHaveValue('<p>new A</p>');
  await page.locator('.new-book').click();await page.locator('#title').fill('Y');cloud.failSave=true;await save(page,cloud);
  cloud.failSave=false;
  await stale.locator('.sb-projects .tab').click();
  await stale.getByRole('button',{name:'X 삭제',exact:true}).click();
  await stale.getByRole('dialog',{name:'프로젝트 삭제'}).getByRole('button',{name:'삭제'}).click();
  await expect(stale.locator('#status')).toContainText('삭제했습니다');
  expect((await rows(page)).map(row=>row.title)).toEqual(['Y']);
});

test('two devices reject stale server revision and keep local copy; rename keeps project identity',async ({browser,page})=>{
  const cloud=projectCloud();await start(page,cloud);await page.locator('#title').fill('cloud X');await save(page,cloud);
  const original=[...cloud.rows.values()][0];
  const context=await browser.newContext({ignoreHTTPSErrors:true,baseURL:'http://127.0.0.1:4173'});const other=await context.newPage();
  try {
    await start(other,cloud);await other.locator('.sb-projects .tab').click();await other.getByRole('button',{name:'cloud X',exact:true}).click();await expect(other.locator('#title')).toHaveValue('cloud X');
    await page.locator('#title').fill('renamed X');await save(page,cloud);
    expect([...cloud.rows.values()][0].project_id).toBe(original.project_id);
    await other.evaluate(()=>window.epubMonacoEditor.setValue('<p>device B draft</p>'));await save(other,cloud);
    await expect(other.locator('#status')).toContainText('서버 저장 충돌');
    expect([...cloud.rows.values()][0].payload.title).toBe('renamed X');
    expect((await rows(other))[0].chapters.some(ch=>ch.body.includes('device B draft'))).toBe(true);
    await other.getByRole('button',{name:'로컬 작업을 복사본으로 저장'}).click();
    await expect.poll(()=>cloud.rows.size).toBe(2);await expect(other.locator('.draft-save')).toBeEnabled();
  }finally{await context.close();}
});

test('DB failure and missing migration keep the local draft and old immutable image references',async ({page})=>{
  const cloud=projectCloud();await start(page,cloud);await page.locator('#title').fill('image versions');
  const upload=async bytes=>page.locator('#image').setInputFiles({name:'same.png',mimeType:'image/png',buffer:Buffer.from(bytes,'base64')});
  await upload('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=');
  // Image decoding is intentionally asynchronous; do not race the first
  // request against a file-change event that has not become an asset yet.
  await expect(page.locator('.asset-row')).toHaveCount(1);await save(page,cloud);
  await expect.poll(()=>cloud.rows.size).toBe(1);
  const old=structuredClone([...cloud.rows.values()][0]);const firstObjects=[...cloud.objects.entries()];
  await upload('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==');
  await expect(page.locator('.asset-row')).toHaveCount(2);
  cloud.failUpload=true;await save(page,cloud,{server:false});await expect(page.locator('#status')).toContainText('업로드 실패');expect([...cloud.rows.values()][0]).toEqual(old);cloud.failUpload=false;
  cloud.failSave=true;await save(page,cloud);await expect(page.locator('#status')).toContainText('서버 동기화 실패');
  expect([...cloud.rows.values()][0]).toEqual(old);for(const [key,value] of firstObjects)expect(cloud.objects.get(key)).toEqual(value);
  cloud.failSave=false;cloud.missingMigration=true;await save(page,cloud);await expect(page.locator('#status')).toContainText('migration');
  expect((await rows(page))[0].assets.length).toBeGreaterThan(old.payload.assets.length);
  cloud.missingMigration=false;await save(page,cloud);await expect(page.locator('#status')).toContainText('서버 동기화됨');
  expect([...cloud.rows.values()][0].revision).toBe(old.revision+1);
});

test('save response for an old project cannot affect a newly created manuscript',async ({page})=>{
  const cloud=projectCloud();await start(page,cloud);await page.locator('#title').fill('old project');
  let release,started;cloud.saveGate=new Promise(resolve=>release=resolve);const first=new Promise(resolve=>started=resolve);cloud.onSave=started;
  await page.locator('.draft-save').click();await first;
  await page.locator('.new-book').click();await page.locator('#title').fill('new project');await page.locator('#author').fill('new author');await page.locator('#add').click();
  await page.evaluate(()=>window.epubMonacoEditor.setValue('<p>새 프로젝트 원문</p>'));release();await expect(page.locator('.draft-save')).toBeEnabled();
  await expect(page.locator('#title')).toHaveValue('new project');await expect(page.locator('#author')).toHaveValue('new author');await expect(page.locator('#body')).toHaveValue('<p>새 프로젝트 원문</p>');
  expect([...cloud.rows.values()][0].payload.title).toBe('old project');
});

test('legacy local drafts without a server revision survive migration and require explicit conflict resolution',async ({page})=>{
  const cloud=projectCloud();await mockApprovedSession(page);await cloud.attach(page);
  await page.route('**/fixture-blank',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>fixture</title>'}));await page.goto('/fixture-blank');
  const payload={title:'legacy',chapters:[{id:'a',title:'A',body:'<p>동기화되지 않은 로컬 원고</p>',xhtml:'<p>동기화되지 않은 로컬 원고</p>',fileName:'a.xhtml'}],selectedChapterId:'a',css:'',assets:[],updatedAt:'2026-01-01T00:00:00Z'};
  await page.evaluate(async({owner,payload})=>{
    const {default:Dexie}=await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');const db=new Dexie('epub-builder-projects');db.version(3).stores({projects:'[ownerId+title],ownerId,updatedAt',assets:'[ownerId+title+name],[ownerId+title],ownerId',workspace:'ownerId',recoveries:'[ownerId+projectKey],ownerId,updatedAt',recoveryAssets:'[ownerId+projectKey+name],[ownerId+projectKey]'});
    await db.table('projects').put({ownerId:owner,title:payload.title,payload,updatedAt:payload.updatedAt});await db.table('workspace').put({ownerId:owner,title:payload.title});db.close();
  },{owner:approvedUser.id,payload});
  const id='10000000-0000-4000-8000-000000000009';cloud.rows.set(id,{project_id:id,revision:4,payload:{...payload,projectId:id,serverRevision:4,updatedAt:'2026-10-09T00:00:00Z',chapters:[{...payload.chapters[0],body:'<p>서버 원고</p>',xhtml:'<p>서버 원고</p>'}]}});
  await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.epubMonacoEditor);
  await expect(page.locator('#body')).toHaveValue('<p>동기화되지 않은 로컬 원고</p>');
  expect((await rows(page))[0].syncPending).toBe(true);
  await save(page,cloud);await expect(page.locator('#status')).toContainText('서버 저장 충돌');expect(cloud.rows.get(id).revision).toBe(4);
});


test('reversed device save responses retain both immutable uploads and commit only the winning revision',async ({page,browser})=>{
  const cloud=projectCloud();await start(page,cloud);await page.locator('#title').fill('upload race');await save(page,cloud);
  const context=await browser.newContext({ignoreHTTPSErrors:true,baseURL:'http://127.0.0.1:4173'});const other=await context.newPage();
  try {
    await start(other,cloud);await other.locator('.sb-projects .tab').click();await other.getByRole('button',{name:'upload race',exact:true}).click();
    await expect(other.locator('#status')).toContainText('임시저장본을 불러왔습니다');
    const a=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=','base64');
    const b=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==','base64');
    await page.locator('#image').setInputFiles({name:'same.png',mimeType:'image/png',buffer:a});
    await other.locator('#image').setInputFiles({name:'same.png',mimeType:'image/png',buffer:b});
    // File input dispatch does not await the app's asynchronous image decode.
    // Establish both assets before testing the ordering of cloud save requests.
    await expect(page.locator('.asset-row')).toHaveCount(1);
    await expect(other.locator('.asset-row')).toHaveCount(1);
    await expect(page.locator('#image')).toHaveValue('');
    await expect(other.locator('#image')).toHaveValue('');
    let release,started;const hold=new Promise(resolve=>release=resolve);const first=new Promise(resolve=>started=resolve);let calls=0;
    cloud.onSave=()=>{cloud.saveGate=++calls===1?hold:null;started();};
    await page.locator('.draft-save').click();await first;
    await save(other,cloud);await expect(other.locator('#status')).toContainText('서버 동기화됨');
    const winner=structuredClone([...cloud.rows.values()][0]);expect(winner.revision).toBe(2);
    release();await expect(page.locator('.draft-save')).toBeEnabled();await expect(page.locator('#status')).toContainText('서버 저장 충돌');
    expect([...cloud.rows.values()][0]).toEqual(winner);expect(cloud.objects.size).toBe(2);
    expect(cloud.objects.get('epub-assets/'+winner.payload.assets[0].storagePath)).toEqual(b);
    expect([...cloud.objects.values()].some(bytes=>bytes.equals(a))).toBe(true);
    await other.reload();await expect(other.locator('#title')).toHaveValue('upload race');
    const assets=await other.evaluate(async owner=>{const {default:Dexie}=await import('https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm');const db=new Dexie('epub-builder-projects');await db.open();try{return await db.table('assets').where('[ownerId+title]').equals([owner,'upload race']).count();}finally{db.close();}},approvedUser.id);
    expect(assets).toBe(1);
  }finally{await context.close();}
});

import { test, expect } from '@playwright/test';

const api = 'https://htzojicodwueivybovhy.supabase.co';
const userId = 'eb205327-3994-46f0-b392-58c435c7e644';
const memberId = '11111111-1111-4111-8111-111111111111';
async function authFixture(page, { status = 'approved', role = 'user', signedIn = false } = {}) {
  const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'jungho@users.sitescout.local',
    app_metadata: {}, user_metadata: { username: 'jungho', role: 'admin' }, created_at: '2026-09-29T00:00:00Z' };
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: userId, exp: expires, role: 'authenticated' })).toString('base64url')}.fixture`;
  const session = { access_token: token, refresh_token: 'fixture-refresh', token_type: 'bearer', expires_in: 3600, expires_at: expires, user };
  const state = { status, role, signup: null, decisions: [], issued: [], createError: null, members: [
    { user_id: memberId, email: 'new@example.com', display_name: '<script>unsafe</script>', created_at: '2026-10-08T00:00:00Z' },
  ] };
  if (signedIn) await page.addInitScript(session => {
    if (!sessionStorage.getItem('fixture-seeded')) {
      localStorage.setItem('sb-htzojicodwueivybovhy-auth-token', JSON.stringify(session));
      sessionStorage.setItem('fixture-seeded', 'yes');
    }
  }, session);
  await page.route(`${api}/**`, async route => {
    const url = new URL(route.request().url());
    let body; let code = 200;
    if (url.pathname.endsWith('/token')) body = session;
    else if (url.pathname.endsWith('/user')) body = user;
    else if (url.pathname.endsWith('/signup')) { state.signup = route.request().postDataJSON(); body = { ...session }; }
    else if (url.pathname.endsWith('/logout')) { body = {}; }
    else if (url.pathname.endsWith('/user_profiles')) body = { user_id: userId, username: 'jungho', display_name: 'jungho', role: state.role, status: state.status };
    else if (url.pathname.endsWith('/account-admin')) {
      const request = route.request().postDataJSON();
      if (state.role !== 'admin' || state.status !== 'approved') { code = 403; body = { error: '관리자만 접근할 수 있습니다.' }; }
      else if (request.action === 'create') {
        if (state.createError) { code = 409; body = { error: state.createError }; }
        else { state.issued.push(request); body = { username: request.username, displayName: request.displayName, role: 'user', status: 'approved' }; }
      }
      else if (request.action === 'list-pending') body = { members: state.members };
      else { state.decisions.push(request); state.members = state.members.filter(member => member.user_id !== request.userId); body = { member: { user_id: request.userId, status: request.status } }; }
    } else { body = []; }
    await route.fulfill({ status: code, contentType: 'application/json', body: JSON.stringify(body) });
  });
  return state;
}

test('signup validates confirmation and sends only Auth fields, then stays pending', async ({ page }) => {
  const state = await authFixture(page);
  await page.goto('/signup/');
  await page.getByLabel('이메일', { exact: true }).fill('new@example.com');
  await page.getByLabel('이름 또는 닉네임').fill('새 회원');
  await page.getByLabel('비밀번호', { exact: true }).fill('valid-password');
  await page.getByLabel('비밀번호 확인').fill('mismatch-password');
  await page.getByRole('button', { name: '회원가입', exact: true }).click();
  expect(state.signup).toBeNull();
  await page.getByLabel('비밀번호 확인').fill('valid-password');
  await page.getByRole('button', { name: '회원가입', exact: true }).click();
  await expect(page.locator('.message')).toContainText('관리자 승인 대기 중입니다.');
  expect(state.signup.data).toEqual({ display_name: '새 회원' });
  expect(state.signup).not.toHaveProperty('passwordConfirm');
  expect(state.signup).not.toHaveProperty('status');
  expect(await page.evaluate(() => localStorage.getItem('sb-htzojicodwueivybovhy-auth-token'))).toBeNull();
  await expect(page).toHaveURL(/\/signup\/$/);
  await page.getByRole('link', { name: '이미 계정이 있나요? 로그인' }).click();
  await expect(page).toHaveURL(/\/login\/$/);
});
for (const [status, message] of [['pending', '관리자 승인 대기 중입니다.'], ['rejected', '가입 승인이 되지 않았습니다.']]) {
  test(`${status} login is blocked and session cleared`, async ({ page }) => {
    await authFixture(page, { status });
    await page.goto('/login/');
    await page.getByLabel('이메일 또는 아이디').fill('jungho');
    await page.getByLabel('비밀번호', { exact: true }).fill('valid-password');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await expect(page.locator('.message')).toHaveText(message);
    expect(await page.evaluate(() => localStorage.getItem('sb-htzojicodwueivybovhy-auth-token'))).toBeNull();
    await expect(page).toHaveURL(/\/login\/$/);
  });
}
test('admin approval/rejection and reload use DB role; names render as text', async ({ page }) => {
  const state = await authFixture(page, { role: 'admin', signedIn: true });
  state.members.push({ user_id: '22222222-2222-4222-8222-222222222222', email: 'reject@example.com', display_name: '거절 대상', created_at: '2026-10-08T00:00:00Z' });
  await page.goto('/admin/');
  await expect(page.locator('#pendingMembers tr')).toHaveCount(2);
  await expect(page.locator('#pendingMembers')).toContainText('<script>unsafe</script>');
  await expect(page.locator('#pendingMembers script')).toHaveCount(0);
  await page.locator('#pendingMembers tr').first().getByRole('button', { name: '승인', exact: true }).click();
  await expect(page.locator('#pendingMembers tr')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('#pendingMembers tr')).toHaveCount(1);
  await page.getByRole('button', { name: '거절', exact: true }).click();
  await expect(page.locator('#emptyMembers')).toBeVisible();
  expect(state.decisions.map(item => item.status)).toEqual(['approved', 'rejected']);
  state.role = 'user';
  await page.reload();
  await expect(page.locator('.admin-card > .message')).toHaveText('관리자만 접근할 수 있습니다.');
  await expect(page.locator('#memberManagement')).toBeHidden();
});
test('normal user cannot open admin page despite spoofed metadata', async ({ page }) => {
  await authFixture(page, { signedIn: true });
  await page.goto('/admin/');
  await expect(page.locator('.admin-card > .message')).toHaveText('관리자만 접근할 수 있습니다.');
  await expect(page.locator('#memberManagement')).toBeHidden();
});
test('direct editor entry rejects a pending session', async ({ page }) => {
  await authFixture(page, { status: 'pending', signedIn: true });
  await page.goto('/');
  await expect(page).toHaveURL(/\/login\/\?reason=pending$/);
  await expect(page.locator('.message')).toHaveText('관리자 승인 대기 중입니다.');
});
test('approved username login and reload pass the editor access gate', async ({ page }) => {
  await authFixture(page, { role: 'admin' });
  await page.goto('/login/');
  await page.getByLabel('이메일 또는 아이디').fill('jungho');
  await page.getByLabel('비밀번호', { exact: true }).fill('valid-password');
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(page.locator('.app')).toBeVisible({ timeout: 30000 });
  await page.reload();
  await expect(page.locator('.app')).toBeVisible({ timeout: 30000 });
  expect(await page.locator('.app').evaluate(node => node.inert)).toBe(false);
});


test('admin issues an account without mail and clears the password; duplicates and revoked access are handled', async ({ page }) => {
  const state = await authFixture(page, { role: 'admin', signedIn: true });
  await page.goto('/admin/');
  const form = page.locator('#createAccountForm');
  await expect(form).toBeVisible({ timeout: 15000 });
  await form.getByLabel('아이디', { exact: true }).fill('reader01');
  await form.getByLabel('이름 또는 닉네임').fill('독자');
  await form.getByLabel('초기 비밀번호').fill('fixture-password');
  await form.getByRole('button', { name: '계정 발급' }).click();
  await expect(page.locator('#createAccountMessage')).toContainText('바로 로그인할 수 있습니다.');
  expect(state.issued).toEqual([{ action: 'create', username: 'reader01', displayName: '독자', password: 'fixture-password' }]);
  expect(state.signup).toBeNull();
  await expect(form.getByLabel('초기 비밀번호')).toHaveValue('');
  await expect(page.locator('#pendingMembers tr')).toHaveCount(1);
  state.createError = '이미 사용 중인 아이디입니다.';
  await form.getByLabel('아이디', { exact: true }).fill('reader01');
  await form.getByLabel('이름 또는 닉네임').fill('독자');
  await form.getByLabel('초기 비밀번호').fill('fixture-password');
  await form.getByRole('button', { name: '계정 발급' }).click();
  await expect(page.locator('#createAccountMessage')).toHaveText(state.createError);
  await expect(form.getByLabel('초기 비밀번호')).toHaveValue('');
  expect(state.issued).toHaveLength(1);
  state.role = 'user';
  await form.getByLabel('초기 비밀번호').fill('fixture-password');
  await form.getByRole('button', { name: '계정 발급' }).click();
  await expect(form).toBeHidden();
  expect(state.issued).toHaveLength(1);
});

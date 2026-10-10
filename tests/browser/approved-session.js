import {cacheCdn} from './cdn-cache.js';
const api = 'https://htzojicodwueivybovhy.supabase.co';
export const approvedUser = {
  id:'00000000-0000-4000-8000-000000000001', email:'fixture@example.test',
  app_metadata:{}, user_metadata:{ username:'fixture' }, is_anonymous:false,
};

// Browser UI suites enter through the same approved-session gate as production.
export async function mockApprovedSession(page, { role = 'admin', user = approvedUser } = {}) {
  page.on('pageerror',error=>console.log('BROWSER ERROR:',error.message));
  page.on('requestfailed',request=>console.log('REQUEST FAILED:',request.url(),request.failure()?.errorText));
  await cacheCdn(page);
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const session = {
    access_token:`header.${Buffer.from(JSON.stringify({sub:user.id,exp:expiresAt})).toString('base64url')}.signature`,
    refresh_token:'approved-browser-fixture', expires_at:expiresAt, expires_in:3600,
    token_type:'bearer', user,
  };
  await page.addInitScript(value => {
    if (window !== top) return;
    localStorage.setItem('sb-htzojicodwueivybovhy-auth-token', JSON.stringify(value));
  }, session);
  await page.route(`${api}/**`, async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/save_epub_project')) return route.fulfill({json:{revision:(route.request().postDataJSON().p_expected_revision || 0)+1}});
    const body = path.endsWith('/user') ? user
      : path.endsWith('/user_profiles') ? { user_id:user.id, username:user.email.split('@')[0], display_name:user.email.split('@')[0], role, status:'approved' }
        : [];
    await route.fulfill({contentType:'application/json', body:JSON.stringify(body)});
  });
}

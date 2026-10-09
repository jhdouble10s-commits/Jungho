const api = 'https://htzojicodwueivybovhy.supabase.co';
export const approvedUser = {
  id:'eb205327-3994-46f0-b392-58c435c7e644', email:'jungho@users.sitescout.local',
  app_metadata:{}, user_metadata:{ username:'jungho' }, is_anonymous:false,
};

// Browser UI suites enter through the same approved-session gate as production.
export async function mockApprovedSession(page, { role = 'admin', user = approvedUser } = {}) {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const session = {
    access_token:`header.${Buffer.from(JSON.stringify({sub:user.id,exp:expiresAt})).toString('base64url')}.signature`,
    refresh_token:'approved-browser-fixture', expires_at:expiresAt, expires_in:3600,
    token_type:'bearer', user,
  };
  await page.addInitScript(value => {
    localStorage.setItem('sb-htzojicodwueivybovhy-auth-token', JSON.stringify(value));
  }, session);
  await page.route(`${api}/**`, async route => {
    const path = new URL(route.request().url()).pathname;
    const body = path.endsWith('/user') ? user
      : path.endsWith('/user_profiles') ? { user_id:user.id, username:user.email.split('@')[0], display_name:user.email.split('@')[0], role, status:'approved' }
        : [];
    await route.fulfill({contentType:'application/json', body:JSON.stringify(body)});
  });
}

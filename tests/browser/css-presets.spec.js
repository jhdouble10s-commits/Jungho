import { test, expect } from '@playwright/test';

test('empty CSS preset name updates the last selected custom preset', async ({ page }) => {
  const user = { id:'css-preset-user', email:'preset@users.sitescout.local', user_metadata:{ username:'preset' } };
  await page.route('**/htzojicodwueivybovhy.supabase.co/**', route => route.fulfill({status:503,body:'offline fixture'}));
  await page.route('**/auth/v1/token?grant_type=password', route => route.fulfill({json:{
    access_token:'test-access-token', refresh_token:'test-refresh-token', token_type:'bearer', expires_in:3600,
    user,
  }}));
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => Boolean(window.epubCssMonacoEditor), null, {timeout:30000});

  await page.locator('.account-button').click();
  await page.goto('/login/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('#loginForm [name=username]').fill('preset');
  await page.locator('#loginForm [name=password]').fill('password');
  await page.locator('#loginForm').getByRole('button',{name:'로그인',exact:true}).click();
  await expect(page.locator('.account-button')).toContainText('preset');

  await page.locator('.left-tab[data-panel="cssPanel"]').click();
  await page.evaluate(() => window.epubCssMonacoEditor.setValue('p { color: red; }'));
  await page.locator('#cssPresetName').fill('내 프리셋');
  page.on('dialog', dialog => dialog.accept());
  await page.locator('.css-preset-save').click();
  await expect(page.locator('#cssPreset')).toHaveValue(/^user-/);

  await page.evaluate(() => window.epubCssMonacoEditor.setValue('p { color: blue; }'));
  await expect(page.locator('#cssPreset')).toHaveValue('custom');
  await expect(page.locator('.css-preset-save')).toHaveText('현재 프리셋 저장');
  await page.locator('.css-preset-save').click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('epub-builder-css-presets-v2:css-preset-user'))[0].css)).toBe('p { color: blue; }');
});

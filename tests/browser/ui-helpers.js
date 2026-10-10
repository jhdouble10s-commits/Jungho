export async function openSettings(page) {
  await page.locator('.settings-button').click();
}
export async function openApiSettings(page) {
  await openSettings(page);
  await page.locator('.app-settings-dialog .api-settings-button').click();
}
export async function setFakeGeminiKey(page) {
  await openApiSettings(page);
  await page.locator('input[name="apiKey"]').fill('synthetic-test-key');
  await page.locator('.gemini-settings-form button[type="submit"]').click();
}
export async function setTheme(page, theme) {
  await openSettings(page);
  await page.getByRole('switch', {name:'다크 테마'}).setChecked(theme === 'dark');
  await page.keyboard.press('Escape');
}

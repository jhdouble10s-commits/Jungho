// Catch both module-loading failures and initialization failures before revealing the app.
try {
  const { initializeApp } = await import('./ui.js?v=20261008-startup');
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  }
  await initializeApp();
} catch (error) {
  console.error('편집기 초기화 실패:', error);
  const app = document.querySelector('.app');
  if (app) { app.inert = true; app.style.visibility = 'hidden'; }
  const message = document.querySelector('#accessMessage');
  if (message) {
    message.setAttribute('role', 'alert');
    const retry = document.createElement('a');
    retry.href = location.href;
    retry.textContent = '다시 시도';
    message.replaceChildren('편집기를 불러오지 못했습니다. ', retry);
  }
}

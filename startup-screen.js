// Presentation only: access checks and editor readiness remain the authority.
export function showStartupPhase(phase) {
  const screen = document.querySelector('#accessMessage');
  if (!screen || (screen.dataset.phase === 'error' && phase !== 'error')) return;
  screen.dataset.phase = phase;
  const failed = phase === 'error';
  screen.querySelector('.startup-status').setAttribute('role', failed ? 'alert' : 'status');
  screen.querySelector('.startup-title').textContent = failed
    ? '편집기를 불러오지 못했습니다.' : '작업실을 열고 있어요';
  screen.querySelector('.startup-description').textContent = failed
    ? '연결 상태를 확인한 뒤 다시 시도해 주세요.'
    : '작업 공간을 준비하고 있습니다. 잠시만 기다려 주세요.';
  const retry = screen.querySelector('.startup-retry');
  retry.hidden = !failed;
  if (failed) retry.href = location.href;
}

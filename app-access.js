import { client } from './auth-client.js';
import { readAccess } from './auth-access.js';
import { showStartupPhase } from './startup-screen.js';

let revision = 0;
let activeUserId = null;
let accessVerified = false;
let checkInFlight = null;
export const isAccessVerified = () => accessVerified;
const appNode = () => document.querySelector('.app');
const lock = () => {
  const app = appNode();
  if (app) { app.inert = true; app.style.visibility = 'hidden'; }
  const screen = document.querySelector('#accessMessage');
  if (screen) screen.hidden = false;
};

export function markAppUiReady() {
  document.documentElement.dataset.appUiReady = 'true';
  const app = appNode();
  if (!app || !activeUserId || !accessVerified) return;
  app.inert = false;
  app.style.removeProperty('visibility');
  const screen = document.querySelector('#accessMessage');
  if (screen) screen.hidden = true;
}

async function performAccessCheck() {
  const targetRevision = ++revision;
  accessVerified = false;
  // A focus recheck may be triggered when leaving the preview iframe. Keep
  // in-memory editing visible while the request is pending; server actions
  // remain gated by accessVerified and a failed check still locks the app.
  if (!activeUserId) lock();
  try {
    const access = await readAccess(client);
    if (targetRevision !== revision) return null;
    if (activeUserId && activeUserId !== access.user.id) { lock(); window.dispatchEvent(new Event('sitescout-identity-invalidated')); location.reload(); return null; }
    activeUserId = access.user.id;
    accessVerified = true;
    showStartupPhase('editor');
    if (document.documentElement.dataset.appUiReady === 'true') markAppUiReady();
    return access;
  } catch (error) {
    if (targetRevision !== revision) return null;
    if (error.code === 'stale') { queueMicrotask(() => { checkInFlight = null; void checkAccess(); }); return null; }
    lock();
    if (error.code === 'unavailable') {
      showStartupPhase('error');
      if (activeUserId && targetRevision === revision)
        document.querySelector('#accessMessage .startup-description').textContent = '미저장 원고는 현재 탭에만 남아 있습니다. 탭을 닫지 말고 연결을 다시 시도해 주세요.';
      if (targetRevision !== revision) return null;
      const retry = document.querySelector('#accessMessage .startup-retry');
      if (retry && activeUserId) {
        retry.onclick = (event) => {
          event.preventDefault();
          document.querySelector('#accessMessage').dataset.phase = 'access';
          showStartupPhase('access');
          void checkAccess();
        };
      }
      return null;
    }
    window.dispatchEvent(new Event('sitescout-identity-invalidated'));
    location.replace(`login/?reason=${encodeURIComponent(error.code || 'unavailable')}`);
    return null;
  }
}

function checkAccess() {
  if (!checkInFlight) {
    const task = performAccessCheck();
    checkInFlight = task;
    void task.finally(() => { if (checkInFlight === task) checkInFlight = null; });
  }
  return checkInFlight;
}

export const appAccess = checkAccess();
export const verifyAccess = checkAccess;
client.auth.onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION') return;
  const identityChanged = event === 'SIGNED_OUT' || (activeUserId && session?.user?.id !== activeUserId);
  if (identityChanged) {
    revision++;
    accessVerified = false;
    lock();
    window.dispatchEvent(new Event('sitescout-identity-invalidated'));
    checkInFlight = null;
  }
  // Do not call SDK methods while the Auth event callback holds its session lock.
  setTimeout(() => { void appAccess.then(checkAccess); }, 0);
});
window.addEventListener('pageshow', (event) => { if (event.persisted) void appAccess.then(checkAccess); });
window.addEventListener('focus', () => { void appAccess.then(checkAccess); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void appAccess.then(checkAccess); });

import { client } from './auth-client.js';
import { readAccess } from './auth-access.js';
import { showStartupPhase } from './startup-screen.js';

let revision = 0;
let activeUserId = null;
const appNode = () => document.querySelector('.app');
const lock = () => { const app = appNode(); if (app) { app.inert = true; app.style.visibility = 'hidden'; } };

export function markAppUiReady() {
  document.documentElement.dataset.appUiReady = 'true';
  const app = appNode();
  if (!app || !activeUserId) return;
  app.inert = false;
  app.style.removeProperty('visibility');
  document.querySelector('#accessMessage')?.remove();
}

async function checkAccess() {
  const targetRevision = ++revision;
  try {
    const access = await readAccess(client);
    if (targetRevision !== revision) return null;
    if (activeUserId && activeUserId !== access.user.id) { location.reload(); return null; }
    activeUserId = access.user.id;
    showStartupPhase('editor');
    if (document.documentElement.dataset.appUiReady === 'true') markAppUiReady();
    return access;
  } catch (error) {
    if (targetRevision !== revision) return null;
    if (error.code === 'stale') return checkAccess();
    lock();
    location.replace(`login/?reason=${encodeURIComponent(error.code || 'unavailable')}`);
    return null;
  }
}

export const appAccess = checkAccess();
client.auth.onAuthStateChange((event) => {
  if (event === 'INITIAL_SESSION') return;
  // Do not call SDK methods while the Auth event callback holds its session lock.
  lock();
  setTimeout(() => { void appAccess.then(checkAccess); }, 0);
});
window.addEventListener('pageshow', (event) => { if (event.persisted) { lock(); void appAccess.then(checkAccess); } });
window.addEventListener('focus', () => { void appAccess.then(checkAccess); });

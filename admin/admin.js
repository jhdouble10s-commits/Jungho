import { client } from '../auth-client.js';
import { readAccess, AccessError } from '../auth-access.js';

const panel = document.querySelector('#memberManagement');
const list = document.querySelector('#pendingMembers');
const empty = document.querySelector('#emptyMembers');
const message = document.querySelector('.message');
const refresh = document.querySelector('#refreshMembers');
const createForm = document.querySelector('#createAccountForm');
const createMessage = document.querySelector('#createAccountMessage');
const createButton = createForm.querySelector('button[type=submit]');
let revision = 0;
const showMessage = (text, error = false) => {
  message.textContent = text; message.classList.toggle('error', error);
};
async function requireAdmin() {
  const access = await readAccess(client);
  if (access.profile.role !== 'admin') throw new AccessError('admin');
  return access.user.id;
}
async function invoke(body) {
  const { data, error } = await client.functions.invoke('account-admin', { body });
  if (error) {
    const detail = await error.context?.json().catch(() => null);
    throw new Error(detail?.error || error.message || '회원 관리 요청에 실패했습니다.');
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
function renderMembers(members) {
  const incoming = new Set(members.map(member => member.user_id));
  for (const row of [...list.rows]) if (!incoming.has(row.dataset.userId)) row.remove();
  for (const member of members) {
    let row = [...list.rows].find(node => node.dataset.userId === member.user_id);
    if (!row) {
      row = list.insertRow(); row.dataset.userId = member.user_id;
      for (let i = 0; i < 4; i++) row.insertCell();
      row.cells[3].className = 'member-actions';
      for (const [status, label] of [['approved', '승인'], ['rejected', '거절']]) {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = label; button.dataset.status = status;
        row.cells[3].append(button);
      }
    }
    row.cells[0].textContent = member.email || '—';
    row.cells[1].textContent = member.display_name || member.username || '—';
    row.cells[2].textContent = new Date(member.created_at).toLocaleString('ko-KR');
  }
  empty.hidden = list.rows.length !== 0;
}
async function loadMembers() {
  const targetRevision = ++revision;
  refresh.disabled = true;
  try {
    const targetId = await requireAdmin();
    const data = await invoke({ action: 'list-pending' });
    if (targetRevision !== revision || targetId !== await requireAdmin()) return;
    renderMembers(data.members); panel.hidden = false; showMessage('승인 대기 회원 목록입니다.');
  } catch (error) {
    if (targetRevision !== revision) return;
    panel.hidden = true; showMessage(error.message, true);
  } finally { if (targetRevision === revision) refresh.disabled = false; }
}
list.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-status]');
  if (!button || button.disabled) return;
  const row = button.closest('tr');
  const targetUserId = row.dataset.userId;
  const targetRevision = revision;
  row.querySelectorAll('button').forEach(node => { node.disabled = true; });
  try {
    const actorId = await requireAdmin();
    await invoke({ action: 'set-status', userId: targetUserId, status: button.dataset.status });
    if (targetRevision !== revision || actorId !== await requireAdmin()) return;
    row.remove(); empty.hidden = list.rows.length !== 0;
    showMessage(button.dataset.status === 'approved' ? '가입을 승인했습니다.' : '가입을 거절했습니다.');
  } catch (error) {
    if (targetRevision === revision) {
      showMessage(error.message, true);
      row.querySelectorAll('button').forEach(node => { node.disabled = false; });
      if (error instanceof AccessError) panel.hidden = true;
    }
  }
});
refresh.addEventListener('click', loadMembers);
createForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (createButton.disabled) return;
  createButton.disabled = true;
  const targetRevision = revision;
  createMessage.classList.remove('error');
  createMessage.textContent = '계정을 발급하고 있습니다…';
  try {
    const actorId = await requireAdmin();
    const fields = new FormData(createForm);
    const data = await invoke({ action: 'create', username: fields.get('username'),
      displayName: fields.get('displayName'), password: fields.get('password') });
    if (targetRevision !== revision || actorId !== await requireAdmin()) return;
    createForm.reset();
    createMessage.textContent = `아이디 ${data.username}을(를) 발급했습니다. 바로 로그인할 수 있습니다.`;
  } catch (error) {
    if (targetRevision === revision) {
      createMessage.textContent = error.message;
      createMessage.classList.add('error');
      if (error instanceof AccessError) panel.hidden = true;
    }
  } finally {
    createForm.elements.password.value = '';
    createButton.disabled = false;
  }
});
client.auth.onAuthStateChange(event => {
  if (event === 'INITIAL_SESSION') return;
  ++revision; panel.hidden = true;
  createForm.reset(); createMessage.textContent = '';
  setTimeout(() => { void loadMembers(); }, 0);
});
window.addEventListener('pageshow', event => { if (event.persisted) void loadMembers(); });
window.addEventListener('focus', () => { void loadMembers(); });
void loadMembers();

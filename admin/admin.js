import { createTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from 'https://cdn.jsdelivr.net/npm/@tanstack/table-core@8.21.3/+esm';
import { createFocusTrap } from 'https://cdn.jsdelivr.net/npm/focus-trap@8.2.3/+esm';
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
const timeZone = 'Asia/Seoul';
const date = value => value ? new Date(value).toLocaleString('ko-KR', {timeZone}) : '로그인 기록 없음';
const day = value => new Intl.DateTimeFormat('en-CA', {timeZone}).format(new Date(value));
const table = createTable({
  data:[], columns:['display_name','email','role','created_at','last_sign_in_at','status'].map(id => ({accessorKey:id, id, filterFn:'equalsString', sortingFn:'text'})),
  getRowId:row => row.user_id,
  getCoreRowModel:getCoreRowModel(), getFilteredRowModel:getFilteredRowModel(),
  getSortedRowModel:getSortedRowModel(), getPaginationRowModel:getPaginationRowModel(),
  globalFilterFn:(row, columnId, value) => ['display_name','username','email'].some(key => String(row.original[key] || '').toLowerCase().includes(value.toLowerCase())),
  onStateChange:updater => {
    table.setOptions(options => ({...options, state:typeof updater === 'function' ? updater(options.state) : updater}));
    renderMembers();
  },
});
table.setOptions(options => ({...options, state:{...table.initialState, pagination:{pageIndex:0,pageSize:10}, sorting:[{id:'created_at',desc:true}]}}));
const statusLabels = {pending:'승인 대기',approved:'승인됨',rejected:'거절됨'};
function renderMembers() {
  const members = table.getRowModel().rows.map(row => row.original);
  const incoming = new Set(members.map(member => member.user_id));
  for (const row of [...list.rows]) if (!incoming.has(row.dataset.userId)) row.remove();
  for (const member of members) {
    let row = [...list.rows].find(node => node.dataset.userId === member.user_id);
    if (!row) {
      row = list.insertRow(); row.dataset.userId = member.user_id;
      for (let i = 0; i < 7; i++) row.insertCell();
      row.cells[6].className = 'member-actions';
      for (const [status,label] of [['approved','승인'],['rejected','거절'],['detail','상세']]) {
        const button = document.createElement('button'); button.type='button'; button.textContent=label;
        if (status === 'detail') button.dataset.detail = 'true'; else button.dataset.status = status;
        row.cells[6].append(button);
      }
    }
    row.cells[0].textContent = member.display_name || member.username || '—';
    row.cells[1].textContent = member.email || '—';
    row.cells[2].textContent = member.role === 'admin' ? '관리자' : '일반 회원';
    row.cells[3].textContent = date(member.created_at);
    row.cells[4].textContent = date(member.last_sign_in_at);
    row.cells[5].textContent = statusLabels[member.status] || '확인 필요';
    row.cells[5].dataset.status = member.status;
    row.querySelectorAll('[data-status]').forEach(button => { if (button.tagName === 'BUTTON') button.hidden = member.status !== 'pending' || member.role === 'admin'; });
    list.append(row);
  }
  empty.hidden = members.length !== 0;
  document.querySelector('#memberCount').textContent = `${table.getFilteredRowModel().rows.length}명`;
  document.querySelector('#pageSummary').textContent = `${table.getState().pagination.pageIndex+1} / ${Math.max(1,table.getPageCount())}`;
  document.querySelector('#previousPage').disabled = !table.getCanPreviousPage();
  document.querySelector('#nextPage').disabled = !table.getCanNextPage();
}
function updateMembers(members) {
  table.setOptions(options => ({...options, data:members}));
  table.setPageIndex(0);
  const today = day(Date.now()), week = Date.now()-7*86400000;
  const counts = {total:members.length, today:members.filter(m => m.last_sign_in_at && day(m.last_sign_in_at) === today).length,
    active:members.filter(m => m.last_sign_in_at && Date.parse(m.last_sign_in_at) >= week).length,
    new:members.filter(m => Date.parse(m.created_at) >= week).length};
  for (const [key,value] of Object.entries(counts)) document.querySelector(`[data-kpi="${key}"]`).textContent = value;
  renderMembers();
}
document.querySelector('#memberSearch').addEventListener('input', event => { table.setGlobalFilter(event.target.value.trim()); table.setPageIndex(0); });
document.querySelector('#roleFilter').addEventListener('change', event => { table.getColumn('role').setFilterValue(event.target.value || undefined); table.setPageIndex(0); });
document.querySelector('#memberSort').addEventListener('change', event => { const [id,direction]=event.target.value.split(':'); table.setSorting([{id,desc:direction==='desc'}]); });
document.querySelector('#previousPage').addEventListener('click', () => table.previousPage());
document.querySelector('#nextPage').addEventListener('click', () => table.nextPage());
const detail = document.querySelector('#memberDetail');
const detailTrap = createFocusTrap(detail,{escapeDeactivates:false,allowOutsideClick:true,returnFocusOnDeactivate:false});
detail.querySelector('[data-close]').addEventListener('click', () => detail.close());
detail.addEventListener('close', () => detailTrap.deactivate());
list.addEventListener('click', event => {
  const button=event.target.closest('[data-detail]'); if (!button) return;
  const member=table.options.data.find(m => m.user_id === button.closest('tr').dataset.userId); if (!member) return;
  const fields=[['이름',member.display_name || member.username],['이메일',member.email],['역할',member.role],['상태',statusLabels[member.status]],['가입일',date(member.created_at)],['마지막 로그인',date(member.last_sign_in_at)],['오늘 로그인',member.last_sign_in_at && day(member.last_sign_in_at) === day(Date.now()) ? '예' : '아니오']];
  const nodes=fields.flatMap(([label,value]) => { const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value || '—';return [dt,dd]; });
  detail.querySelector('dl').replaceChildren(...nodes); detail.showModal(); detailTrap.activate();
});
async function loadMembers() {
  const targetRevision = ++revision;
  refresh.disabled = true;
  try {
    const targetId = await requireAdmin();
    const data = await invoke({ action: 'list-members' });
    if (targetRevision !== revision || targetId !== await requireAdmin()) return;
    updateMembers(data.members); panel.hidden = false; showMessage('회원 정보가 업데이트되었습니다. · Asia/Seoul');
  } catch (error) {
    if (targetRevision !== revision) return;
    panel.hidden = true; detail.close(); showMessage(error.message, true);
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
    row.querySelectorAll('button').forEach(node => { node.disabled = false; });
    updateMembers(table.options.data.map(member => member.user_id === targetUserId ? {...member,status:button.dataset.status} : member));
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
    void loadMembers();
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
  ++revision; panel.hidden = true; detail.close();
  createForm.reset(); createMessage.textContent = '';
  setTimeout(() => { void loadMembers(); }, 0);
});
window.addEventListener('pageshow', event => { if (event.persisted) void loadMembers(); });
window.addEventListener('focus', () => { void loadMembers(); });
void loadMembers();

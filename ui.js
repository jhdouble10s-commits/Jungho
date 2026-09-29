const uiStyle = document.createElement('style');
uiStyle.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');
  :root { --bg:#050505; --surface:#0e0e0f; --surface-2:#171719; --text:#f7f7f5; --sub:#a3a3a8; --line:#2a2a2d; --accent:#FF5100; --accent-soft:#40200f; }
  html[data-theme="light"] { --bg:#f1f1f1; --surface:#fff; --surface-2:#e7e7e7; --text:#020202; --sub:#404040; --line:#d3d3d3; --accent:#FF5100; --accent-soft:#ffe2d4; }
  body { background:var(--bg)!important; color:var(--text)!important; font-family:'Noto Sans KR',system-ui,sans-serif!important; }
  .app { grid-template-columns:248px minmax(0,1fr); background:var(--bg)!important; transition:grid-template-columns .22s ease; }
  .side { position:relative; padding:72px 16px 20px!important; background:var(--surface)!important; border-right:1px solid var(--line); }
  .brand { color:var(--text); padding:0 12px 28px!important; }.brand small,.tip { color:var(--sub)!important; }
  .tab { background:var(--accent-soft)!important; color:var(--text)!important; border:1px solid color-mix(in srgb,var(--accent) 35%,transparent); }
  .sidebar-toggle { position:absolute; top:18px; right:16px; width:32px; height:32px; border:1px solid var(--line); border-radius:9px; background:var(--surface-2); color:var(--text); font-size:18px; cursor:pointer; z-index:20; }
  .theme-settings { margin-top:auto; padding:16px 10px; border-top:1px solid var(--line); color:var(--sub); font-size:12px; font-weight:700; }
  .theme-settings div { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:10px; }.theme-settings button { border:1px solid var(--line); border-radius:7px; padding:7px 4px; background:var(--surface-2); color:var(--text); font:600 11px inherit; cursor:pointer; }.theme-settings button:hover { border-color:var(--accent); color:var(--accent); }
  .sidebar-hidden { grid-template-columns:0 minmax(0,1fr); }.sidebar-hidden .side { padding:0!important; overflow:visible; border:0; }.sidebar-hidden .side>*:not(.sidebar-toggle) { display:none; }.sidebar-hidden .sidebar-toggle { position:fixed; left:16px; right:auto; background:var(--surface); }
  main { max-width:1680px!important; padding:24px 32px 42px!important; }.top { display:flex!important; align-items:center; justify-content:flex-end!important; min-height:58px; margin:0 0 18px!important; padding:10px 14px!important; background:var(--surface)!important; border:1px solid var(--line)!important; border-radius:14px!important; box-shadow:none!important; }
  .primary { padding:8px 12px!important; border-radius:8px!important; background:var(--accent)!important; color:#fff!important; font-size:12px!important; line-height:1.2; box-shadow:none!important; }.primary:hover { transform:none!important; filter:brightness(1.08); }
  .book-inline { flex:1; margin-right:14px; }.book-inline .settings { max-width:none!important; padding:0!important; background:none!important; border:0!important; box-shadow:none!important; }.book-inline section { display:flex; align-items:center; gap:10px; }.book-inline .field { display:flex; align-items:center; gap:7px; margin:0!important; }.book-inline label { margin:0!important; white-space:nowrap; color:var(--sub)!important; }.book-inline input { width:130px!important; padding:7px 8px!important; }.book-inline .cover,.book-inline .hint { display:none; }
  .grid { grid-template-columns:270px minmax(420px,1fr) minmax(320px,.78fr)!important; gap:16px!important; }.card { background:var(--surface)!important; border-color:var(--line)!important; box-shadow:none!important; }.editor,.preview-card { padding:18px!important; }.head { padding:0!important; border:0!important; }.left-tabs { display:grid; grid-template-columns:1fr 1fr; gap:4px; padding:8px; border-bottom:1px solid var(--line); }.left-tab { border:0; border-radius:8px; padding:9px 6px; background:transparent; color:var(--sub); font:700 12px inherit; cursor:pointer; }.left-tab.active { background:var(--accent-soft); color:var(--accent); }
  .left-panel { display:none!important; }.left-panel.active { display:block!important; }.chapters { padding:8px!important; }.add { width:calc(100% - 16px)!important; margin:7px 8px 13px!important; background:transparent!important; border-color:var(--accent)!important; color:var(--accent)!important; }.left-panel#cssPanel { padding:12px!important; }.left-panel#cssPanel section { padding:0!important; }.left-panel#cssPanel .css { height:520px!important; }.left-panel#cssPanel .hint,.left-panel#cssPanel .images { color:var(--sub)!important; }
  h1,h2,label { color:var(--text)!important; } input,textarea { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; } input:focus,textarea:focus { border-color:var(--accent)!important; box-shadow:0 0 0 3px #ff510030!important; }.secondary { background:var(--surface-2)!important; border-color:var(--line)!important; color:var(--text)!important; }.danger { color:#ff8660!important; }.chapter { color:var(--text)!important; }.chapter:hover { background:var(--surface-2)!important; }.chapter.active { background:var(--accent-soft)!important; color:var(--accent)!important; }.preview { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; }.preview-card .head { padding:0 0 12px!important; border-bottom:1px solid var(--line)!important; margin-bottom:12px; }.code { height:610px!important; }
  @media(max-width:1050px) { .grid { grid-template-columns:240px minmax(0,1fr)!important; }.preview-card { grid-column:1/-1; }.book-inline .field:nth-child(3) { display:none; } }
  @media(max-width:700px) { .app { grid-template-columns:1fr!important; }.side { display:none; } main { padding:14px!important; }.top { align-items:stretch!important; flex-direction:column; }.book-inline { margin:0; }.book-inline section { flex-wrap:wrap; }.book-inline input { width:110px!important; }.primary { align-self:flex-end; }.grid { display:block!important; }.editor,.preview-card { margin-top:16px; }.left-panel#cssPanel .css { height:260px!important; } }
`;
window.addEventListener('DOMContentLoaded', () => {
  document.head.append(uiStyle);
  const $ = (selector) => document.querySelector(selector);
  const root = document.documentElement;
  const app = $('.app');
  const side = $('.side');
  const top = $('.top');
  const exportButton = $('#export');
  const bookView = $('#bookView');
  const styleView = $('#styleView');
  const workspaceTabs = $('.workspace-tabs');
  const chapterList = $('#list');
  const addChapter = $('#add');
  const chapterCard = chapterList.closest('.card');
  const chapterHeader = chapterCard.querySelector('.head');
  const chapterControls = chapterList.parentElement;

  root.dataset.theme = localStorage.getItem('epub-theme') || 'dark';

  side.insertAdjacentHTML('afterbegin', `
    <button class="sidebar-toggle" type="button" aria-label="사이드바 숨기기">☰</button>
  `);
  side.querySelector('.tip').insertAdjacentHTML('beforebegin', `
    <div class="theme-settings">
      <span>화면 설정</span>
      <div><button type="button" data-theme="dark">다크</button><button type="button" data-theme="light">라이트</button></div>
    </div>
  `);

  top.querySelector('div').remove();
  bookView.className = 'book-inline';
  const bookSettings = bookView.querySelector('.settings');
  bookSettings.querySelector('.head')?.remove();
  top.insertBefore(bookView, exportButton);

  styleView.remove();
  workspaceTabs?.remove();
  const cssSettings = styleView.querySelector('.settings');
  cssSettings.id = 'cssPanel';
  cssSettings.className = 'left-panel';
  cssSettings.querySelector('.head')?.remove();
  chapterHeader.textContent = '';
  chapterHeader.insertAdjacentHTML('afterbegin', `
    <div class="left-tabs">
      <button class="left-tab active" type="button" data-panel="chaptersPanel">책의 구성</button>
      <button class="left-tab" type="button" data-panel="cssPanel">공통 CSS</button>
    </div>
  `);
  chapterControls.id = 'chaptersPanel';
  chapterControls.classList.add('left-panel');
  addChapter.parentElement === chapterCard || chapterCard.append(addChapter);
  chapterCard.append(cssSettings);

  const toggleSidebar = $('.sidebar-toggle');
  toggleSidebar.addEventListener('click', () => {
    const hidden = app.classList.toggle('sidebar-hidden');
    toggleSidebar.setAttribute('aria-label', hidden ? '사이드바 보이기' : '사이드바 숨기기');
    toggleSidebar.textContent = hidden ? '☰' : '×';
  });

  $('.theme-settings').addEventListener('click', (event) => {
    const button = event.target.closest('[data-theme]');
    if (!button) return;
    root.dataset.theme = button.dataset.theme;
    localStorage.setItem('epub-theme', button.dataset.theme);
  });

  $('.left-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('.left-tab');
    if (!button) return;
    $('.left-tabs').querySelectorAll('button').forEach((tab) => tab.classList.toggle('active', tab === button));
    chapterCard.querySelectorAll('.left-panel').forEach((panel) => panel.classList.toggle('active', panel.id === button.dataset.panel));
  });

  chapterControls.classList.add('active');
});

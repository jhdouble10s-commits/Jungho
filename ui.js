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
  .editor-mode { display:flex; align-items:center; gap:4px; margin:0 0 14px; padding:4px; border:1px solid var(--line); border-radius:10px; background:var(--bg); width:max-content; }.editor-mode button { border:0; border-radius:7px; padding:7px 10px; background:transparent; color:var(--sub); font:700 12px inherit; cursor:pointer; }.editor-mode button.active { background:var(--accent-soft); color:var(--accent); }.rich-toolbar { display:flex; flex-wrap:wrap; gap:6px; padding:9px; margin:0 0 8px; border:1px solid var(--line); border-radius:10px 10px 0 0; background:var(--surface-2); }.rich-toolbar button { min-width:30px; border:1px solid var(--line); border-radius:6px; padding:5px 7px; background:var(--bg); color:var(--text); font:700 12px inherit; cursor:pointer; }.rich-toolbar button:hover { border-color:var(--accent); color:var(--accent); }.rich-toolbar input { width:31px!important; height:28px; padding:2px!important; cursor:pointer; }.rich-editor { min-height:610px; padding:18px; border:1px solid var(--line); border-radius:0 0 10px 10px; background:var(--bg); color:var(--text); line-height:1.8; outline:none; overflow:auto; }.rich-editor:focus { border-color:var(--accent); box-shadow:0 0 0 3px #ff510030; }.rich-editor img { max-width:100%; height:auto; }.rich-editor table { border-collapse:collapse; max-width:100%; }.rich-editor td,.rich-editor th { min-width:72px; border:1px solid var(--sub); padding:6px; }
  h1,h2,label { color:var(--text)!important; } input,textarea { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; } input:focus,textarea:focus { border-color:var(--accent)!important; box-shadow:0 0 0 3px #ff510030!important; }.secondary { background:var(--surface-2)!important; border-color:var(--line)!important; color:var(--text)!important; }.danger { color:#ff8660!important; }.chapter { color:var(--text)!important; }.chapter:hover { background:var(--surface-2)!important; }.chapter.active { background:var(--accent-soft)!important; color:var(--accent)!important; }.preview { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; }.preview-card .head { padding:0 0 12px!important; border-bottom:1px solid var(--line)!important; margin-bottom:12px; }.code { height:610px!important; }
  @media(max-width:1050px) { .grid { grid-template-columns:240px minmax(0,1fr)!important; }.preview-card { grid-column:1/-1; }.book-inline .field:nth-child(3) { display:none; } }
  @media(max-width:700px) { .app { grid-template-columns:1fr!important; }.side { display:none; } main { padding:14px!important; }.top { align-items:stretch!important; flex-direction:column; }.book-inline { margin:0; }.book-inline section { flex-wrap:wrap; }.book-inline input { width:110px!important; }.primary { align-self:flex-end; }.grid { display:block!important; }.editor,.preview-card { margin-top:16px; }.left-panel#cssPanel .css { height:260px!important; } }
  @media(min-width:1921px) {
    main { max-width:none!important; width:100%!important; margin:0!important; padding:clamp(28px,2vw,72px)!important; }
    .grid { grid-template-columns:clamp(270px,16vw,480px) minmax(620px,1.65fr) minmax(480px,1fr)!important; gap:clamp(16px,1vw,30px)!important; }
    .top { min-height:clamp(58px,4vw,96px); padding:clamp(10px,.8vw,20px) clamp(14px,1.1vw,28px)!important; }
    .code { height:clamp(610px,48vw,1080px)!important; }.preview { height:clamp(680px,53vw,1180px)!important; }
    .book-inline input { width:clamp(130px,8vw,240px)!important; padding:clamp(7px,.45vw,12px)!important; }
    .primary { padding:clamp(8px,.5vw,14px) clamp(12px,.75vw,20px)!important; font-size:clamp(12px,.6vw,18px)!important; }
    .left-tab,.secondary { font-size:clamp(12px,.58vw,17px)!important; }.chapter { padding:clamp(10px,.65vw,17px)!important; font-size:clamp(14px,.7vw,20px)!important; }
    label,.head { font-size:clamp(12px,.58vw,17px)!important; }.top { font-size:clamp(14px,.7vw,20px); }
  }
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

  const htmlEditor = $('#body');
  const htmlField = htmlEditor.closest('.full');
  const editorFields = htmlEditor.closest('.fields');
  const visualEditor = document.createElement('div');
  visualEditor.className = 'rich-editor';
  visualEditor.contentEditable = 'true';
  visualEditor.setAttribute('aria-label', '일반 편집기');
  visualEditor.hidden = true;
  const richToolbar = document.createElement('div');
  richToolbar.className = 'rich-toolbar';
  richToolbar.hidden = true;
  richToolbar.innerHTML = `
    <button type="button" data-command="bold" title="굵게"><b>B</b></button>
    <button type="button" data-command="italic" title="기울임"><i>I</i></button>
    <button type="button" data-block="h2" title="제목">제목</button>
    <button type="button" data-command="insertUnorderedList" title="목록">• 목록</button>
    <button type="button" data-command="formatBlock" data-value="blockquote" title="인용">인용</button>
    <button type="button" data-table title="표 삽입">표</button>
    <label title="글자색"><input type="color" value="#FF5100" aria-label="글자색"></label>
  `;
  const mode = document.createElement('div');
  mode.className = 'editor-mode';
  mode.innerHTML = '<button type="button" class="active" data-mode="visual">일반 편집</button><button type="button" data-mode="html">HTML 편집</button>';
  editorFields.insertBefore(mode, htmlField);
  htmlField.after(richToolbar, visualEditor);

  const refreshPreview = () => $('#previewBtn').click();
  const syncFromVisual = () => {
    htmlEditor.value = visualEditor.innerHTML;
    htmlEditor.dispatchEvent(new Event('input', { bubbles: true }));
    refreshPreview();
  };
  const setMode = (nextMode) => {
    const visual = nextMode === 'visual';
    if (visual) visualEditor.innerHTML = htmlEditor.value;
    else syncFromVisual();
    htmlField.hidden = visual;
    richToolbar.hidden = !visual;
    visualEditor.hidden = !visual;
    mode.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.mode === nextMode));
  };
  mode.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (button) setMode(button.dataset.mode);
  });
  visualEditor.addEventListener('input', syncFromVisual);
  richToolbar.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    visualEditor.focus();
    if (button.dataset.table !== undefined) document.execCommand('insertHTML', false, '<table><thead><tr><th>제목 1</th><th>제목 2</th></tr></thead><tbody><tr><td>내용</td><td>내용</td></tr></tbody></table><p></p>');
    else if (button.dataset.block) document.execCommand('formatBlock', false, button.dataset.block);
    else document.execCommand(button.dataset.command, false, button.dataset.value || null);
    syncFromVisual();
  });
  richToolbar.querySelector('input[type="color"]').addEventListener('input', (event) => {
    visualEditor.focus();
    document.execCommand('foreColor', false, event.target.value);
    syncFromVisual();
  });
  chapterList.addEventListener('click', () => setTimeout(() => {
    if (!visualEditor.hidden) visualEditor.innerHTML = htmlEditor.value;
  }, 0));
  setMode('visual');
  chapterControls.classList.add('active');
});

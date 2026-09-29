const uiStyle = document.createElement('style');
uiStyle.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');
  :root { --bg:#050505; --surface:#0e0e0f; --surface-2:#171719; --text:#f7f7f5; --sub:#a3a3a8; --line:#2a2a2d; --accent:#FF5100; --accent-soft:#40200f; }
  html[data-theme="light"] { --bg:#f1f1f1; --surface:#fff; --surface-2:#e7e7e7; --text:#020202; --sub:#404040; --line:#d3d3d3; --accent:#FF5100; --accent-soft:#ffe2d4; }
  body { overflow-x:clip; background:var(--bg)!important; color:var(--text)!important; font-family:'Noto Sans KR',system-ui,sans-serif!important; }
  .app { grid-template-columns:248px minmax(0,1fr); background:var(--bg)!important; transition:grid-template-columns .22s ease; }
  .side { position:relative; padding:72px 16px 20px!important; background:var(--surface)!important; border-right:1px solid var(--line); }
  .brand { color:var(--text); padding:0 12px 28px!important; }.brand small,.tip { color:var(--sub)!important; }
  .tab { background:var(--accent-soft)!important; color:var(--text)!important; border:1px solid color-mix(in srgb,var(--accent) 35%,transparent); }
  .sidebar-toggle { position:absolute; top:18px; right:16px; width:32px; height:32px; border:1px solid var(--line); border-radius:9px; background:var(--surface-2); color:var(--text); font-size:18px; cursor:pointer; z-index:20; }
  .theme-settings { margin-top:auto; padding:16px 10px; border-top:1px solid var(--line); color:var(--sub); font-size:12px; font-weight:700; }
  .theme-settings div { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:10px; }.theme-settings button { border:1px solid var(--line); border-radius:7px; padding:7px 4px; background:var(--surface-2); color:var(--text); font:600 11px inherit; cursor:pointer; }.theme-settings button:hover { border-color:var(--accent); color:var(--accent); }
  .sidebar-hidden { grid-template-columns:0 minmax(0,1fr); }.sidebar-hidden .side { padding:0!important; overflow:visible; border:0; }.sidebar-hidden .side>*:not(.sidebar-toggle) { display:none; }.sidebar-hidden .sidebar-toggle { position:fixed; left:16px; right:auto; background:var(--surface); }
  main { min-width:0; max-width:1680px!important; padding:24px 32px 42px!important; }.top { min-width:0; display:flex!important; align-items:center; justify-content:flex-end!important; min-height:58px; margin:0 0 18px!important; padding:10px 14px!important; background:var(--surface)!important; border:1px solid var(--line)!important; border-radius:14px!important; box-shadow:none!important; }
  .primary { padding:8px 12px!important; border-radius:8px!important; background:var(--accent)!important; color:#fff!important; font-size:12px!important; line-height:1.2; box-shadow:none!important; }.primary:hover { transform:none!important; filter:brightness(1.08); }
  .book-inline { flex:1; margin-right:14px; }.book-inline .settings { max-width:none!important; padding:0!important; background:none!important; border:0!important; box-shadow:none!important; }.book-inline section { display:flex; align-items:center; gap:10px; }.book-inline .field { display:flex; align-items:center; gap:7px; margin:0!important; }.book-inline label { margin:0!important; white-space:nowrap; color:var(--sub)!important; }.book-inline input { width:130px!important; padding:7px 8px!important; }.book-inline .cover,.book-inline .hint { display:none; }
  .grid { --chapter-width:270px; --preview-width:440px; min-width:0; max-width:100%; position:relative; grid-template-columns:var(--chapter-width) minmax(420px,1fr) var(--preview-width)!important; gap:16px!important; }.panel-resize-handle { position:absolute; top:0; bottom:0; z-index:10; width:14px; transform:translateX(-7px); cursor:col-resize; touch-action:none; }.panel-resize-handle::after { content:''; position:absolute; top:20%; bottom:20%; left:6px; width:2px; border-radius:2px; background:transparent; transition:background .15s; }.panel-resize-handle:hover::after,.panel-resize-handle.is-resizing::after { background:var(--accent); }.card { min-width:0; background:var(--surface)!important; border-color:var(--line)!important; box-shadow:none!important; }.editor,.preview-card { min-width:0; padding:18px!important; }.head { padding:0!important; border:0!important; }.left-tabs { display:grid; grid-template-columns:1fr 1fr; gap:4px; padding:8px; border-bottom:1px solid var(--line); }.left-tab { border:0; border-radius:8px; padding:9px 6px; background:transparent; color:var(--sub); font:700 12px inherit; cursor:pointer; }.left-tab.active { background:var(--accent-soft); color:var(--accent); }
  .left-panel { display:none!important; }.left-panel.active { display:block!important; }.chapters { padding:8px!important; }.add { width:calc(100% - 16px)!important; margin:7px 8px 13px!important; background:transparent!important; border-color:var(--accent)!important; color:var(--accent)!important; }.left-panel#cssPanel { padding:12px!important; }.left-panel#cssPanel section { padding:0!important; }.left-panel#cssPanel .css { height:520px!important; }.left-panel#cssPanel .hint,.left-panel#cssPanel .images { color:var(--sub)!important; }
  .editor-controls { min-width:0; display:flex; align-items:center; gap:10px; margin:0 0 14px; }.editor-mode { display:flex; flex:none; align-items:center; gap:4px; padding:4px; border:1px solid var(--line); border-radius:10px; background:var(--bg); }.editor-mode button { border:0; border-radius:7px; padding:7px 10px; background:transparent; color:var(--sub); font:700 12px inherit; cursor:pointer; white-space:nowrap; }.editor-mode button.active { background:var(--accent-soft); color:var(--accent); }.toolbar-viewport { position:relative; min-width:0; flex:1; overflow:hidden; }.rich-toolbar { display:flex; flex-wrap:nowrap; align-items:center; gap:6px; min-width:0; overflow:hidden; padding:5px 44px 5px 7px; margin:0; border:1px solid var(--line); border-radius:10px; background:var(--surface-2); scrollbar-width:none; }.rich-toolbar::-webkit-scrollbar { display:none; }.toolbar-viewport::after { content:''; pointer-events:none; position:absolute; top:1px; right:38px; bottom:1px; width:44px; background:linear-gradient(90deg,transparent,var(--surface-2)); }.toolbar-next { position:absolute; top:4px; right:5px; z-index:1; width:29px; height:29px; border:1px solid var(--accent); border-radius:7px; background:var(--surface-2); color:var(--accent); font:700 20px/22px system-ui; cursor:pointer; }.toolbar-next:hover { background:var(--accent-soft); }.rich-toolbar button { min-width:30px; border:1px solid var(--line); border-radius:6px; padding:5px 7px; background:var(--bg); color:var(--text); font:700 12px inherit; cursor:pointer; white-space:nowrap; }.rich-toolbar button:hover { border-color:var(--accent); color:var(--accent); }.rich-toolbar input { width:31px!important; height:28px; padding:2px!important; cursor:pointer; }.rich-toolbar select { height:29px; flex:none; border:1px solid var(--line); border-radius:6px; padding:0 6px; background:var(--bg); color:var(--text); font:600 11px inherit; cursor:pointer; }.rich-toolbar .tool-separator { width:1px; height:22px; flex:none; background:var(--line); }.rich-editor { min-height:610px; padding:18px; border:1px solid var(--line); border-radius:10px; background:var(--bg); color:var(--text); line-height:1.8; outline:none; overflow:auto; }.rich-editor:focus { border-color:var(--accent); box-shadow:0 0 0 3px #ff510030; }.rich-editor img { max-width:100%; height:auto; }.rich-editor table { border-collapse:collapse; max-width:100%; }.rich-editor td,.rich-editor th { min-width:72px; border:1px solid var(--sub); padding:6px; }
  .preview-card .head { display:flex; align-items:center; justify-content:space-between; gap:10px; }.device-controls { display:flex; align-items:center; gap:6px; }.device-controls select { max-width:118px; height:28px; border:1px solid var(--line); border-radius:6px; padding:0 5px; background:var(--bg); color:var(--text); font:600 11px inherit; cursor:pointer; }.preview-card { overflow:hidden; }.preview[data-device-preview="true"] { box-sizing:content-box; flex:none; margin:0 auto; border:8px solid #1b1b1e!important; border-radius:22px; box-shadow:0 10px 30px #00000045; transition:width .2s,height .2s; }
  .rich-toolbar button.active { border-color:var(--accent); background:var(--accent-soft); color:var(--accent); }.rich-toolbar input[data-font-size] { width:62px!important; height:29px; flex:none; font-size:11px!important; }.rich-toolbar input[data-table-color] { width:29px!important; height:29px; flex:none; }.rich-toolbar .tool-label { flex:none; color:var(--sub); font-size:10px; white-space:nowrap; }
  .rich-editor { height:clamp(420px,calc(100vh - 310px),900px); min-height:0; }.preview-card { position:sticky; top:24px; align-self:start; max-height:calc(100vh - 48px); display:flex; flex-direction:column; overflow:hidden; }.preview-card .preview { flex:none; }.preview .preview-focus { background:#ff510018; outline:1px solid #ff5100aa; outline-offset:4px; border-radius:4px; transition:background .15s; }.preview mark.preview-context { background:#ff510052; color:inherit; border-radius:2px; padding:0 1px; }
  h1,h2,label { color:var(--text)!important; } input,textarea { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; } input:focus,textarea:focus { border-color:var(--accent)!important; box-shadow:0 0 0 3px #ff510030!important; }.secondary { background:var(--surface-2)!important; border-color:var(--line)!important; color:var(--text)!important; }.danger { color:#ff8660!important; }.chapter { color:var(--text)!important; }.chapter:hover { background:var(--surface-2)!important; }.chapter.active { background:var(--accent-soft)!important; color:var(--accent)!important; }.preview { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; }.preview-card .head { padding:0 0 12px!important; border-bottom:1px solid var(--line)!important; margin-bottom:12px; }.code { height:610px!important; }
  @media(max-width:1550px) { .grid { grid-template-columns:minmax(210px,var(--chapter-width)) minmax(0,1fr)!important; }.panel-resize-handle { display:none; }.preview-card { grid-column:1/-1; position:static; max-height:none; }.preview-card .preview { margin:auto; }.book-inline { min-width:0; overflow:hidden; } }
  @media(max-width:1050px) { .grid { grid-template-columns:240px minmax(0,1fr)!important; }.panel-resize-handle { display:none; }.preview-card { grid-column:1/-1; }.book-inline .field:nth-child(3) { display:none; } }
  @media(max-width:700px) { .app { grid-template-columns:1fr!important; }.side { display:none; } main { padding:14px!important; }.top { align-items:stretch!important; flex-direction:column; }.book-inline { margin:0; }.book-inline section { flex-wrap:wrap; }.book-inline input { width:110px!important; }.primary { align-self:flex-end; }.grid { display:block!important; }.editor,.preview-card { margin-top:16px; }.editor-controls { align-items:stretch; flex-direction:column; }.rich-toolbar { flex-wrap:wrap; }.left-panel#cssPanel .css { height:260px!important; } }
  @media(min-width:1921px) {
    main { max-width:none!important; width:100%!important; margin:0!important; padding:clamp(28px,2vw,72px)!important; }
    .grid { --chapter-width:clamp(270px,16vw,480px); --preview-width:minmax(480px,1fr); grid-template-columns:var(--chapter-width) minmax(620px,1.65fr) var(--preview-width)!important; gap:clamp(16px,1vw,30px)!important; }
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
  const preview = $('#preview');
  const previewCard = preview.closest('.preview-card');
  const previewHeader = previewCard.querySelector('.head');
  const grid = chapterCard.parentElement;
  const editorCard = chapterCard.nextElementSibling;
  const resizeHandles = ['chapters', 'preview'].map((panel) => {
    const handle = document.createElement('div');
    handle.className = 'panel-resize-handle';
    handle.dataset.resizePanel = panel;
    handle.title = panel === 'chapters' ? '책 구성 영역 너비 조절' : '미리보기 영역 너비 조절';
    grid.append(handle);
    return handle;
  });
  const positionResizeHandles = () => {
    resizeHandles[0].style.left = `${chapterCard.offsetLeft + chapterCard.offsetWidth + 8}px`;
    resizeHandles[1].style.left = `${editorCard.offsetLeft + editorCard.offsetWidth + 8}px`;
  };
  const savedWidths = JSON.parse(localStorage.getItem('epub-panel-widths') || '{}');
  if (Number.isFinite(savedWidths.chapters)) grid.style.setProperty('--chapter-width', `${savedWidths.chapters}px`);
  if (Number.isFinite(savedWidths.preview)) grid.style.setProperty('--preview-width', `${savedWidths.preview}px`);
  const savePanelWidths = () => localStorage.setItem('epub-panel-widths', JSON.stringify({
    chapters: Math.round(chapterCard.getBoundingClientRect().width),
    preview: Math.round(previewCard.getBoundingClientRect().width),
  }));
  resizeHandles.forEach((handle) => handle.addEventListener('pointerdown', (event) => {
    if (window.matchMedia('(max-width: 1050px)').matches) return;
    event.preventDefault();
    const panel = handle.dataset.resizePanel;
    const startX = event.clientX;
    const startWidth = panel === 'chapters' ? chapterCard.getBoundingClientRect().width : previewCard.getBoundingClientRect().width;
    const gridWidth = grid.getBoundingClientRect().width;
    const chapterWidth = chapterCard.getBoundingClientRect().width;
    const previewWidth = previewCard.getBoundingClientRect().width;
    const maxWidth = panel === 'chapters'
      ? gridWidth - previewWidth - 420 - 32
      : gridWidth - chapterWidth - 420 - 32;
    handle.setPointerCapture(event.pointerId);
    handle.classList.add('is-resizing');
    const resize = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const next = panel === 'chapters' ? startWidth + delta : startWidth - delta;
      grid.style.setProperty(panel === 'chapters' ? '--chapter-width' : '--preview-width', `${Math.round(Math.max(panel === 'chapters' ? 210 : 360, Math.min(maxWidth, next)))}px`);
      positionResizeHandles();
    };
    const finish = () => {
      handle.classList.remove('is-resizing');
      handle.removeEventListener('pointermove', resize);
      handle.removeEventListener('pointerup', finish);
      handle.removeEventListener('pointercancel', finish);
      savePanelWidths();
    };
    handle.addEventListener('pointermove', resize);
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
  }));
  new ResizeObserver(positionResizeHandles).observe(grid);
  const devicePresets = {
    'iphone-16': { label: 'iPhone 16', width: 393, height: 852 },
    'iphone-16-plus': { label: 'iPhone 16 Plus', width: 430, height: 932 },
    'iphone-16-pro': { label: 'iPhone 16 Pro', width: 402, height: 874 },
    'iphone-16-pro-max': { label: 'iPhone 16 Pro Max', width: 440, height: 956 },
    'iphone-17': { label: 'iPhone 17', width: 393, height: 852 },
    'iphone-17-air': { label: 'iPhone 17 Air', width: 430, height: 932 },
    'iphone-17-pro': { label: 'iPhone 17 Pro', width: 402, height: 874 },
    'iphone-17-pro-max': { label: 'iPhone 17 Pro Max', width: 440, height: 956 },
    'iphone-18': { label: 'iPhone 18', width: 393, height: 852 },
    'iphone-18-pro': { label: 'iPhone 18 Pro', width: 402, height: 874 },
    'iphone-18-pro-max': { label: 'iPhone 18 Pro Max', width: 440, height: 956 },
    'ipad-mini': { label: 'iPad mini', width: 744, height: 1133 },
    'ipad': { label: 'iPad', width: 820, height: 1180 },
    'ipad-air': { label: 'iPad Air', width: 820, height: 1180 },
    'ipad-pro-11': { label: 'iPad Pro 11″', width: 834, height: 1194 },
    'ipad-pro-13': { label: 'iPad Pro 13″', width: 1032, height: 1376 },
  };
  previewHeader.innerHTML = `<span>미리보기</span><div class="device-controls"><select id="phonePreview" aria-label="아이폰 미리보기"><option value="">아이폰</option><option value="iphone-16">iPhone 16</option><option value="iphone-16-plus">16 Plus</option><option value="iphone-16-pro">16 Pro</option><option value="iphone-16-pro-max">16 Pro Max</option><option value="iphone-17">iPhone 17</option><option value="iphone-17-air">17 Air</option><option value="iphone-17-pro">17 Pro</option><option value="iphone-17-pro-max">17 Pro Max</option><option value="iphone-18">iPhone 18</option><option value="iphone-18-pro">18 Pro</option><option value="iphone-18-pro-max">18 Pro Max</option></select><select id="tabletPreview" aria-label="태블릿 미리보기"><option value="">Tablet</option><option value="ipad-mini">iPad mini</option><option value="ipad">iPad</option><option value="ipad-air">iPad Air</option><option value="ipad-pro-11">iPad Pro 11″</option><option value="ipad-pro-13">iPad Pro 13″</option></select></div>`;
  const phonePreview = $('#phonePreview');
  const tabletPreview = $('#tabletPreview');
  let selectedDevice = '';
  const applyDevicePreview = () => {
    const device = devicePresets[selectedDevice];
    if (!device) {
      preview.dataset.devicePreview = 'false';
      preview.style.removeProperty('width');
      preview.style.removeProperty('height');
      return;
    }
    const availableWidth = Math.max(260, previewCard.clientWidth - 52);
    const scale = Math.min(1, availableWidth / device.width, 780 / device.height);
    preview.dataset.devicePreview = 'true';
    preview.style.setProperty('width', `${Math.round(device.width * scale)}px`, 'important');
    preview.style.setProperty('height', `${Math.round(device.height * scale)}px`, 'important');
  };
  phonePreview.addEventListener('change', () => { selectedDevice = phonePreview.value; if (selectedDevice) tabletPreview.value = ''; applyDevicePreview(); });
  tabletPreview.addEventListener('change', () => { selectedDevice = tabletPreview.value; if (selectedDevice) phonePreview.value = ''; applyDevicePreview(); });
  new ResizeObserver(applyDevicePreview).observe(previewCard);

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
    <button type="button" data-command="superscript" title="위첨자">x<sup>2</sup></button>
    <button type="button" data-command="subscript" title="아래첨자">x<sub>2</sub></button>
    <span class="tool-separator"></span>
    <select data-heading aria-label="제목 단계"><option value="">본문</option><option value="h1">제목 1</option><option value="h2">제목 2</option><option value="h3">제목 3</option><option value="h4">제목 4</option><option value="h5">제목 5</option></select>
    <input data-font-size list="font-size-options" inputmode="numeric" aria-label="글자 크기" placeholder="기본" title="글자 크기 직접 입력">
    <datalist id="font-size-options"><option value="10"><option value="11"><option value="12"><option value="13"><option value="14"><option value="15"><option value="16"><option value="20"><option value="24"><option value="32"><option value="36"><option value="40"><option value="48"><option value="64"></datalist>
    <select data-font-family aria-label="글꼴"><option value="">기본 글꼴</option><option value="sans-serif">고딕</option><option value="serif">명조</option><option value="monospace">고정폭</option><option value="system-ui">기기 기본</option></select>
    <label title="글자색"><input type="color" value="#FF5100" aria-label="글자색"></label>
    <span class="tool-separator"></span>
    <button type="button" data-command="justifyLeft" title="왼쪽 정렬">≡</button>
    <button type="button" data-command="justifyCenter" title="가운데 정렬">≡</button>
    <button type="button" data-command="justifyRight" title="오른쪽 정렬">≡</button>
    <button type="button" data-command="justifyFull" title="양쪽 맞춤">☰</button>
    <span class="tool-separator"></span>
    <select data-list aria-label="목록 종류"><option value="">목록</option><option value="disc">• 글머리</option><option value="decimal">1. 숫자</option><option value="upper-roman">I. 로마</option></select>
    <button type="button" data-command="formatBlock" data-value="blockquote" title="인용">인용</button>
    <span class="tool-separator"></span>
    <button type="button" data-table title="2×2 표 삽입">표</button>
    <button type="button" data-table-action="row" title="선택한 표에 행 추가">행 +</button>
    <button type="button" data-table-action="column" title="선택한 표에 열 추가">열 +</button>
    <span class="tool-label">헤더</span><input type="color" data-table-color="head" value="#ffffff" aria-label="표 헤더 배경색">
    <span class="tool-label">본문</span><input type="color" data-table-color="body" value="#ffffff" aria-label="표 본문 배경색">
  `;
  const mode = document.createElement('div');
  mode.className = 'editor-mode';
  mode.innerHTML = '<button type="button" class="active" data-mode="visual">일반 편집</button><button type="button" data-mode="html">HTML 편집</button>';
  const editorControls = document.createElement('div');
  editorControls.className = 'editor-controls';
  const toolbarViewport = document.createElement('div');
  toolbarViewport.className = 'toolbar-viewport';
  const toolbarNext = document.createElement('button');
  toolbarNext.type = 'button';
  toolbarNext.className = 'toolbar-next';
  toolbarNext.setAttribute('aria-label', '다음 편집 도구 보기');
  toolbarNext.textContent = '›';
  toolbarViewport.append(richToolbar, toolbarNext);
  editorControls.append(mode, toolbarViewport);
  editorFields.before(editorControls);
  editorFields.after(visualEditor);
  toolbarNext.addEventListener('click', () => {
    const visibleEnd = richToolbar.scrollLeft + richToolbar.clientWidth - 42;
    const next = Array.from(richToolbar.children).find((control) => control.offsetLeft + control.offsetWidth > visibleEnd + 2);
    if (next) richToolbar.scrollTo({ left: Math.min(next.offsetLeft - 8, richToolbar.scrollWidth - richToolbar.clientWidth), behavior: 'smooth' });
    else richToolbar.scrollTo({ left: 0, behavior: 'smooth' });
  });

  const refreshPreview = () => $('#previewBtn').click();
  const normaliseParagraphs = () => {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const captureCaret = (node) => {
      if (!range || (!node.contains(range.startContainer) && node !== range.startContainer)) return null;
      const before = range.cloneRange();
      before.selectNodeContents(node);
      before.setEnd(range.startContainer, range.startOffset);
      return before.toString().length;
    };
    const restoreCaret = (node, offset) => {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let remaining = offset;
      let textNode = walker.nextNode();
      while (textNode && remaining > textNode.textContent.length) {
        remaining -= textNode.textContent.length;
        textNode = walker.nextNode();
      }
      const target = textNode || node;
      const nextRange = document.createRange();
      nextRange.setStart(target, textNode ? Math.min(remaining, textNode.textContent.length) : 0);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    };
    Array.from(visualEditor.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const caretOffset = captureCaret(node);
        const paragraph = document.createElement('p');
        paragraph.textContent = node.textContent;
        node.replaceWith(paragraph);
        if (caretOffset !== null) restoreCaret(paragraph, caretOffset);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV') {
        const caretOffset = captureCaret(node);
        const paragraph = document.createElement('p');
        paragraph.innerHTML = node.innerHTML;
        node.replaceWith(paragraph);
        if (caretOffset !== null) restoreCaret(paragraph, caretOffset);
      }
    });
  };
  const syncFromVisual = () => {
    normaliseParagraphs();
    htmlEditor.value = visualEditor.innerHTML;
    htmlEditor.dispatchEvent(new Event('input', { bubbles: true }));
    refreshPreview();
  };
  const previewBlockSelector = 'p,h1,h2,h3,h4,h5,li,blockquote,td,th';
  const clearPreviewFocus = () => {
    preview.querySelectorAll('.preview-focus').forEach((node) => node.classList.remove('preview-focus'));
    preview.querySelectorAll('mark.preview-context').forEach((mark) => mark.replaceWith(document.createTextNode(mark.textContent)));
    preview.normalize();
  };
  const wordContext = (text, offset) => {
    const words = Array.from(text.matchAll(/\S+/g));
    if (!words.length) return null;
    let current = words.findIndex((word) => offset >= word.index && offset <= word.index + word[0].length);
    if (current < 0) current = words.findIndex((word) => word.index >= offset);
    if (current < 0) current = words.length - 1;
    const first = words[Math.max(0, current - 1)];
    const last = words[Math.min(words.length - 1, current + 1)];
    return { start: first.index, end: last.index + last[0].length };
  };
  const markPreviewContext = (target, offset) => {
    const bounds = wordContext(target.textContent || '', offset);
    if (!bounds) return;
    let cursor = 0;
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const start = cursor;
      const end = start + node.textContent.length;
      cursor = end;
      const from = Math.max(start, bounds.start);
      const to = Math.min(end, bounds.end);
      if (from >= to) return;
      const fragment = document.createDocumentFragment();
      const localStart = from - start;
      const localEnd = to - start;
      if (localStart) fragment.append(document.createTextNode(node.textContent.slice(0, localStart)));
      const mark = document.createElement('mark');
      mark.className = 'preview-context';
      mark.textContent = node.textContent.slice(localStart, localEnd);
      fragment.append(mark);
      if (localEnd < node.textContent.length) fragment.append(document.createTextNode(node.textContent.slice(localEnd)));
      node.replaceWith(fragment);
    });
  };
  const focusPreviewBlock = (index, offset = 0) => {
    clearPreviewFocus();
    const target = preview.querySelectorAll(previewBlockSelector)[index];
    if (!target) return;
    target.classList.add('preview-focus');
    markPreviewContext(target, offset);
    preview.scrollTo({ top: Math.max(0, target.offsetTop - preview.clientHeight / 2 + target.clientHeight / 2), behavior: 'smooth' });
  };
  const visualCaretOffset = (block) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !block) return 0;
    const range = selection.getRangeAt(0);
    if (!block.contains(range.startContainer)) return 0;
    const before = range.cloneRange();
    before.selectNodeContents(block);
    before.setEnd(range.startContainer, range.startOffset);
    return before.toString().length;
  };
  const syncVisualPreview = () => {
    const selection = window.getSelection();
    const node = selection?.anchorNode?.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection?.anchorNode?.parentElement;
    const block = editableBlock(node);
    const index = Array.from(visualEditor.querySelectorAll(previewBlockSelector)).indexOf(block);
    if (index >= 0) focusPreviewBlock(index, visualCaretOffset(block));
  };
  const syncHtmlPreview = () => {
    const before = htmlEditor.value.slice(0, htmlEditor.selectionStart);
    const matches = Array.from(before.matchAll(/<(p|h[1-5]|li|blockquote|td|th)\b[^>]*>/gi));
    if (matches.length) focusPreviewBlock(matches.length - 1);
  };
  const blockTags = new Set(['address', 'article', 'blockquote', 'div', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'hr', 'li', 'ol', 'p', 'pre', 'section', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul']);
  const prettyHtml = (source) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = source;
    const attributes = (element) => Array.from(element.attributes).map((attr) => ` ${attr.name}="${attr.value}"`).join('');
    const render = (node, depth = 0) => {
      const indent = '  '.repeat(depth);
      if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim() ? `${indent}${node.textContent.trim()}` : '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const tag = node.tagName.toLowerCase();
      if (!blockTags.has(tag)) return `${indent}${node.outerHTML}`;
      if (['img', 'br', 'hr'].includes(tag)) return `${indent}${node.outerHTML}`;
      const children = Array.from(node.childNodes).filter((child) => child.nodeType !== Node.TEXT_NODE || child.textContent.trim());
      const hasBlockChild = children.some((child) => child.nodeType === Node.ELEMENT_NODE && blockTags.has(child.tagName.toLowerCase()));
      if (!hasBlockChild) return `${indent}<${tag}${attributes(node)}>${node.innerHTML.trim()}</${tag}>`;
      const inner = children.map((child) => render(child, depth + 1)).filter(Boolean).join('\n');
      return `${indent}<${tag}${attributes(node)}>\n${inner}\n${indent}</${tag}>`;
    };
    return Array.from(wrapper.childNodes).map((node) => render(node)).filter(Boolean).join('\n');
  };
  const setMode = (nextMode) => {
    const visual = nextMode === 'visual';
    if (visual) visualEditor.innerHTML = htmlEditor.value;
    else {
      syncFromVisual();
      htmlEditor.value = prettyHtml(htmlEditor.value);
      htmlEditor.dispatchEvent(new Event('input', { bubbles: true }));
    }
    htmlField.hidden = visual;
    richToolbar.hidden = !visual;
    visualEditor.hidden = !visual;
    mode.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.mode === nextMode));
  };
  htmlEditor.addEventListener('input', () => {
    if (!htmlField.hidden) { refreshPreview(); syncHtmlPreview(); }
  });
  htmlEditor.addEventListener('click', syncHtmlPreview);
  htmlEditor.addEventListener('keyup', syncHtmlPreview);
  mode.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (button) setMode(button.dataset.mode);
  });
  let activeTable = null;
  let activeBlock = null;
  const editableBlock = (node) => node?.closest?.('p,h1,h2,h3,h4,h5,li,blockquote,td,th');
  const currentTable = () => activeTable || visualEditor.querySelector('table:last-of-type');
  visualEditor.addEventListener('click', (event) => {
    activeTable = event.target.closest('table');
    activeBlock = editableBlock(event.target);
  });
  const makePasteFragment = (clipboard) => {
    const sourceHtml = clipboard.getData('text/html');
    const plainText = clipboard.getData('text/plain');
    const container = document.createElement('div');
    if (sourceHtml) container.innerHTML = sourceHtml;
    else {
      plainText.split(/\r?\n\s*\r?\n/).filter(Boolean).forEach((paragraph) => {
        const p = document.createElement('p');
        p.innerHTML = paragraph.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br>');
        container.append(p);
      });
    }
    container.querySelectorAll('script,style,link,meta,iframe,object,embed').forEach((node) => node.remove());
    container.querySelectorAll('*').forEach((node) => Array.from(node.attributes).forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith('on')) node.removeAttribute(attribute.name);
      if (attribute.name.toLowerCase() === 'bgcolor') node.removeAttribute(attribute.name);
    }));
    container.querySelectorAll('*').forEach((node) => {
      node.style.removeProperty('background');
      node.style.removeProperty('background-color');
      node.style.removeProperty('background-image');
      if (!node.getAttribute('style')?.trim()) node.removeAttribute('style');
    });
    const fragment = document.createDocumentFragment();
    Array.from(container.childNodes).forEach((node) => fragment.append(node));
    return fragment;
  };
  visualEditor.addEventListener('paste', (event) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    event.preventDefault();
    const fragment = makePasteFragment(event.clipboardData);
    const hasContent = fragment.childNodes.length > 0;
    if (!hasContent) return;
    const range = selection.getRangeAt(0);
    const startNode = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
    const heading = startNode?.closest('h1,h2,h3,h4,h5');
    const containsBlock = Array.from(fragment.childNodes).some((node) => node.nodeType === Node.ELEMENT_NODE && blockTags.has(node.tagName.toLowerCase()));
    if (heading && containsBlock) {
      range.setStartAfter(heading);
      range.collapse(true);
    } else range.deleteContents();
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);
    const pasteEnd = document.createComment('paste-end');
    if (lastNode) {
      const caret = document.createRange();
      caret.setStartAfter(lastNode);
      caret.collapse(true);
      selection.removeAllRanges();
      selection.addRange(caret);
      caret.insertNode(pasteEnd);
    }
    normaliseParagraphs();
    syncFromVisual();
    let pastedBlock = pasteEnd.previousSibling;
    if (pastedBlock?.nodeType === Node.ELEMENT_NODE && !pastedBlock.matches(previewBlockSelector)) {
      pastedBlock = Array.from(pastedBlock.querySelectorAll(previewBlockSelector)).at(-1) || pastedBlock;
    }
    const pastedIndex = Array.from(visualEditor.querySelectorAll(previewBlockSelector)).indexOf(pastedBlock);
    if (pastedIndex >= 0) focusPreviewBlock(pastedIndex, pastedBlock.textContent.length);
    pasteEnd.remove();
    updateToolbarState();
  });
  const updateToolbarState = () => {
    const selection = window.getSelection();
    const node = selection?.anchorNode?.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection?.anchorNode?.parentElement;
    if (!node || !visualEditor.contains(node)) return;
    [['bold', 'bold'], ['italic', 'italic'], ['superscript', 'superscript'], ['subscript', 'subscript'], ['justifyLeft', 'justifyLeft'], ['justifyCenter', 'justifyCenter'], ['justifyRight', 'justifyRight'], ['justifyFull', 'justifyFull']].forEach(([command, selector]) => {
      richToolbar.querySelector(`[data-command="${selector}"]`)?.classList.toggle('active', document.queryCommandState(command));
    });
    const heading = node.closest('h1,h2,h3,h4,h5');
    activeBlock = editableBlock(node);
    richToolbar.querySelector('[data-heading]').value = heading?.tagName.toLowerCase() || '';
    const list = node.closest('ol,ul');
    richToolbar.querySelector('[data-list]').value = list ? (list.tagName === 'UL' ? 'disc' : (list.style.listStyleType || 'decimal')) : '';
    const sized = node.closest('span[style*="font-size"]');
    richToolbar.querySelector('[data-font-size]').value = sized?.style.fontSize?.replace('px', '') || '';
    richToolbar.querySelector('[data-font-family]').value = activeBlock?.style.fontFamily || '';
  };
  visualEditor.addEventListener('input', () => { syncFromVisual(); updateToolbarState(); syncVisualPreview(); });
  visualEditor.addEventListener('keyup', () => { updateToolbarState(); syncVisualPreview(); });
  visualEditor.addEventListener('mouseup', () => { updateToolbarState(); syncVisualPreview(); });
  richToolbar.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    visualEditor.focus();
    if (button.dataset.table !== undefined) {
      document.execCommand('insertHTML', false, '<table><thead><tr><th>제목 1</th><th>제목 2</th></tr></thead><tbody><tr><td>내용</td><td>내용</td></tr></tbody></table><p></p>');
      activeTable = visualEditor.querySelector('table:last-of-type');
    } else if (button.dataset.tableAction) {
      const table = currentTable();
      if (!table) return;
      if (button.dataset.tableAction === 'row') {
        const row = table.insertRow();
        const count = table.rows[0]?.cells.length || 1;
        for (let i = 0; i < count; i += 1) row.insertCell().textContent = '내용';
      } else {
        Array.from(table.rows).forEach((row) => row.insertCell().textContent = row.parentElement.tagName === 'THEAD' ? '제목' : '내용');
      }
    } else if (button.dataset.list) {
      document.execCommand('insertOrderedList', false, null);
      const selection = window.getSelection();
      const node = selection?.anchorNode?.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection?.anchorNode?.parentElement;
      node?.closest('ol')?.style.setProperty('list-style-type', button.dataset.list);
    } else if (button.dataset.block) document.execCommand('formatBlock', false, button.dataset.block);
    else document.execCommand(button.dataset.command, false, button.dataset.value || null);
    syncFromVisual();
  });
  richToolbar.querySelector('[data-heading]').addEventListener('change', (event) => {
    visualEditor.focus();
    document.execCommand('formatBlock', false, event.target.value || 'p');
    syncFromVisual();
  });
  richToolbar.querySelector('[data-font-size]').addEventListener('change', (event) => {
    const input = event.target;
    if (!input.value) {
      if (activeBlock) activeBlock.style.removeProperty('font-size');
      else window.getSelection()?.anchorNode?.parentElement?.closest('span[style*="font-size"]')?.style.removeProperty('font-size');
      syncFromVisual();
      return;
    }
    const size = /^\d+(?:\.\d+)?$/.test(input.value) ? `${input.value}px` : input.value;
    if (activeBlock) {
      activeBlock.style.fontSize = size;
      syncFromVisual();
      updateToolbarState();
      return;
    }
    visualEditor.focus();
    document.execCommand('fontSize', false, '7');
    visualEditor.querySelectorAll('font[size="7"]').forEach((font) => {
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.innerHTML = font.innerHTML;
      font.replaceWith(span);
    });
    syncFromVisual();
  });
  richToolbar.querySelector('[data-font-size]').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  richToolbar.querySelector('[data-font-size]').addEventListener('input', (event) => {
    if (/^\d+(?:\.\d+)?$/.test(event.target.value)) {
      event.target.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  richToolbar.querySelector('[data-font-size]').addEventListener('blur', (event) => {
    event.target.dispatchEvent(new Event('change', { bubbles: true }));
  });
  richToolbar.querySelector('[data-font-family]').addEventListener('change', (event) => {
    const fontFamily = event.target.value;
    const selection = window.getSelection();
    const node = selection?.anchorNode?.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection?.anchorNode?.parentElement;
    const block = activeBlock || editableBlock(node);
    if (!block) return;
    if (fontFamily) block.style.fontFamily = fontFamily;
    else block.style.removeProperty('font-family');
    syncFromVisual();
    updateToolbarState();
  });
  richToolbar.querySelector('[data-list]').addEventListener('change', (event) => {
    if (!event.target.value) return;
    visualEditor.focus();
    if (event.target.value === 'disc') document.execCommand('insertUnorderedList', false, null);
    else {
      document.execCommand('insertOrderedList', false, null);
      const node = window.getSelection()?.anchorNode?.nodeType === Node.ELEMENT_NODE ? window.getSelection().anchorNode : window.getSelection()?.anchorNode?.parentElement;
      node?.closest('ol')?.style.setProperty('list-style-type', event.target.value);
    }
    syncFromVisual();
  });
  richToolbar.querySelector('input[type="color"]').addEventListener('input', (event) => {
    visualEditor.focus();
    document.execCommand('foreColor', false, event.target.value);
    syncFromVisual();
  });
  richToolbar.querySelectorAll('[data-table-color]').forEach((input) => input.addEventListener('input', (event) => {
    const table = currentTable();
    if (!table) return;
    table.querySelectorAll(event.target.dataset.tableColor === 'head' ? 'th' : 'td').forEach((cell) => { cell.style.backgroundColor = event.target.value; });
    syncFromVisual();
  }));
  chapterList.addEventListener('click', () => setTimeout(() => {
    if (!visualEditor.hidden) visualEditor.innerHTML = htmlEditor.value;
  }, 0));
  setMode('visual');
  chapterControls.classList.add('active');
});

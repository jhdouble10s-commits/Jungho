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
  .drafts-panel { display:grid; gap:5px; margin:12px 0 0; padding:0 2px; }.drafts-panel[hidden] { display:none; }.drafts-title { padding:0 10px 4px; color:var(--sub); font-size:11px; font-weight:700; }.draft-item { width:100%; overflow:hidden; border:1px solid var(--line); border-radius:8px; padding:8px 10px; background:transparent; color:var(--text); font:600 12px inherit; text-align:left; text-overflow:ellipsis; white-space:nowrap; cursor:pointer; }.draft-item:hover { border-color:var(--accent); color:var(--accent); }
  .html-validation { max-width:300px; overflow:hidden; color:#ff9c75; font-size:11px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }.html-validation[hidden] { display:none; }.code-editor { display:grid; grid-template-columns:46px minmax(0,1fr); overflow:hidden; border:1px solid var(--line); border-radius:10px; background:var(--bg); }.code-editor .line-numbers { min-height:610px; margin:0; padding:10px 8px; overflow:hidden; border-right:1px solid var(--line); color:var(--sub); font:13px/1.65 Consolas,"Courier New",monospace; text-align:right; user-select:none; white-space:pre; }.code-editor .code { height:610px!important; min-width:0; border:0!important; border-radius:0!important; box-shadow:none!important; }.status { position:relative; padding-right:42px!important; }.status-close { position:absolute; top:50%; right:10px; width:24px; height:24px; transform:translateY(-50%); border:0; border-radius:6px; background:transparent; color:currentColor; font-size:20px; line-height:20px; cursor:pointer; }.status-close:hover { background:#00000018; }
  .html-validation { max-width:300px; overflow:hidden; color:#ff9c75; font-size:11px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }.html-validation[hidden] { display:none; }.fields input[type="checkbox"] { width:18px!important; height:18px; padding:0!important; box-shadow:none!important; }.code-editor { display:grid; grid-template-columns:46px minmax(0,1fr); overflow:hidden; border:1px solid var(--line); border-radius:10px; background:var(--bg); }.code-editor .line-numbers { min-height:610px; margin:0; padding:10px 8px; overflow:hidden; border-right:1px solid var(--line); color:var(--sub); font:13px/1.65 Consolas,"Courier New",monospace; text-align:right; user-select:none; white-space:pre; }.code-editor .code { height:610px!important; min-width:0; border:0!important; border-radius:0!important; box-shadow:none!important; }.status { position:relative; padding-right:42px!important; }.status-close { position:absolute; top:50%; right:10px; width:24px; height:24px; transform:translateY(-50%); border:0; border-radius:6px; background:transparent; color:currentColor; font-size:20px; line-height:20px; cursor:pointer; }.status-close:hover { background:#00000018; }
  .sidebar-toggle { position:absolute; top:18px; right:16px; width:32px; height:32px; border:1px solid var(--line); border-radius:9px; background:var(--surface-2); color:var(--text); font-size:18px; cursor:pointer; z-index:20; }
  .theme-settings { margin-top:auto; padding:16px 10px; border-top:1px solid var(--line); color:var(--sub); font-size:12px; font-weight:700; }
  .theme-settings div { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:10px; }.theme-settings button { border:1px solid var(--line); border-radius:7px; padding:7px 4px; background:var(--surface-2); color:var(--text); font:600 11px inherit; cursor:pointer; }.theme-settings button:hover { border-color:var(--accent); color:var(--accent); }
  .sidebar-hidden { grid-template-columns:0 minmax(0,1fr); }.sidebar-hidden .side { padding:0!important; overflow:visible; border:0; }.sidebar-hidden .side>*:not(.sidebar-toggle) { display:none; }.sidebar-hidden .sidebar-toggle { position:fixed; left:16px; right:auto; background:var(--surface); }
  main { min-width:0; max-width:1680px!important; padding:24px 32px 42px!important; }.top { min-width:0; display:flex!important; align-items:center; justify-content:flex-end!important; min-height:48px; margin:0 0 18px!important; padding:6px 14px!important; background:var(--surface)!important; border:1px solid var(--line)!important; border-radius:14px!important; box-shadow:none!important; }
  .primary { padding:8px 12px!important; border-radius:8px!important; background:var(--accent)!important; color:#fff!important; font-size:12px!important; line-height:1.2; box-shadow:none!important; }.primary:hover { transform:none!important; filter:brightness(1.08); }
  .book-inline { flex:1; margin-right:14px; }.book-inline .settings { max-width:none!important; padding:0!important; background:none!important; border:0!important; box-shadow:none!important; }.book-inline section { display:flex; align-items:center; gap:10px; }.book-inline .field { display:flex; align-items:center; gap:7px; margin:0!important; }.book-inline label { margin:0!important; white-space:nowrap; color:var(--sub)!important; font-size:clamp(12px,.73vw,18px)!important; }.book-inline input { width:130px!important; padding:3.5px 8px!important; }.book-inline .field:first-child input { width:195px!important; }.book-inline .cover { display:contents!important; border:0!important; padding:0!important; }.book-inline #coverInput,.book-inline .cover img { display:none!important; }.book-inline .cover-upload-button { display:inline-flex!important; align-items:center; height:29px; padding:0 10px; border:1px solid var(--accent)!important; border-radius:7px; background:var(--accent-soft); color:var(--accent)!important; font-size:12px!important; font-weight:700; cursor:pointer; }.book-inline .hint { display:none; }
  .grid { --chapter-width:270px; --preview-width:440px; min-width:0; max-width:100%; position:relative; grid-template-columns:var(--chapter-width) minmax(420px,1fr) var(--preview-width)!important; gap:16px!important; }.panel-resize-handle { position:absolute; top:0; bottom:0; z-index:10; width:14px; transform:translateX(-7px); cursor:col-resize; touch-action:none; }.panel-resize-handle::after { content:''; position:absolute; top:20%; bottom:20%; left:6px; width:2px; border-radius:2px; background:transparent; transition:background .15s; }.panel-resize-handle:hover::after,.panel-resize-handle.is-resizing::after { background:var(--accent); }.card { min-width:0; background:var(--surface)!important; border-color:var(--line)!important; box-shadow:none!important; }.editor,.preview-card { min-width:0; padding:18px!important; }.head { padding:0!important; border:0!important; }.left-tabs { display:grid; grid-template-columns:1fr 1fr; gap:4px; padding:8px; border-bottom:1px solid var(--line); }.left-tab { border:0; border-radius:8px; padding:9px 6px; background:transparent; color:var(--sub); font:700 12px inherit; cursor:pointer; }.left-tab.active { background:var(--accent-soft); color:var(--accent); }
  .chapter-card { display:flex; flex-direction:column; }.left-tabs { grid-template-columns:repeat(3,1fr)!important; }.left-panel-host { position:relative; flex:1; min-height:0; overflow:hidden; }.left-panel { display:none!important; position:absolute; inset:0; overflow:auto; }.left-panel.active { display:block!important; }.chapters { padding:8px!important; }.chapter { position:relative; padding-left:34px!important; }.toc-eye { position:absolute; left:7px; top:50%; transform:translateY(-50%); border:0; background:transparent; color:var(--sub); cursor:pointer; }.toc-eye.is-hidden { opacity:.35; }.add { width:calc(100% - 16px)!important; margin:7px 8px 13px!important; background:transparent!important; border-color:var(--accent)!important; color:var(--accent)!important; }.left-panel#cssPanel,.left-panel#assetsPanel { padding:12px!important; }.left-panel#cssPanel section { padding:0!important; }.left-panel#cssPanel .css { height:520px!important; }.left-panel#cssPanel #images { display:none!important; }.left-panel#cssPanel .hint,.asset-hint { color:var(--sub)!important; }.asset-upload { display:flex; align-items:center; justify-content:center; width:100%; margin-bottom:10px; border:1px dashed var(--accent); border-radius:8px; padding:10px; color:var(--accent); font-size:12px; font-weight:700; cursor:pointer; }.asset-hint { margin:0 0 10px; font-size:11px; line-height:1.5; }.asset-row { display:flex; align-items:center; gap:6px; margin:5px 0; }.asset-row .draft-item { flex:1; }.asset-insert { width:28px; height:28px; border:1px solid var(--accent); border-radius:7px; background:var(--accent-soft); color:var(--accent); font-size:18px; cursor:pointer; }.draft-row { display:flex; gap:4px; }.draft-row .draft-item { flex:1; }.draft-delete { width:30px; border:1px solid var(--line); border-radius:8px; background:transparent; color:#ff9c75; cursor:pointer; }.cover-chapter { display:flex!important; align-items:center; gap:8px; }.cover-chapter::before { content:'▧'; color:var(--accent); font-size:14px; }
  .editor-controls { min-width:0; display:flex; align-items:center; gap:10px; margin:0 0 14px; }.editor-mode { display:flex; flex:none; align-items:center; gap:4px; padding:4px; border:1px solid var(--line); border-radius:10px; background:var(--bg); }.editor-mode button { border:0; border-radius:7px; padding:7px 10px; background:transparent; color:var(--sub); font:700 12px inherit; cursor:pointer; white-space:nowrap; }.editor-mode button.active { background:var(--accent-soft); color:var(--accent); }.toolbar-viewport { position:relative; min-width:0; flex:1; overflow:hidden; }.rich-toolbar { display:flex; flex-wrap:nowrap; align-items:center; gap:6px; min-width:0; overflow:hidden; padding:5px 44px; margin:0; border:1px solid var(--line); border-radius:10px; background:var(--surface-2); scrollbar-width:none; }.rich-toolbar::-webkit-scrollbar { display:none; }.toolbar-viewport::before,.toolbar-viewport::after { display:none; content:''; pointer-events:none; position:absolute; top:1px; bottom:1px; z-index:1; width:44px; }.toolbar-viewport.show-previous::before,.toolbar-viewport.show-next::after { display:block; }.toolbar-viewport::before { left:38px; background:linear-gradient(90deg,var(--surface-2),transparent); }.toolbar-viewport::after { right:38px; background:linear-gradient(90deg,transparent,var(--surface-2)); }.toolbar-previous,.toolbar-next { position:absolute; top:50%; z-index:2; width:29px; height:29px; transform:translateY(-50%); border:1px solid var(--accent); border-radius:7px; background:var(--surface-2); color:var(--accent); font:700 20px/22px system-ui; cursor:pointer; }.toolbar-previous { left:5px; }.toolbar-next { right:5px; }.toolbar-previous:hover,.toolbar-next:hover { background:var(--accent-soft); }.rich-toolbar button { min-width:30px; border:1px solid var(--line); border-radius:6px; padding:5px 7px; background:var(--bg); color:var(--text); font:700 12px inherit; cursor:pointer; white-space:nowrap; }.rich-toolbar button:hover { border-color:var(--accent); color:var(--accent); }.rich-toolbar input { width:31px!important; height:28px; padding:2px!important; cursor:pointer; }.rich-toolbar select { height:29px; flex:none; border:1px solid var(--line); border-radius:6px; padding:0 6px; background:var(--bg); color:var(--text); font:600 11px inherit; cursor:pointer; }.rich-toolbar .tool-separator { width:1px; height:22px; flex:none; background:var(--line); }.rich-editor { min-height:610px; padding:18px; border:1px solid var(--line); border-radius:10px; background:var(--bg); color:var(--text); line-height:1.8; outline:none; overflow:auto; }.rich-editor:focus { border-color:var(--accent); box-shadow:0 0 0 3px #ff510030; }.rich-editor img { max-width:100%; height:auto; }.rich-editor table { border-collapse:collapse; max-width:100%; }.rich-editor td,.rich-editor th { min-width:72px; border:1px solid var(--sub); padding:6px; }
  .preview-card .head { display:flex; align-items:center; justify-content:space-between; gap:10px; }.device-controls { display:flex; align-items:center; gap:6px; }.device-controls select { max-width:118px; height:28px; border:1px solid var(--line); border-radius:6px; padding:0 5px; background:var(--bg); color:var(--text); font:600 11px inherit; cursor:pointer; }.preview-card { overflow:hidden; }.preview .cover-preview-page { display:flex; align-items:center; justify-content:center; min-height:100%; }.preview .cover-preview-page img { display:block; max-width:100%; max-height:100%; object-fit:contain; }.preview[data-device-preview="true"] { box-sizing:content-box; flex:none; margin:0 auto; border:8px solid #1b1b1e!important; border-radius:22px; box-shadow:0 10px 30px #00000045; transition:width .2s,height .2s; }
  .rich-toolbar button.active { border-color:var(--accent); background:var(--accent-soft); color:var(--accent); }.rich-toolbar button svg { display:block; width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }.rich-toolbar input[data-font-size] { width:62px!important; height:29px; flex:none; font-size:11px!important; }.rich-toolbar input[data-table-color] { width:29px!important; height:29px; flex:none; }.table-color-control { display:flex; align-items:center; gap:4px; height:29px; flex:none; }.rich-toolbar .tool-label { flex:none; color:var(--sub); font-size:12px; line-height:29px; white-space:nowrap; }
  .rich-editor { height:clamp(420px,calc(100vh - 310px),900px); min-height:0; }.preview-card { position:sticky; top:24px; align-self:start; max-height:calc(100vh - 48px); display:flex; flex-direction:column; overflow:hidden; }.preview-card .preview { flex:none; }.preview .preview-focus { background:#ff510018; outline:1px solid #ff5100aa; outline-offset:4px; border-radius:4px; transition:background .15s; }.preview mark.preview-context { background:#ff510052; color:inherit; border-radius:2px; padding:0 1px; }
  h1,h2,label { color:var(--text)!important; } input,textarea { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; } input:focus,textarea:focus { border-color:var(--accent)!important; box-shadow:0 0 0 3px #ff510030!important; }.secondary { background:var(--surface-2)!important; border-color:var(--line)!important; color:var(--text)!important; }.danger { color:#ff8660!important; }.chapter { color:var(--text)!important; }.chapter:hover { background:var(--surface-2)!important; }.chapter.active { background:var(--accent-soft)!important; color:var(--accent)!important; }.preview { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; }.preview-card .head { padding:0 0 12px!important; border-bottom:1px solid var(--line)!important; margin-bottom:12px; }.code { height:610px!important; }
  @media(max-width:1550px) { .grid { grid-template-columns:minmax(210px,var(--chapter-width)) minmax(0,1fr)!important; }.panel-resize-handle { display:none; }.preview-card { grid-column:1/-1; position:static; max-height:none; }.preview-card .preview { margin:auto; }.book-inline { min-width:0; overflow:hidden; } }
  @media(max-width:1050px) { .grid { grid-template-columns:240px minmax(0,1fr)!important; }.panel-resize-handle { display:none; }.preview-card { grid-column:1/-1; }.book-inline .field:nth-child(3) { display:none; } }
  @media(max-width:700px) { .app { grid-template-columns:1fr!important; }.side { display:none; } main { padding:14px!important; }.top { align-items:stretch!important; flex-direction:column; }.book-inline { margin:0; }.book-inline section { flex-wrap:wrap; }.book-inline input { width:110px!important; }.primary { align-self:flex-end; }.grid { display:block!important; }.editor,.preview-card { margin-top:16px; }.editor-controls { align-items:stretch; flex-direction:column; }.rich-toolbar { flex-wrap:wrap; }.left-panel#cssPanel .css { height:260px!important; } }
  .side nav { position:relative; }.new-book { position:absolute; top:7px; right:7px; z-index:2; width:28px; height:28px; border:1px solid var(--accent); border-radius:7px; background:var(--surface); color:var(--accent); font-size:19px; line-height:20px; cursor:pointer; }.new-book:hover { background:var(--accent-soft); }.chapter { padding-left:10px!important; padding-right:38px!important; }.chapter::after { content:''; position:absolute; right:11px; top:50%; width:16px; height:16px; transform:translateY(-50%); background:var(--accent); -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-width='2' d='M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z'/%3E%3Ccircle cx='12' cy='12' r='2.5' fill='black'/%3E%3C/svg%3E") center/contain no-repeat; mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-width='2' d='M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z'/%3E%3Ccircle cx='12' cy='12' r='2.5' fill='black'/%3E%3C/svg%3E") center/contain no-repeat; }.chapter.is-toc-hidden { color:var(--sub)!important; background:transparent!important; }.chapter.is-toc-hidden::after { background:#777; opacity:1; -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-width='2' d='M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z M3 3l18 18'/%3E%3Ccircle cx='12' cy='12' r='2.5' fill='black'/%3E%3C/svg%3E") center/contain no-repeat; mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='black' stroke-width='2' d='M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z M3 3l18 18'/%3E%3Ccircle cx='12' cy='12' r='2.5' fill='black'/%3E%3C/svg%3E") center/contain no-repeat; }.asset-rename { width:28px; height:28px; border:1px solid var(--line); border-radius:7px; background:var(--surface-2); color:var(--sub); font-size:15px; cursor:pointer; }.asset-rename:hover { border-color:var(--accent); color:var(--accent); }.fields select { height:36px; width:100%; border:1px solid var(--line); border-radius:8px; padding:0 30px 0 10px; background:var(--bg); color:var(--text); font:600 13px inherit; cursor:pointer; appearance:auto; }.fields select:focus { border-color:var(--accent); box-shadow:0 0 0 3px #ff510030; outline:0; }.editor > .toolbar label[for="image"] { display:none!important; }.css-save { width:100%; margin:0 0 10px; padding:8px; font-size:12px; }.status.ok,.status.error { position:fixed!important; top:20px; right:20px; z-index:1000; display:flex!important; align-items:center; min-height:46px; max-width:min(440px,calc(100vw - 40px)); margin:0!important; padding:12px 44px 12px 15px!important; border:1px solid #ffffff38; border-radius:11px; background:#0000001a!important; color:#fff!important; box-shadow:0 14px 36px #00000028; -webkit-backdrop-filter:blur(30px); backdrop-filter:blur(30px); opacity:1; transform:translateY(0); transition:opacity .28s ease,transform .28s ease; }.status.error { border-color:#ff8b72aa; }.status.is-leaving { opacity:0; transform:translateY(-8px); }
  .fields { grid-template-columns:minmax(0,1fr) minmax(170px,.3fr)!important; align-items:end; }.fields > div:not(.full) { display:flex; min-width:0; flex-direction:column; }.fields > div:not(.full) label { height:16px; margin-bottom:6px!important; font-size:12px!important; line-height:16px!important; }.fields > div:not(.full) input,.fields > div:not(.full) select { height:36px!important; min-height:36px; padding:0 10px!important; }.chapter::after { background:#FF5100!important; }.chapter.is-toc-hidden::after { background:#707078!important; }.chapter.is-toc-hidden { color:#707078!important; }
  .code-editor .code { overflow:auto!important; white-space:pre!important; }.preview p,.preview h1,.preview h2,.preview h3,.preview h4,.preview h5,.preview li,.preview blockquote,.preview td,.preview th { cursor:text; }.fields { position:relative; grid-template-columns:minmax(0,1fr) minmax(170px,.3fr)!important; }.fields.is-custom-width { grid-template-columns:minmax(220px,min(var(--chapter-title-width),calc(100% - 182px))) minmax(170px,1fr)!important; }.field-resize-handle { position:absolute; top:0; bottom:auto; left:0; z-index:4; width:14px; height:58px; transform:translateX(-7px); cursor:col-resize; touch-action:none; }.field-resize-handle::after { content:''; position:absolute; top:20px; bottom:2px; left:6px; width:2px; border-radius:2px; background:var(--line); transition:background .15s; }.field-resize-handle:hover::after,.field-resize-handle.is-resizing::after { background:var(--accent); }
  .code-editor .code { overflow:auto!important; white-space:pre-wrap!important; overflow-wrap:break-word; }
  @media(min-width:1921px) {
    main { max-width:none!important; width:100%!important; margin:0!important; padding:clamp(28px,2vw,72px)!important; }
    .grid { --chapter-width:clamp(270px,16vw,480px); --preview-width:minmax(480px,1fr); grid-template-columns:var(--chapter-width) minmax(620px,1.65fr) var(--preview-width)!important; gap:clamp(16px,1vw,30px)!important; }
    .top { min-height:clamp(48px,3.2vw,76px); padding:clamp(6px,.45vw,12px) clamp(14px,1.1vw,28px)!important; }
    .code { height:clamp(610px,48vw,1080px)!important; }.preview { height:clamp(680px,53vw,1180px)!important; }
    .book-inline input { width:clamp(130px,8vw,240px)!important; padding:clamp(3.5px,.25vw,6px)!important; }.book-inline .field:first-child input { width:clamp(195px,12vw,360px)!important; }
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
  let chapterControls = chapterList.parentElement;
  const preview = $('#preview');
  const previewCard = preview.closest('.preview-card');
  const previewHeader = previewCard.querySelector('.head');
  const grid = chapterCard.parentElement;
  const fitChapterPanelToViewport = () => {
    const topOffset = chapterCard.getBoundingClientRect().top;
    const height = Math.max(260, window.innerHeight - topOffset - 24);
    chapterCard.style.height = `${Math.round(height)}px`;
    chapterCard.style.maxHeight = `${Math.round(height)}px`;
  };
  window.addEventListener('resize', fitChapterPanelToViewport);
  requestAnimationFrame(fitChapterPanelToViewport);
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

  const coverInput = $('#coverInput');
  const coverPreview = $('#coverPreview');
  const coverField = coverInput.closest('.field');
  const coverLabel = coverField.querySelector('label');
  coverLabel.classList.add('cover-upload-button');
  coverLabel.textContent = '표지 이미지';
  const htmlValidation = document.createElement('span');
  htmlValidation.className = 'html-validation';
  htmlValidation.hidden = true;
  coverField.append(htmlValidation);
  const showCoverPreview = () => {
    const coverSource = coverPreview.getAttribute('src');
    if (!coverSource) return;
    preview.replaceChildren();
    const coverPage = document.createElement('div');
    coverPage.className = 'cover-preview-page';
    const image = document.createElement('img');
    image.src = coverSource;
    image.alt = '표지 이미지';
    coverPage.append(image);
    preview.append(coverPage);
  };
  const renderCoverChapter = () => {
    const existing = chapterList.querySelector('.cover-chapter');
    if (!coverPreview.getAttribute('src')) { existing?.remove(); return; }
    if (existing) return;
    const coverChapter = document.createElement('button');
    coverChapter.type = 'button';
    coverChapter.className = 'chapter cover-chapter';
    coverChapter.textContent = '표지';
    coverChapter.addEventListener('click', (event) => {
      event.stopPropagation();
      chapterList.querySelectorAll('.chapter').forEach((chapter) => chapter.classList.toggle('active', chapter === coverChapter));
      showCoverPreview();
    });
    chapterList.prepend(coverChapter);
  };
  new MutationObserver(() => {
    renderCoverChapter();
    showCoverPreview();
  }).observe(coverPreview, { attributes:true, attributeFilter:['src'] });
  new MutationObserver(renderCoverChapter).observe(chapterList, { childList:true });

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
      <button class="left-tab" type="button" data-panel="assetsPanel">이미지</button>
    </div>
  `);
  chapterCard.classList.add('chapter-card');
  const panelHost = document.createElement('div');
  panelHost.className = 'left-panel-host';
  chapterControls = document.createElement('div');
  chapterControls.id = 'chaptersPanel';
  chapterControls.className = 'left-panel active';
  chapterControls.append(chapterList, addChapter);
  const assetsPanel = document.createElement('div');
  assetsPanel.id = 'assetsPanel';
  assetsPanel.className = 'left-panel';
  assetsPanel.innerHTML = '<label class="asset-upload" for="image">이미지·아이콘 업로드</label><p class="asset-hint">PNG, JPG, GIF, SVG 파일을 업로드해 본문 또는 아이콘으로 사용하세요.</p><p class="asset-hint">본문 삽입 예시: <code>&lt;img src="images/파일명.png" alt="이미지 설명"&gt;</code></p><ul id="assetList" class="images"></ul>';
  panelHost.append(chapterControls, cssSettings, assetsPanel);
  chapterCard.append(panelHost);

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
  htmlEditor.wrap = 'soft';
  const htmlField = htmlEditor.closest('.full');
  const xhtmlDiagnostics = document.createElement('div');
  xhtmlDiagnostics.className = 'xhtml-diagnostics';
  xhtmlDiagnostics.hidden = true;
  xhtmlDiagnostics.setAttribute('role', 'status');
  htmlField.append(xhtmlDiagnostics);
  const editorFields = htmlEditor.closest('.fields');
  const tocLevel = $('#clevel');
  const tocField = tocLevel.parentElement;
  tocField.querySelector('label').textContent = '상위 목차';
  tocLevel.hidden = true;
  tocLevel.value = 1;
  const parentToc = document.createElement('select');
  parentToc.setAttribute('aria-label', '상위 목차 선택');
  tocField.append(parentToc);
  const fieldResizeHandle = document.createElement('div');
  fieldResizeHandle.className = 'field-resize-handle';
  fieldResizeHandle.title = '장 제목과 상위 목차 영역 너비 조절';
  editorFields.append(fieldResizeHandle);
  const savedFieldWidth = Number(localStorage.getItem('epub-chapter-title-width'));
  if (Number.isFinite(savedFieldWidth) && savedFieldWidth > 220) {
    editorFields.classList.add('is-custom-width');
    editorFields.style.setProperty('--chapter-title-width', `${savedFieldWidth}px`);
  }
  const positionFieldResizeHandle = () => {
    const titleField = editorFields.querySelector(':scope > div');
    if (!titleField) return;
    const titleBounds = titleField.getBoundingClientRect();
    const tocBounds = tocField.getBoundingClientRect();
    const fieldsBounds = editorFields.getBoundingClientRect();
    fieldResizeHandle.style.left = `${Math.round((titleBounds.right + tocBounds.left) / 2 - fieldsBounds.left)}px`;
  };
  new ResizeObserver(positionFieldResizeHandle).observe(editorFields);
  requestAnimationFrame(positionFieldResizeHandle);
  fieldResizeHandle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    fieldResizeHandle.setPointerCapture(event.pointerId);
    fieldResizeHandle.classList.add('is-resizing');
  });
  fieldResizeHandle.addEventListener('pointermove', (event) => {
    if (!fieldResizeHandle.hasPointerCapture(event.pointerId)) return;
    const bounds = editorFields.getBoundingClientRect();
    const width = Math.max(220, Math.min(bounds.width - 180, event.clientX - bounds.left));
    editorFields.classList.add('is-custom-width');
    editorFields.style.setProperty('--chapter-title-width', `${Math.round(width)}px`);
    requestAnimationFrame(positionFieldResizeHandle);
  });
  const stopFieldResize = (event) => {
    if (!fieldResizeHandle.hasPointerCapture(event.pointerId)) return;
    fieldResizeHandle.releasePointerCapture(event.pointerId);
    fieldResizeHandle.classList.remove('is-resizing');
    const width = Math.round(editorFields.querySelector(':scope > div')?.getBoundingClientRect().width || 0);
    if (width) localStorage.setItem('epub-chapter-title-width', String(width));
    positionFieldResizeHandle();
  };
  fieldResizeHandle.addEventListener('pointerup', stopFieldResize);
  fieldResizeHandle.addEventListener('pointercancel', stopFieldResize);
  const tocExcluded = new Set();
  const parentTocMap = new Map();
  const activeChapterIndex = () => {
    return Number(chapterList.querySelector('.chapter.active[data-i]')?.dataset.i || 0);
  };
  let arrangingChapters = false;
  const chapterLabel = (chapter) => Array.from(chapter.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent.trim()).join(' ').trim() || '제목 없는 장';
  const isDescendantOf = (index, ancestor) => {
    const seen = new Set();
    let parent = parentTocMap.get(index);
    while (parent !== undefined && !seen.has(parent)) {
      if (parent === ancestor) return true;
      seen.add(parent);
      parent = parentTocMap.get(parent);
    }
    return false;
  };
  const arrangeChapterList = () => {
    if (arrangingChapters) return;
    const chapters = Array.from(chapterList.querySelectorAll('.chapter[data-i]'));
    const available = new Set(chapters.map((chapter) => Number(chapter.dataset.i)));
    parentTocMap.forEach((parent, child) => {
      if (!available.has(parent) || parent === child || isDescendantOf(parent, child)) parentTocMap.delete(child);
    });
    const ordered = [];
    const visit = (parent, depth) => {
      let number = 0;
      chapters.filter((chapter) => (parentTocMap.get(Number(chapter.dataset.i)) ?? null) === parent).forEach((chapter) => {
        number += 1;
        chapter.querySelector('.num').textContent = String(number);
        chapter.style.setProperty('padding-left', `${10 + depth * 18}px`, 'important');
        chapter.style.setProperty('--toc-depth', depth);
        ordered.push(chapter);
        visit(Number(chapter.dataset.i), depth + 1);
      });
    };
    visit(null, 0);
    if (ordered.length !== chapters.length) return;
    if (!ordered.every((chapter, index) => chapter === chapters[index])) {
      arrangingChapters = true;
      ordered.forEach((chapter) => chapterList.append(chapter));
      arrangingChapters = false;
    }
  };
  const refreshChapterControls = () => {
    arrangeChapterList();
    const activeIndex = activeChapterIndex();
    const chapters = Array.from(chapterList.querySelectorAll('.chapter[data-i]'));
    parentToc.replaceChildren(new Option('최상위 목차', ''));
    chapters.forEach((chapter) => {
      const index = Number(chapter.dataset.i);
      if (index !== activeIndex && !tocExcluded.has(index) && !isDescendantOf(index, activeIndex)) parentToc.add(new Option(chapterLabel(chapter), String(index)));
      const visible = !tocExcluded.has(index);
      chapter.title = visible ? '오른쪽 눈 아이콘을 눌러 목차에서 숨길 수 있습니다.' : '오른쪽 눈 아이콘을 눌러 목차에 다시 표시할 수 있습니다.';
      chapter.classList.toggle('is-toc-hidden', !visible);
    });
    parentToc.value = parentTocMap.get(activeIndex) ?? '';
  };
  parentToc.addEventListener('change', () => {
    const index = Number(chapterList.querySelector('.chapter.active[data-i]')?.dataset.i || 0);
    if (parentToc.value) parentTocMap.set(index, Number(parentToc.value));
    else parentTocMap.delete(index);
    arrangeChapterList();
    refreshChapterControls();
  });
  chapterList.addEventListener('click', () => setTimeout(refreshChapterControls, 0));
  chapterList.addEventListener('click', (event) => {
    const chapter = event.target.closest('.chapter[data-i]');
    if (!chapter) return;
    const bounds = chapter.getBoundingClientRect();
    if (bounds.right - event.clientX > 38) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const index = Number(chapter.dataset.i);
    if (tocExcluded.has(index)) tocExcluded.delete(index);
    else tocExcluded.add(index);
    refreshChapterControls();
  }, true);
  new MutationObserver(() => setTimeout(refreshChapterControls, 0)).observe(chapterList, { childList:true, subtree:true });
  refreshChapterControls();
  const useAssetAwareExporter = true;
  exportButton.addEventListener('click', () => {
    if (useAssetAwareExporter) return;
    if (!tocExcluded.size && !parentTocMap.size) return;
    const originalMap = Array.prototype.map;
    Array.prototype.map = function patchedMap(callback, thisArg) {
      const looksLikeChapters = this.length && this.every((item) => item && typeof item.title === 'string' && typeof item.body === 'string');
      if (!looksLikeChapters) return originalMap.call(this, callback, thisArg);
      const items = originalMap.call(this, (chapter, index) => ({
        index,
        markup: callback.call(thisArg, chapter, index),
      })).filter((item) => !tocExcluded.has(item.index));
      const included = new Set(items.map((item) => item.index));
      const exportParent = (index) => {
        const seen = new Set([index]);
        let parent = parentTocMap.get(index);
        while (parent !== undefined && !seen.has(parent)) {
          if (included.has(parent)) return parent;
          seen.add(parent);
          parent = parentTocMap.get(parent);
        }
        return null;
      };
      const renderChildren = (parent) => items
        .filter((item) => exportParent(item.index) === parent)
        .map((item) => {
          const children = renderChildren(item.index);
          return children ? item.markup.replace(/<\/li>$/, `<ol>${children}</ol></li>`) : item.markup;
        }).join('');
      return [renderChildren(null)];
    };
    setTimeout(() => { Array.prototype.map = originalMap; }, 0);
  }, true);
  const codeEditor = document.createElement('div');
  codeEditor.className = 'code-editor';
  const lineNumbers = document.createElement('pre');
  lineNumbers.className = 'line-numbers';
  htmlEditor.before(codeEditor);
  codeEditor.append(lineNumbers, htmlEditor);
  const previewAssets = new Map();
  const cleanAssetName = (value) => value.trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ');
  const uniqueAssetName = (value, exclude = '') => {
    const cleaned = cleanAssetName(value) || 'image.png';
    const dot = cleaned.lastIndexOf('.');
    const base = dot > 0 ? cleaned.slice(0, dot) : cleaned;
    const extension = dot > 0 ? cleaned.slice(dot) : '';
    let candidate = `${base}${extension}`;
    let number = 2;
    while (previewAssets.has(candidate) && candidate !== exclude) {
      candidate = `${base}-${number}${extension}`;
      number += 1;
    }
    return candidate;
  };
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sanitiseSvg = (source) => source
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(["']).*?\1/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, '');
  const toPreviewAsset = async (file) => {
    if (file.type === 'image/svg+xml') {
      const safeSvg = sanitiseSvg(await file.text());
      return { type:file.type, url:`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(safeSvg)))}`, blob:new Blob([safeSvg], { type:'image/svg+xml' }) };
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ type:file.type, url:reader.result, blob:file });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const hydratePreviewAssets = () => {
    preview.querySelectorAll('img[src^="images/"]').forEach((image) => {
      const asset = previewAssets.get(image.getAttribute('src').slice(7));
      if (asset) image.src = asset.url;
    });
  };
  new MutationObserver(hydratePreviewAssets).observe(preview, { childList:true, subtree:true });
  const imageInput = $('#image');
  const renderAssetShelf = () => {
    const list = $('#assetList');
    list.replaceChildren();
    previewAssets.forEach((asset, name) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'draft-item';
      button.textContent = name;
      button.title = `${name} 미리보기`;
      button.addEventListener('click', () => {
        preview.replaceChildren();
        const image = document.createElement('img');
        image.src = asset.url;
        image.alt = name;
        preview.append(image);
      });
      item.className = 'asset-row';
      const insert = document.createElement('button');
      insert.type = 'button';
      insert.className = 'asset-insert';
      insert.textContent = '+';
      insert.title = '현재 커서 위치에 이미지 삽입';
      insert.addEventListener('click', () => insertImageTag(name));
      const rename = document.createElement('button');
      rename.type = 'button';
      rename.className = 'asset-rename';
      rename.textContent = '✎';
      rename.title = '이미지 파일명 변경';
      rename.addEventListener('click', () => renameAsset(name));
      item.append(button, insert, rename);
      list.append(item);
    });
  };
  imageInput.onchange = async (event) => {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      const name = uniqueAssetName(file.name);
      previewAssets.set(name, await toPreviewAsset(file));
    }
    renderAssetShelf();
    event.target.value = '';
  };
  const visualEditor = document.createElement('div');
  visualEditor.className = 'rich-editor';
  visualEditor.contentEditable = 'true';
  visualEditor.setAttribute('aria-label', '일반 편집기');
  visualEditor.hidden = true;
  let lastVisualRange = null;
  const rememberVisualRange = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount) lastVisualRange = selection.getRangeAt(0).cloneRange();
  };
  const insertImageTag = (name) => {
    const markup = `<img src="images/${name}" alt="">`;
    if (visualEditor.hidden) {
      htmlEditor.setRangeText(markup, htmlEditor.selectionStart, htmlEditor.selectionEnd, 'end');
      htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
      htmlEditor.focus();
      return;
    }
    visualEditor.focus();
    if (lastVisualRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(lastVisualRange);
    }
    document.execCommand('insertHTML', false, markup);
    syncFromVisual();
    refreshPreview();
  };
  const renameAsset = (oldName) => {
    const requested = window.prompt('이미지 파일명을 입력하세요.', oldName);
    if (requested === null) return;
    const extension = oldName.includes('.') ? oldName.slice(oldName.lastIndexOf('.')) : '';
    const nextName = uniqueAssetName(requested.includes('.') ? requested : `${requested}${extension}`, oldName);
    if (nextName === oldName) return;
    const asset = previewAssets.get(oldName);
    if (!asset) return;
    previewAssets.delete(oldName);
    previewAssets.set(nextName, asset);
    htmlEditor.value = htmlEditor.value.replace(new RegExp(`images/${escapeRegExp(oldName)}`, 'g'), `images/${nextName}`);
    if (!visualEditor.hidden) visualEditor.innerHTML = htmlEditor.value;
    htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
    renderAssetShelf();
    refreshPreview();
  };
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
    <button type="button" data-command="formatBlock" data-value="blockquote" title="인용" aria-label="인용"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 7.5H5.8A2.8 2.8 0 0 0 3 10.3V13a3 3 0 0 0 3 3h2.5V11H5.7M21 7.5h-2.7a2.8 2.8 0 0 0-2.8 2.8V13a3 3 0 0 0 3 3H21V11h-2.8"/></svg></button>
    <span class="tool-separator"></span>
    <button type="button" data-table title="2×2 표 삽입" aria-label="2×2 표 삽입"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 10h18M9 4v16M15 4v16"/></svg></button>
    <button type="button" data-table-action="row" title="선택한 표에 행 추가" aria-label="선택한 표에 행 추가"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1"/><path d="M3 8h18M12 18v5M9.5 20.5h5"/></svg></button>
    <button type="button" data-table-action="column" title="선택한 표에 열 추가" aria-label="선택한 표에 열 추가"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="12" height="18" rx="1"/><path d="M8 3v18M18 12h5M20.5 9.5v5"/></svg></button>
    <span class="table-color-control"><span class="tool-label">헤더</span><input type="color" data-table-color="head" value="#ffffff" aria-label="표 헤더 배경색"></span>
    <span class="table-color-control"><span class="tool-label">본문</span><input type="color" data-table-color="body" value="#ffffff" aria-label="표 본문 배경색"></span>
  `;
  const mode = document.createElement('div');
  mode.className = 'editor-mode';
  mode.innerHTML = '<button type="button" class="active" data-mode="visual">일반 편집</button><button type="button" data-mode="html">HTML 편집</button>';
  const editorControls = document.createElement('div');
  editorControls.className = 'editor-controls';
  const toolbarViewport = document.createElement('div');
  toolbarViewport.className = 'toolbar-viewport';
  const toolbarPrevious = document.createElement('button');
  toolbarPrevious.type = 'button';
  toolbarPrevious.className = 'toolbar-previous';
  toolbarPrevious.setAttribute('aria-label', '이전 편집 도구 보기');
  toolbarPrevious.textContent = '‹';
  const toolbarNext = document.createElement('button');
  toolbarNext.type = 'button';
  toolbarNext.className = 'toolbar-next';
  toolbarNext.setAttribute('aria-label', '다음 편집 도구 보기');
  toolbarNext.textContent = '›';
  toolbarViewport.append(richToolbar, toolbarPrevious, toolbarNext);
  editorControls.append(mode, toolbarViewport);
  editorFields.before(editorControls);
  editorFields.after(visualEditor);
  const updateToolbarNavigation = () => {
    const maxScroll = Math.max(0, richToolbar.scrollWidth - richToolbar.clientWidth);
    const canGoPrevious = richToolbar.scrollLeft > 2;
    const canGoNext = maxScroll > 2 && richToolbar.scrollLeft < maxScroll - 2;
    toolbarPrevious.hidden = !canGoPrevious;
    toolbarNext.hidden = !canGoNext;
    toolbarViewport.classList.toggle('show-previous', canGoPrevious);
    toolbarViewport.classList.toggle('show-next', canGoNext);
  };
  const scrollToolbar = (direction) => {
    const pageWidth = Math.max(120, richToolbar.clientWidth - 84);
    const maxScroll = Math.max(0, richToolbar.scrollWidth - richToolbar.clientWidth);
    richToolbar.scrollTo({
      left: Math.max(0, Math.min(maxScroll, richToolbar.scrollLeft + direction * pageWidth)),
      behavior: 'smooth',
    });
  };
  toolbarPrevious.addEventListener('click', () => scrollToolbar(-1));
  toolbarNext.addEventListener('click', () => {
    scrollToolbar(1);
  });
  richToolbar.addEventListener('scroll', updateToolbarNavigation);
  new ResizeObserver(updateToolbarNavigation).observe(richToolbar);
  requestAnimationFrame(updateToolbarNavigation);

  const draftStorageKey = 'epub-builder-drafts-v1';
  const assetDatabase = new Promise((resolve, reject) => {
    const request = indexedDB.open('epub-builder-assets', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('assets');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const supabaseUrl = 'https://htzojicodwueivybovhy.supabase.co';
  const supabasePublishableKey = 'sb_publishable_tgU1Ue4yOSJxG2Z6CTunPw_gvKhXtpq';
  let supabaseClient = null;
  let supabaseUser = null;
  const cloudReady = (async () => {
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.95.0/+esm');
      supabaseClient = createClient(supabaseUrl, supabasePublishableKey);
      let { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        const { data, error } = await supabaseClient.auth.signInAnonymously();
        if (error) throw error;
        session = data.session;
      }
      supabaseUser = session?.user || null;
      return supabaseClient;
    } catch (error) {
      console.warn('Supabase 연결을 사용할 수 없습니다.', error);
      return null;
    }
  })();
  const cloudAssetPath = (title, name) => `${supabaseUser.id}/${encodeURIComponent(title)}/${encodeURIComponent(name)}`;
  const saveDraftAssets = async (title) => {
    const database = await assetDatabase;
    const transaction = database.transaction('assets', 'readwrite');
    const store = transaction.objectStore('assets');
    previewAssets.forEach((asset, name) => store.put(asset.blob, `${title}:${name}`));
    await new Promise((resolve, reject) => { transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error); });
  };
  const loadDraftAssets = async (draft) => {
    previewAssets.clear();
    const database = await assetDatabase;
    const store = database.transaction('assets', 'readonly').objectStore('assets');
    for (const asset of draft.assets || []) {
      const blob = await new Promise((resolve) => { const request = store.get(`${draft.title}:${asset.name}`); request.onsuccess = () => resolve(request.result); request.onerror = () => resolve(null); });
      if (!blob) {
        const client = await cloudReady;
        if (client && supabaseUser) {
          const { data } = await client.storage.from('epub-assets').download(cloudAssetPath(draft.title, asset.name));
          blob = data || null;
        }
      }
      if (blob) previewAssets.set(asset.name, { type:asset.type, blob, url:URL.createObjectURL(blob) });
    }
    renderAssetShelf();
  };
  const deleteDraftAssets = async (draft) => {
    const database = await assetDatabase;
    const transaction = database.transaction('assets', 'readwrite');
    const store = transaction.objectStore('assets');
    (draft.assets || []).forEach((asset) => store.delete(`${draft.title}:${asset.name}`));
    await new Promise((resolve, reject) => { transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error); });
  };
  const saveCloudDraft = async (draft) => {
    const client = await cloudReady;
    if (!client || !supabaseUser) return;
    for (const asset of draft.assets) {
      const stored = previewAssets.get(asset.name);
      if (!stored?.blob) continue;
      const { error } = await client.storage.from('epub-assets').upload(
        cloudAssetPath(draft.title, asset.name), stored.blob,
        { contentType:asset.type, upsert:true },
      );
      if (error) throw error;
    }
    const { error } = await client.from('epub_drafts').upsert({
      owner_id:supabaseUser.id,
      title:draft.title,
      payload:draft,
      updated_at:new Date().toISOString(),
    }, { onConflict:'owner_id,title' });
    if (error) throw error;
  };
  const deleteCloudDraft = async (draft) => {
    const client = await cloudReady;
    if (!client || !supabaseUser) return;
    const paths = (draft.assets || []).map((asset) => cloudAssetPath(draft.title, asset.name));
    if (paths.length) await client.storage.from('epub-assets').remove(paths);
    await client.from('epub_drafts').delete().eq('owner_id', supabaseUser.id).eq('title', draft.title);
  };
  const deleteDraftAssetNames = async (title, names) => {
    if (!names.length) return;
    const database = await assetDatabase;
    const transaction = database.transaction('assets', 'readwrite');
    const store = transaction.objectStore('assets');
    names.forEach((name) => store.delete(`${title}:${name}`));
    await new Promise((resolve, reject) => { transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error); });
  };
  const draftButton = document.createElement('button');
  draftButton.type = 'button';
  draftButton.className = 'secondary';
  draftButton.textContent = '임시저장';
  exportButton.before(draftButton);
  const checkAllButton = document.createElement('button');
  checkAllButton.type = 'button';
  checkAllButton.className = 'secondary';
  checkAllButton.textContent = '전체 HTML 검사';
  exportButton.before(checkAllButton);
  const autoFixHtmlButton = document.createElement('button');
  autoFixHtmlButton.type = 'button';
  autoFixHtmlButton.className = 'secondary';
  autoFixHtmlButton.textContent = 'XHTML Format';
  autoFixHtmlButton.title = 'XHTML 들여쓰기, 태그 구조, self-closing 빈 태그를 정리합니다.';
  exportButton.before(autoFixHtmlButton);
  const cssSaveButton = document.createElement('button');
  cssSaveButton.type = 'button';
  cssSaveButton.className = 'secondary css-save';
  cssSaveButton.textContent = '공통 CSS 저장';
  cssSettings.querySelector('section')?.prepend(cssSaveButton);
  const draftsPanel = document.createElement('div');
  draftsPanel.className = 'drafts-panel';
  const editorTab = side.querySelector('.tab[data-view="editorView"]');
  const newBookButton = document.createElement('button');
  newBookButton.type = 'button';
  newBookButton.className = 'new-book';
  newBookButton.textContent = '+';
  newBookButton.title = '새 전자책 만들기';
  newBookButton.setAttribute('aria-label', '새 전자책 만들기');
  editorTab?.parentElement.append(newBookButton);
  editorTab?.parentElement.insertAdjacentElement('afterend', draftsPanel);
  let draftsExpanded = false;
  let openedDraftTitle = null;
  editorTab?.setAttribute('aria-expanded', 'false');
  editorTab?.addEventListener('click', (event) => {
    event.preventDefault();
    draftsExpanded = !draftsExpanded;
    editorTab.setAttribute('aria-expanded', String(draftsExpanded));
    renderDrafts();
  });
  const getDrafts = () => {
    try { return JSON.parse(localStorage.getItem(draftStorageKey) || '[]'); } catch { return []; }
  };
  const statusToast = $('#status');
  let statusTimer = null;
  let statusFadeTimer = null;
  const clearStatusTimers = () => {
    clearTimeout(statusTimer);
    clearTimeout(statusFadeTimer);
  };
  const scheduleStatusDismissal = () => {
    clearStatusTimers();
    statusToast.classList.remove('is-leaving');
    statusTimer = setTimeout(() => {
      statusToast.classList.add('is-leaving');
      statusFadeTimer = setTimeout(() => {
        statusToast.textContent = '';
        statusToast.className = 'status';
      }, 300);
    }, 3000);
  };
  statusToast.addEventListener('mouseenter', clearStatusTimers);
  statusToast.addEventListener('mouseleave', () => {
    if (statusToast.classList.contains('ok') || statusToast.classList.contains('error')) scheduleStatusDismissal();
  });
  const setStatus = (message, type = 'ok') => {
    statusToast.textContent = message;
    statusToast.className = `status ${type}`;
    scheduleStatusDismissal();
  };
  const setCurrentChapter = (chapter) => {
    $('#ctitle').value = chapter.title;
    $('#clevel').value = chapter.level;
    htmlEditor.value = chapter.body;
    htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
  };
  newBookButton.addEventListener('click', () => {
    while (chapterList.querySelectorAll('.chapter[data-i]').length > 1) $('#del').click();
    const starterChapter = { title:'들어가는 글', level:1, body:'<h1>들어가는 글</h1><p>여기에 본문을 작성하세요.</p>' };
    setCurrentChapter(starterChapter);
    visualEditor.innerHTML = starterChapter.body;
    $('#title').value = '';
    $('#author').value = '';
    $('#language').value = 'ko';
    $('#css').value = '';
    tocExcluded.clear();
    parentTocMap.clear();
    previewAssets.forEach((asset) => { if (asset.url?.startsWith('blob:')) URL.revokeObjectURL(asset.url); });
    previewAssets.clear();
    openedDraftTitle = null;
    draftButton.textContent = '임시저장';
    coverPreview.removeAttribute('src');
    coverPreview.hidden = true;
    renderAssetShelf();
    refreshChapterControls();
    refreshPreview();
    setStatus('새 전자책 편집을 시작했습니다.');
  });
  const collectDraft = () => {
    if (!visualEditor.hidden) syncFromVisual();
    const activeIndex = Number(chapterList.querySelector('.chapter.active[data-i]')?.dataset.i || 0);
    const count = chapterList.querySelectorAll('.chapter[data-i]').length;
    const chapters = [];
    for (let index = 0; index < count; index += 1) {
      chapterList.querySelector(`.chapter[data-i="${index}"]`)?.click();
      chapters.push({ title: $('#ctitle').value, level: Number($('#clevel').value), body: htmlEditor.value });
    }
    chapterList.querySelector(`.chapter[data-i="${activeIndex}"]`)?.click();
    return {
      title: $('#title').value.trim(),
      author: $('#author').value,
      language: $('#language').value,
      css: $('#css').value,
      chapters,
      activeIndex,
      tocExcluded: Array.from(tocExcluded),
      parentToc: Array.from(parentTocMap.entries()),
      coverSource: coverPreview.getAttribute('src') || '',
      assets: Array.from(previewAssets.entries()).map(([name, asset]) => ({ name, type:asset.type })),
    };
  };
  const epubText = (value) => new TextEncoder().encode(value);
  const epubEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[character]));
  const epubCrcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      table[index] = value >>> 0;
    }
    return table;
  })();
  const epubCrc = (bytes) => {
    let value = 0xffffffff;
    bytes.forEach((byte) => { value = epubCrcTable[(value ^ byte) & 255] ^ (value >>> 8); });
    return (value ^ 0xffffffff) >>> 0;
  };
  const epubU16 = (value) => [value & 255, value >>> 8 & 255];
  const epubU32 = (value) => [value & 255, value >>> 8 & 255, value >>> 16 & 255, value >>> 24 & 255];
  const createEpubZip = (files) => {
    const output = [];
    const directory = [];
    let offset = 0;
    files.forEach((file) => {
      const name = epubText(file.name);
      const data = file.data;
      const crc = epubCrc(data);
      const header = new Uint8Array([...epubU32(0x04034b50), ...epubU16(20), ...epubU16(0), ...epubU16(0), ...epubU16(0), ...epubU16(0), ...epubU32(crc), ...epubU32(data.length), ...epubU32(data.length), ...epubU16(name.length), ...epubU16(0), ...name]);
      output.push(header, data);
      directory.push(new Uint8Array([...epubU32(0x02014b50), ...epubU16(20), ...epubU16(20), ...epubU16(0), ...epubU16(0), ...epubU16(0), ...epubU16(0), ...epubU32(crc), ...epubU32(data.length), ...epubU32(data.length), ...epubU16(name.length), ...epubU16(0), ...epubU16(0), ...epubU16(0), ...epubU16(0), ...epubU32(0), ...epubU32(offset), ...name]));
      offset += header.length + data.length;
    });
    const directorySize = directory.reduce((total, item) => total + item.length, 0);
    output.push(...directory, new Uint8Array([...epubU32(0x06054b50), ...epubU16(0), ...epubU16(0), ...epubU16(files.length), ...epubU16(files.length), ...epubU32(directorySize), ...epubU32(offset), ...epubU16(0)]));
    return new Blob(output, { type:'application/epub+zip' });
  };
  const makeEpubNav = (chapters) => {
    const included = chapters.filter((_, index) => !tocExcluded.has(index));
    const visible = new Set(included.map((_, index) => chapters.indexOf(included[index])));
    const parentFor = (index) => {
      const seen = new Set([index]);
      let parent = parentTocMap.get(index);
      while (parent !== undefined && !seen.has(parent)) {
        if (visible.has(parent)) return parent;
        seen.add(parent);
        parent = parentTocMap.get(parent);
      }
      return null;
    };
    const items = included.map((chapter) => ({ chapter, index:chapters.indexOf(chapter) }));
    const render = (parent) => items.filter((item) => parentFor(item.index) === parent).map((item) => {
      const children = render(item.index);
      const link = `<a href="text/chapter-${String(item.index + 1).padStart(3, '0')}.xhtml">${epubEscape(item.chapter.title || '제목 없는 장')}</a>`;
      return `<li>${link}${children ? `<ol>${children}</ol>` : ''}</li>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>목차</title></head><body><nav epub:type="toc"><h1>목차</h1><ol>${render(null)}</ol></nav></body></html>`;
  };
  const exportAssetAwareEpub = async () => {
    const draft = collectDraft();
    const title = draft.title || '새 전자책';
    const language = draft.language || 'ko';
    const files = [
      { name:'mimetype', data:epubText('application/epub+zip') },
      { name:'META-INF/container.xml', data:epubText('<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>') },
      { name:'EPUB/styles/book.css', data:epubText(draft.css) },
    ];
    const manifest = ['<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>', '<item id="css" href="styles/book.css" media-type="text/css"/>'];
    const spine = [];
    if (draft.coverSource) {
      const coverBlob = await fetch(draft.coverSource).then((response) => response.blob());
      const coverExtension = coverBlob.type === 'image/png' ? 'png' : 'jpg';
      const coverName = `cover.${coverExtension}`;
      files.push({ name:`EPUB/images/${coverName}`, data:new Uint8Array(await coverBlob.arrayBuffer()) });
      files.push({ name:'EPUB/text/cover.xhtml', data:epubText(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>표지</title><link rel="stylesheet" type="text/css" href="../styles/book.css"/></head><body><img src="../images/${coverName}" alt="표지"/></body></html>`) });
      manifest.push(`<item id="cover-image" href="images/${coverName}" media-type="${coverBlob.type}" properties="cover-image"/>`, '<item id="cover-page" href="text/cover.xhtml" media-type="application/xhtml+xml"/>');
      spine.push('<itemref idref="cover-page" linear="no"/>');
    }
    for (let index = 0; index < draft.chapters.length; index += 1) {
      const chapter = draft.chapters[index];
      const filename = `chapter-${String(index + 1).padStart(3, '0')}.xhtml`;
      const body = normaliseXhtml(chapter.body).replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-f]+;)/gi, '&amp;').replace(/src=(['"])images\//g, 'src=$1../images/');
      files.push({ name:`EPUB/text/${filename}`, data:epubText(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${epubEscape(language)}"><head><meta charset="UTF-8"/><title>${epubEscape(chapter.title || title)}</title><link rel="stylesheet" type="text/css" href="../styles/book.css"/></head><body>${body}</body></html>`) });
      manifest.push(`<item id="chapter-${index + 1}" href="text/${filename}" media-type="application/xhtml+xml"/>`);
      spine.push(`<itemref idref="chapter-${index + 1}"/>`);
    }
    for (let index = 0; index < draft.assets.length; index += 1) {
      const asset = draft.assets[index];
      const stored = previewAssets.get(asset.name);
      if (!stored?.blob) continue;
      files.push({ name:`EPUB/images/${asset.name}`, data:new Uint8Array(await stored.blob.arrayBuffer()) });
      manifest.push(`<item id="image-${index + 1}" href="images/${epubEscape(asset.name)}" media-type="${epubEscape(asset.type || 'image/png')}"/>`);
    }
    files.push({ name:'EPUB/nav.xhtml', data:epubText(makeEpubNav(draft.chapters)) });
    files.push({ name:'EPUB/package.opf', data:epubText(`<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="${epubEscape(language)}"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="pub-id">urn:uuid:${crypto.randomUUID()}</dc:identifier><dc:title>${epubEscape(title)}</dc:title>${draft.author ? `<dc:creator>${epubEscape(draft.author)}</dc:creator>` : ''}<dc:language>${epubEscape(language)}</dc:language><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta></metadata><manifest>${manifest.join('')}</manifest><spine>${spine.join('')}</spine></package>`) });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(createEpubZip(files));
    link.download = `${title.replace(/[\\/:*?"<>|]/g, '-')}.epub`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    setStatus(`[${title}] EPUB 3.0 파일을 다운로드했습니다. 다운로드 폴더를 확인하세요.`);
  };
  exportButton.addEventListener('click', (event) => {
    if (!useAssetAwareExporter) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const errors = validateAllChapters();
    if (errors.length) {
      setStatus(`EPUB 내보내기 전에 HTML 오류 ${errors.length}건을 수정하세요.`, 'error');
      return;
    }
    exportAssetAwareEpub().catch((error) => setStatus(error.message || 'EPUB 파일을 만들지 못했습니다.', 'error'));
  }, true);
  const loadDraft = async (draft) => {
    if (!draft?.chapters?.length) return;
    while (chapterList.querySelectorAll('.chapter[data-i]').length > 1) $('#del').click();
    setCurrentChapter(draft.chapters[0]);
    draft.chapters.slice(1).forEach((chapter) => {
      addChapter.click();
      setCurrentChapter(chapter);
    });
    $('#title').value = draft.title;
    openedDraftTitle = draft.title;
    draftButton.textContent = '변경사항 저장';
    $('#author').value = draft.author || '';
    $('#language').value = draft.language || 'ko';
    $('#css').value = draft.css || '';
    tocExcluded.clear();
    (draft.tocExcluded || []).forEach((index) => tocExcluded.add(index));
    parentTocMap.clear();
    (draft.parentToc || []).forEach(([child, parent]) => parentTocMap.set(Number(child), Number(parent)));
    await loadDraftAssets(draft);
    const selected = Math.max(0, Math.min(draft.activeIndex || 0, draft.chapters.length - 1));
    chapterList.querySelector(`.chapter[data-i="${selected}"]`)?.click();
    refreshChapterControls();
    if (draft.coverSource) {
      coverPreview.src = draft.coverSource;
      coverPreview.hidden = false;
    }
    if (!visualEditor.hidden) visualEditor.innerHTML = htmlEditor.value;
    refreshPreview();
    hydratePreviewAssets();
    setStatus(`“${draft.title}” 임시저장본을 불러왔습니다.`);
  };
  const renderDrafts = () => {
    const drafts = getDrafts();
    draftsPanel.hidden = !drafts.length || !draftsExpanded;
    draftsPanel.replaceChildren();
    if (!drafts.length) return;
    drafts.forEach((draft) => {
      const row = document.createElement('div');
      row.className = 'draft-row';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'draft-item';
      button.textContent = draft.title;
      button.title = draft.title;
      button.addEventListener('click', () => loadDraft(draft));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'draft-delete';
      remove.title = '임시저장본 삭제';
      remove.setAttribute('aria-label', `${draft.title} 삭제`);
      remove.textContent = '🗑';
      remove.addEventListener('click', async (event) => {
        event.stopPropagation();
        if (!window.confirm(`“${draft.title}” 임시저장본을 정말 삭제할까요?`)) return;
        await deleteDraftAssets(draft);
        await deleteCloudDraft(draft).catch((error) => console.warn('Supabase 삭제 동기화 실패', error));
        localStorage.setItem(draftStorageKey, JSON.stringify(getDrafts().filter((item) => item.title !== draft.title)));
        if (openedDraftTitle === draft.title) {
          openedDraftTitle = null;
          draftButton.textContent = '임시저장';
        }
        renderDrafts();
        setStatus(`“${draft.title}” 임시저장본을 삭제했습니다.`);
      });
      row.append(button, remove);
      draftsPanel.append(row);
    });
  };
  const restoreCloudDrafts = async () => {
    const client = await cloudReady;
    if (!client || !supabaseUser) return;
    const { data, error } = await client
      .from('epub_drafts')
      .select('payload')
      .eq('owner_id', supabaseUser.id)
      .order('updated_at', { ascending:false });
    if (error || !data?.length) return;
    const merged = getDrafts();
    data.map((row) => row.payload).filter((draft) => draft?.title).forEach((draft) => {
      const index = merged.findIndex((item) => item.title === draft.title);
      if (index >= 0) merged[index] = draft;
      else merged.push(draft);
    });
    localStorage.setItem(draftStorageKey, JSON.stringify(merged));
    renderDrafts();
  };
  draftButton.addEventListener('click', async () => {
    const draft = collectDraft();
    const htmlErrors = validateAllChapters();
    if (!draft.title) { setStatus('책 제목을 입력한 뒤 임시저장하세요.', 'error'); return; }
    const drafts = getDrafts();
    const existingIndex = drafts.findIndex((item) => item.title === draft.title);
    const isUpdate = openedDraftTitle === draft.title && existingIndex >= 0;
    if (existingIndex >= 0 && !isUpdate) {
      setStatus('같은 책 제목의 임시저장본이 이미 있습니다.', 'error');
      return;
    }
    try {
      await saveDraftAssets(draft.title);
      if (isUpdate) {
        const existing = drafts[existingIndex];
        const currentNames = new Set(draft.assets.map((asset) => asset.name));
        await deleteDraftAssetNames(draft.title, (existing.assets || []).map((asset) => asset.name).filter((name) => !currentNames.has(name)));
        drafts[existingIndex] = draft;
        localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
        setStatus(`“${draft.title}” 변경사항을 저장했습니다.`);
      } else {
        localStorage.setItem(draftStorageKey, JSON.stringify([...drafts, draft]));
        openedDraftTitle = draft.title;
        draftButton.textContent = '변경사항 저장';
        setStatus(`“${draft.title}”을(를) 임시저장했습니다.`);
      }
      renderDrafts();
      if (htmlErrors.length) setStatus(`임시저장은 완료했지만 HTML 오류 ${htmlErrors.length}건이 있습니다.`, 'error');
      try {
        await saveCloudDraft(draft);
      } catch (error) {
        console.warn('Supabase 저장 동기화 실패', error);
        setStatus('브라우저에는 저장했지만 서버 동기화에 실패했습니다.', 'error');
      }
    } catch {
      setStatus('임시저장 공간이 부족합니다. 이미지 용량을 줄인 뒤 다시 시도하세요.', 'error');
    }
  });
  cssSaveButton.addEventListener('click', () => draftButton.click());
  renderDrafts();
  void restoreCloudDrafts();

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
  preview.addEventListener('click', (event) => {
    const previewBlock = event.target.closest(previewBlockSelector);
    if (!previewBlock || !preview.contains(previewBlock)) return;
    const index = Array.from(preview.querySelectorAll(previewBlockSelector)).indexOf(previewBlock);
    if (index < 0) return;
    focusPreviewBlock(index);
    if (!visualEditor.hidden) {
      const editorBlock = visualEditor.querySelectorAll(previewBlockSelector)[index];
      if (!editorBlock) return;
      const range = document.createRange();
      range.selectNodeContents(editorBlock);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      visualEditor.focus();
      rememberVisualRange();
      updateToolbarState();
      editorBlock.scrollIntoView({ block:'center', behavior:'smooth' });
      return;
    }
    const blocks = Array.from(htmlEditor.value.matchAll(/<(p|h[1-5]|li|blockquote|td|th)\b[^>]*>/gi));
    const sourceBlock = blocks[index];
    if (!sourceBlock) return;
    htmlEditor.focus();
    htmlEditor.setSelectionRange(sourceBlock.index, sourceBlock.index);
    const line = htmlEditor.value.slice(0, sourceBlock.index).split('\n').length - 1;
    htmlEditor.scrollTop = Math.max(0, line * 21 - htmlEditor.clientHeight / 2);
  });
  const xhtmlVoidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const normaliseXhtml = (source) => {
    // XML parser가 읽을 수 있도록 XHTML 빈 요소와 오타 난 여는 괄호를 먼저 보정합니다.
    const prepared = String(source || '')
      .replace(/<\s+([A-Za-z][\w:-]*)/g, '<$1')
      .replace(/<\s*(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b([^>]*?)>/gi, (_, tag, attrs) => `<${tag.toLowerCase()}${attrs.replace(/\s*\/\s*$/, '').trim() ? ` ${attrs.replace(/\s*\/\s*$/, '').trim()}` : ''} />`);
    const parser = new DOMParser();
    const documentSource = `<epub-fragment xmlns="http://www.w3.org/1999/xhtml">${prepared}</epub-fragment>`;
    const parsed = parser.parseFromString(documentSource, 'application/xhtml+xml');
    if (parsed.querySelector('parsererror')) return prepared;
    const serialised = new XMLSerializer().serializeToString(parsed.documentElement);
    const fragment = serialised
      .replace(/^<epub-fragment[^>]*>/, '')
      .replace(/<\/epub-fragment>$/, '')
      .replace(/\s*\/\s*>/g, ' />');
    // XMLSerializer는 빈 일반 요소도 <li />처럼 축약한다. EPUB 원고에서는
    // 명시적인 닫는 태그를 유지해 자동 완성·가독성·검증 결과를 일관되게 한다.
    return fragment.replace(/<([A-Za-z][\w:-]*)([^>]*)\s\/>/g, (whole, tag, attributes) => (
      xhtmlVoidTags.has(tag.toLowerCase()) ? whole : `<${tag}${attributes}></${tag}>`
    ));
  };
  const blockTags = new Set(['address', 'article', 'blockquote', 'div', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'hr', 'li', 'ol', 'p', 'pre', 'section', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul']);
  const prettyHtml = (source) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = normaliseXhtml(source);
    const attributes = (element) => Array.from(element.attributes).map((attr) => ` ${attr.name}="${attr.value}"`).join('');
    const render = (node, depth = 0) => {
      const indent = '  '.repeat(depth);
      if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim() ? `${indent}${node.textContent.trim()}` : '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const tag = node.tagName.toLowerCase();
      if (!blockTags.has(tag)) return `${indent}${node.outerHTML}`;
      if (xhtmlVoidTags.has(tag)) return `${indent}${normaliseXhtml(node.outerHTML)}`;
      const children = Array.from(node.childNodes).filter((child) => child.nodeType !== Node.TEXT_NODE || child.textContent.trim());
      const hasBlockChild = children.some((child) => child.nodeType === Node.ELEMENT_NODE && blockTags.has(child.tagName.toLowerCase()));
      if (!hasBlockChild) return `${indent}<${tag}${attributes(node)}>${node.innerHTML.trim()}</${tag}>`;
      const inner = children.map((child) => render(child, depth + 1)).filter(Boolean).join('\n');
      return `${indent}<${tag}${attributes(node)}>\n${inner}\n${indent}</${tag}>`;
    };
    return Array.from(wrapper.childNodes).map((node) => render(node)).filter(Boolean).join('\n');
  };
  const updateLineNumbers = () => {
    const style = getComputedStyle(htmlEditor);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const contentWidth = Math.max(1, htmlEditor.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    const rows = htmlEditor.value.split('\n').flatMap((line, index) => {
      const visualRows = Math.max(1, Math.ceil(context.measureText(line || ' ').width / contentWidth));
      return [String(index + 1), ...Array(visualRows - 1).fill('')];
    });
    lineNumbers.textContent = (rows.length ? rows : ['1']).join('\n');
    lineNumbers.style.transform = `translateY(-${htmlEditor.scrollTop}px)`;
  };
  const findHtmlError = (source) => {
    const stack = [];
    const malformed = /<\s+([A-Za-z][\w:-]*)\b/g.exec(source);
    if (malformed) return { line:source.slice(0, malformed.index).split('\n').length, message:`<${malformed[1]}> 태그 앞의 불필요한 공백을 제거하세요.` };
    const tags = /<\/?([a-zA-Z][\w:-]*)\b[^>]*>/g;
    let match;
    let error = null;
    while ((match = tags.exec(source))) {
      const token = match[0];
      const tag = match[1].toLowerCase();
      const line = source.slice(0, match.index).split('\n').length;
      if (token.startsWith('</')) {
        const opened = stack.at(-1);
        if (!opened) { error = { line, message:`</${tag}>에 대응하는 여는 태그가 없습니다.` }; break; }
        if (opened.tag !== tag) { error = { line, message:`</${tag}> 대신 </${opened.tag}>가 필요합니다.` }; break; }
        stack.pop();
      } else if (xhtmlVoidTags.has(tag) && !/\/\s*>$/.test(token)) {
        error = { line, message:`<${tag}>는 XHTML에서 self-closing(<${tag} />)이어야 합니다.` }; break;
      } else if (tag === 'img' && !/\balt\s*=\s*(['"]).*?\1/i.test(token)) {
        error = { line, message:'img 태그에 alt 속성이 없습니다.' }; break;
      } else if (!xhtmlVoidTags.has(tag) && !token.endsWith('/>')) {
        stack.push({ tag, line });
      }
    }
    if (!error && stack.length) {
      const opened = stack.at(-1);
      error = { line:opened.line, message:`<${opened.tag}> 태그가 닫히지 않았습니다.` };
    }
    return error;
  };
  const validateHtml = () => {
    const error = findHtmlError(htmlEditor.value);
    htmlValidation.hidden = !error;
    xhtmlDiagnostics.hidden = !error;
    if (error) {
      htmlValidation.textContent = `HTML 오류 · ${error.line}행: ${error.message}`;
      htmlValidation.title = htmlValidation.textContent;
      xhtmlDiagnostics.textContent = `Line ${error.line}: ${error.message}`;
    }
  };
  const validateAllChapters = () => collectDraft().chapters.flatMap((chapter, index) => {
    const error = findHtmlError(chapter.body);
    return error ? [{ chapter:index + 1, title:chapter.title || '제목 없는 장', ...error }] : [];
  });
  checkAllButton.addEventListener('click', () => {
    const errors = validateAllChapters();
    if (!errors.length) {
      setStatus('모든 장의 HTML 검사가 완료되었습니다. 오류가 없습니다.');
      return;
    }
    const summary = errors.slice(0, 3).map((error) => `${error.chapter}장 ${error.line}행`).join(', ');
    htmlValidation.hidden = false;
    htmlValidation.textContent = `전체 HTML 오류 ${errors.length}건 · ${summary}${errors.length > 3 ? ' 외' : ''}`;
    htmlValidation.title = errors.map((error) => `${error.chapter}장 “${error.title}” ${error.line}행: ${error.message}`).join('\n');
    xhtmlDiagnostics.hidden = false;
    xhtmlDiagnostics.textContent = errors.map((error) => `${error.chapter}장 Line ${error.line}: ${error.message}`).join(' · ');
    setStatus(`전체 HTML 검사에서 오류 ${errors.length}건을 찾았습니다.`, 'error');
  });
  autoFixHtmlButton.addEventListener('click', () => {
    if (!visualEditor.hidden) syncFromVisual();
    const activeIndex = activeChapterIndex();
    const count = chapterList.querySelectorAll('.chapter[data-i]').length;
    let changed = 0;
    for (let index = 0; index < count; index += 1) {
      chapterList.querySelector(`.chapter[data-i="${index}"]`)?.click();
      const fixed = prettyHtml(htmlEditor.value);
      if (fixed === htmlEditor.value) continue;
      htmlEditor.value = fixed;
      htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
      changed += 1;
    }
    chapterList.querySelector(`.chapter[data-i="${activeIndex}"]`)?.click();
    if (!visualEditor.hidden) visualEditor.innerHTML = htmlEditor.value;
    const errors = validateAllChapters();
    if (errors.length) {
      setStatus(`${changed}개 장을 정리했지만 HTML 오류 ${errors.length}건은 직접 확인해야 합니다.`, 'error');
      return;
    }
    setStatus(changed ? `${changed}개 장의 HTML을 자동으로 정리했습니다.` : '수정할 HTML 구조 오류가 없습니다.');
  });
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
    updateLineNumbers();
    validateHtml();
    if (!htmlField.hidden) { refreshPreview(); syncHtmlPreview(); }
  });
  htmlEditor.addEventListener('scroll', updateLineNumbers);
  htmlEditor.addEventListener('click', syncHtmlPreview);
  htmlEditor.addEventListener('keyup', syncHtmlPreview);
  new ResizeObserver(updateLineNumbers).observe(htmlEditor);
  const statusBox = $('#status');
  const decorateStatus = () => {
    if (!statusBox.classList.contains('ok') && !statusBox.classList.contains('error')) return;
    if (statusBox.querySelector('.status-close')) return;
    let message = statusBox.textContent.trim();
    if (message === 'EPUB 3.0 파일을 만들었습니다. 다운로드 폴더를 확인하세요.') {
      const title = $('#title').value.trim() || '새 전자책';
      message = `[${title}] EPUB 3.0 파일을 다운로드했습니다. 다운로드 폴더를 확인하세요.`;
    }
    statusBox.replaceChildren(document.createTextNode(message));
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'status-close';
    close.setAttribute('aria-label', '알림 닫기');
    close.textContent = '×';
    close.addEventListener('click', () => {
      clearStatusTimers();
      statusBox.textContent = '';
      statusBox.className = 'status';
    });
    statusBox.append(close);
    scheduleStatusDismissal();
  };
  new MutationObserver(decorateStatus).observe(statusBox, { childList:true, characterData:true, attributes:true });
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
  visualEditor.addEventListener('keyup', () => { rememberVisualRange(); updateToolbarState(); syncVisualPreview(); });
  visualEditor.addEventListener('mouseup', () => { rememberVisualRange(); updateToolbarState(); syncVisualPreview(); });
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
  // textarea는 장 전환·미리보기·임시저장의 기존 데이터 브리지로 유지하고, HTML 모드의
  // 실제 편집 UI만 Monaco로 대체한다. Monaco를 못 받아도 textarea가 그대로 동작한다.
  const installMonacoEditor = () => {
    if (!window.require || window.epubMonacoEditor) return;
    window.require.config({ paths:{ vs:'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } });
    window.require(['vs/editor/editor.main'], () => {
      const monaco = window.monaco;
      if (!monaco || window.epubMonacoEditor) return;
      const host = document.createElement('div');
      host.id = 'xhtml-monaco-editor';
      host.setAttribute('aria-label', 'XHTML 코드 편집기');
      codeEditor.append(host);
      const editorStyle = document.createElement('style');
      editorStyle.textContent = `
        .code-editor:has(#xhtml-monaco-editor){display:block;border:1px solid var(--line);background:var(--bg)}
        .code-editor:has(#xhtml-monaco-editor) .line-numbers,.code-editor:has(#xhtml-monaco-editor) textarea{display:none!important}
        #xhtml-monaco-editor{height:610px;min-height:420px;text-align:left}
        .xhtml-diagnostics{margin-top:8px;padding:8px 10px;border:1px solid #ff8b72aa;border-radius:7px;background:#ff510018;color:#ffb39d;font-size:12px;line-height:1.45}.xhtml-diagnostics[hidden]{display:none}
        .monaco-editor .xhtml-emmet-suggestion{color:#a78bfa!important}
        @media(max-width:700px){#xhtml-monaco-editor{height:460px}}
      `;
      document.head.append(editorStyle);
      const tags = ['html','head','body','title','meta','link','style','script','div','section','article','header','footer','main','nav','aside','p','span','strong','em','b','i','u','h1','h2','h3','h4','h5','h6','ul','ol','li','table','thead','tbody','tr','th','td','a','img','figure','figcaption','br','hr'];
      const attributes = {
        img:['src','alt','width','height'], a:['href','target','title'], div:['class','id','style'],
        meta:['name','content','charset'], link:['rel','href','type'], '*':['class','id','style','title'],
      };
      monaco.languages.registerCompletionItemProvider('html', {
        triggerCharacters:['<',' ','.'],
        provideCompletionItems(model, position) {
          const line = model.getLineContent(position.lineNumber);
          const left = line.slice(0, position.column - 1);
          const openingTag = /<([\w:-]+)(?:\s[^<>]*)?$/.exec(left);
          if (openingTag && !/[/>]$/.test(left)) {
            const names = [...new Set([...(attributes[openingTag[1].toLowerCase()] || []), ...attributes['*']])];
            return { suggestions:names.map((name) => ({ label:name, kind:monaco.languages.CompletionItemKind.Property, insertText:`${name}="$0"`, insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range:undefined })) };
          }
          return { suggestions:tags.map((tag) => {
            const voidTag = xhtmlVoidTags.has(tag);
            const defaultAttributes = tag === 'img' ? ' src="$1" alt="$2"' : '';
            return {
              label:tag, kind:monaco.languages.CompletionItemKind.Snippet,
              detail:voidTag ? 'XHTML self-closing tag' : 'XHTML tag',
              insertText:voidTag ? `<${tag}${defaultAttributes} />` : `<${tag}>$0</${tag}>`,
              insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            };
          }) };
        },
      });
      const editor = monaco.editor.create(host, {
        value:htmlEditor.value, language:'html', theme:document.documentElement.dataset.theme === 'light' ? 'vs' : 'vs-dark',
        automaticLayout:true, minimap:{ enabled:false }, lineNumbers:'on', fontSize:13, tabSize:2,
        insertSpaces:true, wordWrap:'on', quickSuggestions:true, suggestOnTriggerCharacters:true,
        tabCompletion:'on', autoClosingBrackets:'always', autoClosingQuotes:'always', formatOnPaste:true,
      });
      window.epubMonacoEditor = editor;
      let synchronising = false;
      const syncTextareaFromMonaco = () => {
        if (synchronising) return;
        synchronising = true;
        htmlEditor.value = editor.getValue();
        htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
        synchronising = false;
      };
      editor.onDidChangeModelContent((event) => {
        // 직접 입력한 <div>에는 즉시 XHTML 닫는 태그를 보완한다. Emmet의 일괄 편집은 건너뛴다.
        if (!synchronising && event.changes.length === 1 && event.changes[0].text.endsWith('>')) {
          const change = event.changes[0];
          const afterOffset = change.rangeOffset + change.text.length;
          const opened = /<([A-Za-z][\w:-]*)(?:\s[^<>]*)?>$/.exec(editor.getModel().getValue().slice(0, afterOffset));
          if (opened && !xhtmlVoidTags.has(opened[1].toLowerCase())) {
            const end = editor.getModel().getPositionAt(afterOffset);
            synchronising = true;
            editor.executeEdits('xhtml-auto-close', [{ range:new monaco.Range(end.lineNumber, end.column, end.lineNumber, end.column), text:`</${opened[1]}>` }]);
            editor.setPosition(end);
            synchronising = false;
          }
        }
        syncTextareaFromMonaco();
      });
      htmlEditor.addEventListener('input', () => {
        if (synchronising || editor.getValue() === htmlEditor.value) return;
        synchronising = true;
        editor.setValue(htmlEditor.value);
        synchronising = false;
      });
      const addEmmetLibrary = () => {
        const activate = () => {
          if (!window.emmetMonaco) return;
          window.emmetMonaco.registerCustomSnippets?.('html', {
            br:'<br />', hr:'<hr />', img:'<img src="${1}" alt="${2}" />', input:'<input type="${1}" />',
            meta:'<meta charset="UTF-8" />', link:'<link rel="stylesheet" href="${1}" type="text/css" />',
          });
          window.emmetMonaco.emmetHTML(monaco, ['html']);
        };
        if (window.emmetMonaco) return activate();
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/emmet-monaco-es@5.7.0/dist/emmet-monaco.min.js';
        script.onload = activate;
        script.onerror = () => console.warn('Emmet 라이브러리를 불러오지 못했습니다.');
        document.head.append(script);
      };
      addEmmetLibrary();
      const expandEmmet = () => {
        const model = editor.getModel();
        const position = editor.getPosition();
        const line = model.getLineContent(position.lineNumber);
        const before = line.slice(0, position.column - 1);
        const match = /([A-Za-z][A-Za-z0-9:._#>+*${}\[\]="'-]*)$/.exec(before);
        if (!match || !window.emmetMonaco?.expandAbbreviation) return false;
        try {
          let expanded = window.emmetMonaco.expandAbbreviation(match[1], { type:'markup', syntax:'html', options:{ 'output.selfClosingStyle':'xhtml' } });
          if (!expanded || expanded === match[1]) return false;
          expanded = normaliseXhtml(expanded.replace(/\|/g, ''));
          const start = new monaco.Position(position.lineNumber, position.column - match[1].length);
          editor.executeEdits('xhtml-emmet', [{ range:new monaco.Range(start.lineNumber, start.column, position.lineNumber, position.column), text:expanded }]);
          return true;
        } catch { return false; }
      };
      editor.addAction({
        id:'epub.xhtml.tab', label:'XHTML Emmet 확장 또는 들여쓰기',
        keybindings:[monaco.KeyCode.Tab], precondition:'editorTextFocus',
        run:() => {
          if (expandEmmet()) return;
          const suggest = host.querySelector('.suggest-widget.visible, .suggest-widget[style*="display: block"]');
          if (suggest) return editor.getAction('acceptSelectedSuggestion')?.run();
          return editor.getAction('editor.action.indentLines')?.run();
        },
      });
      // 기존 코드가 textarea에 포커스를 이동시키는 경우에도 사용자는 Monaco에서 계속 편집한다.
      htmlEditor.focus = () => editor.focus();
    });
  };
  installMonacoEditor();
  setMode('visual');
  chapterControls.classList.add('active');
  updateLineNumbers();
  validateHtml();
});

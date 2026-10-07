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
  .html-validation,.xhtml-diagnostics { display:none!important; }.editor-error-alert { flex:none; min-width:58px; height:32px; border:1px solid #ff8b72aa; border-radius:8px; padding:0 9px; background:#351916; color:#ffb09a; font:700 11px inherit; white-space:nowrap; cursor:pointer; }.editor-error-alert:hover,.editor-error-alert[aria-expanded="true"] { border-color:#ffb09a; background:#4b1e18; }.editor-error-alert[hidden] { display:none; }.chapter-error-popover { position:fixed; z-index:1100; width:min(320px,calc(100vw - 28px)); padding:12px; border:1px solid #ff8b72aa; border-radius:10px; background:var(--surface); color:var(--text); box-shadow:0 16px 42px #0008; }.chapter-error-popover[hidden] { display:none; }.chapter-error-popover__head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; color:#ffb09a; font-size:12px; font-weight:800; }.chapter-error-popover__close { width:24px; height:24px; border:0; border-radius:6px; background:transparent; color:var(--sub); font-size:19px; line-height:1; cursor:pointer; }.chapter-error-popover__close:hover { background:var(--surface-2); color:var(--text); }.chapter-error-popover__list { max-height:180px; margin:0; padding-left:18px; overflow:auto; color:var(--sub); font-size:12px; line-height:1.55; }.fields input[type="checkbox"] { width:18px!important; height:18px; padding:0!important; box-shadow:none!important; }.code-editor { display:grid; grid-template-columns:46px minmax(0,1fr); overflow:hidden; border:1px solid var(--line); border-radius:10px; background:var(--bg); }.code-editor > .line-numbers { min-height:610px; margin:0; padding:10px 8px; overflow:hidden; border-right:1px solid var(--line); color:var(--sub); font:13px/1.65 Consolas,"Courier New",monospace; text-align:right; user-select:none; white-space:pre; }.code-editor > .code { height:610px!important; min-width:0; border:0!important; border-radius:0!important; box-shadow:none!important; }.status { position:relative; padding-right:42px!important; }.status-close { position:absolute; top:50%; right:10px; width:24px; height:24px; transform:translateY(-50%); border:0; border-radius:6px; background:transparent; color:currentColor; font-size:20px; line-height:20px; cursor:pointer; }.status-close:hover { background:#00000018; }
  .sidebar-toggle { position:absolute; top:18px; right:16px; width:32px; height:32px; border:1px solid var(--line); border-radius:9px; background:var(--surface-2); color:var(--text); font-size:18px; cursor:pointer; z-index:20; }
  .theme-settings { margin-top:auto; padding:16px 10px; border-top:1px solid var(--line); color:var(--sub); font-size:12px; font-weight:700; }
  .theme-settings > div:not(.theme-settings__head) { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:10px; }.theme-settings__head { display:flex; align-items:center; justify-content:space-between; }.theme-settings .api-settings-button { width:26px; height:26px; padding:0; font-size:14px; }.theme-settings button { border:1px solid var(--line); border-radius:7px; padding:7px 4px; background:var(--surface-2); color:var(--text); font:600 11px inherit; cursor:pointer; }.theme-settings button:hover { border-color:var(--accent); color:var(--accent); }
  .sidebar-hidden { grid-template-columns:0 minmax(0,1fr); }.sidebar-hidden .side { padding:0!important; overflow:visible; border:0; }.sidebar-hidden .side>*:not(.sidebar-toggle) { display:none; }.sidebar-hidden .sidebar-toggle { position:fixed; left:16px; right:auto; background:var(--surface); }
  main { min-width:0; max-width:1680px!important; padding:24px 32px 42px!important; }.top { min-width:0; display:flex!important; align-items:center; justify-content:flex-end!important; min-height:48px; margin:0 0 18px!important; padding:6px 14px!important; background:var(--surface)!important; border:1px solid var(--line)!important; border-radius:14px!important; box-shadow:none!important; }
  .primary { padding:8px 12px!important; border-radius:8px!important; background:var(--accent)!important; color:#fff!important; font-size:12px!important; line-height:1.2; box-shadow:none!important; }.primary:hover { transform:none!important; filter:brightness(1.08); }
  .book-inline { flex:1; margin-right:14px; }.book-inline .settings { max-width:none!important; padding:0!important; background:none!important; border:0!important; box-shadow:none!important; }.book-inline section { display:flex; align-items:center; gap:10px; }.book-inline .field { display:flex; align-items:center; gap:7px; margin:0!important; }.book-inline label { margin:0!important; white-space:nowrap; color:var(--sub)!important; font-size:clamp(12px,.73vw,18px)!important; }.book-inline input { width:130px!important; padding:3.5px 8px!important; }.book-inline .field:first-child input { width:195px!important; }.book-inline .cover { display:contents!important; border:0!important; padding:0!important; }.book-inline #coverInput,.book-inline .cover img { display:none!important; }.book-inline .cover-upload-button { display:inline-flex!important; align-items:center; height:29px; padding:0 10px; border:1px solid var(--accent)!important; border-radius:7px; background:var(--accent-soft); color:var(--accent)!important; font-size:12px!important; font-weight:700; cursor:pointer; }.book-inline .hint { display:none; }
  .grid { --chapter-width:270px; --preview-width:440px; min-width:0; max-width:100%; position:relative; grid-template-columns:var(--chapter-width) minmax(420px,1fr) var(--preview-width)!important; gap:16px!important; }.panel-resize-handle { position:absolute; top:0; bottom:0; z-index:10; width:14px; transform:translateX(-7px); cursor:col-resize; touch-action:none; }.panel-resize-handle::after { content:''; position:absolute; top:20%; bottom:20%; left:6px; width:2px; border-radius:2px; background:transparent; transition:background .15s; }.panel-resize-handle:hover::after,.panel-resize-handle.is-resizing::after { background:var(--accent); }.card { min-width:0; background:var(--surface)!important; border-color:var(--line)!important; box-shadow:none!important; }.editor,.preview-card { min-width:0; padding:18px!important; }.head { padding:0!important; border:0!important; }.left-tabs { display:grid; grid-template-columns:1fr 1fr; gap:4px; padding:8px; border-bottom:1px solid var(--line); }.left-tab { border:0; border-radius:8px; padding:9px 6px; background:transparent; color:var(--sub); font:700 12px inherit; cursor:pointer; }.left-tab.active { background:var(--accent-soft); color:var(--accent); }
  .chapter-card { display:flex; flex-direction:column; }.left-tabs { grid-template-columns:repeat(3,1fr)!important; }.left-panel-host { position:relative; flex:1; min-height:0; overflow:hidden; }.left-panel { display:none!important; position:absolute; inset:0; overflow:auto; }.left-panel.active { display:block!important; }.chapters { padding:8px!important; }.chapter { position:relative; overflow:hidden; padding-left:34px!important; padding-right:38px!important; text-overflow:ellipsis; white-space:nowrap; }.toc-toggle { position:absolute; right:29px; top:50%; z-index:2; width:18px; height:18px; transform:translateY(-50%); border:0; padding:0; background:transparent; color:var(--sub); font-size:14px; cursor:pointer; }.toc-toggle:hover { color:var(--accent); }.toc-eye { position:absolute; left:7px; top:50%; transform:translateY(-50%); border:0; background:transparent; color:var(--sub); cursor:pointer; }.toc-eye.is-hidden { opacity:.35; }.add { width:calc(100% - 16px)!important; margin:7px 8px 13px!important; background:transparent!important; border-color:var(--accent)!important; color:var(--accent)!important; }.left-panel#cssPanel,.left-panel#assetsPanel { padding:12px!important; }.left-panel#cssPanel section { padding:0!important; }.left-panel#cssPanel .css { height:520px!important; }.left-panel#cssPanel #images { display:none!important; }.left-panel#cssPanel .hint,.asset-hint { color:var(--sub)!important; }.asset-upload { display:flex; align-items:center; justify-content:center; width:100%; margin-bottom:10px; border:1px dashed var(--accent); border-radius:8px; padding:10px; color:var(--accent); font-size:12px; font-weight:700; cursor:pointer; }.asset-hint { color:var(--sub); }.asset-row { display:flex; align-items:center; gap:6px; margin:5px 0; }.asset-row .draft-item { flex:1; }.asset-insert { width:28px; height:28px; border:1px solid var(--accent); border-radius:7px; background:var(--accent-soft); color:var(--accent); font-size:18px; cursor:pointer; }.draft-row { display:flex; gap:4px; }.draft-row .draft-item { flex:1; }.draft-delete { width:30px; border:1px solid var(--line); border-radius:8px; background:transparent; color:#ff9c75; cursor:pointer; }.cover-chapter { display:flex!important; align-items:center; gap:8px; }.cover-chapter::before { content:'▧'; color:var(--accent); font-size:14px; }
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
  .chapter { padding-right:56px!important; }
  .preview { -ms-overflow-style:none; scrollbar-width:none; }.preview::-webkit-scrollbar { display:none; width:0; height:0; }
  .css-preset-control { display:grid; gap:8px; margin:0 0 10px; }.css-preset-row { display:flex; min-width:0; align-items:center; gap:8px; }.css-preset-control label { margin:0!important; white-space:nowrap; font-size:12px!important; }.css-preset-control select,.css-preset-control input { min-width:0; height:34px; border:1px solid var(--line); border-radius:8px; padding:0 9px; background:var(--bg); color:var(--text); }.css-preset-control select,.css-preset-control input { flex:1 1 auto; }.css-preset-save,.css-preset-delete { flex:none; height:30px; border:1px solid var(--accent); border-radius:7px; padding:0 9px; background:var(--accent-soft); color:var(--accent); font:700 12px inherit; cursor:pointer; }.css-preset-delete { border-color:#9b4850; background:#4b2026; color:#ffb7bd; }.left-panel#cssPanel:has(#css-monaco-editor) .css { display:none!important; }#css-monaco-editor { height:520px; border:1px solid var(--line); border-radius:8px; overflow:hidden; }@media(max-width:700px) { #css-monaco-editor { height:260px; } }
  .drag-handle { display:inline-flex; width:16px; margin-right:5px; color:var(--sub); cursor:grab; user-select:none; }.drag-handle:active { cursor:grabbing; }.chapter.is-dragging { opacity:.45; }.chapter.drop-before { box-shadow:inset 0 2px var(--accent); }.chapter.drop-after { box-shadow:inset 0 -2px var(--accent); }.chapter.drop-child { background:var(--accent-soft)!important; outline:1px dashed var(--accent); }
  .fields { grid-template-columns:minmax(0,1fr) minmax(125px,.5fr) minmax(125px,.38fr)!important; }.fields > .full { grid-column:1/-1!important; }
  .code-editor > .code { overflow:auto!important; white-space:pre-wrap!important; overflow-wrap:break-word; }.preview p,.preview h1,.preview h2,.preview h3,.preview h4,.preview h5,.preview li,.preview blockquote,.preview td,.preview th { cursor:text; }.fields { position:relative; }.fields.is-custom-width { grid-template-columns:minmax(220px,min(var(--chapter-title-width),calc(100% - 182px))) minmax(170px,1fr)!important; }.field-resize-handle { position:absolute; top:0; bottom:auto; left:0; z-index:4; width:14px; height:58px; transform:translateX(-7px); cursor:col-resize; touch-action:none; }.field-resize-handle::after { content:''; position:absolute; top:20px; bottom:2px; left:6px; width:2px; border-radius:2px; background:var(--line); transition:background .15s; }.field-resize-handle:hover::after,.field-resize-handle.is-resizing::after { background:var(--accent); }
  .fields.is-custom-width { grid-template-columns:minmax(0,1fr) minmax(125px,.5fr) minmax(125px,.38fr)!important; }
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
  /* 작업 화면은 viewport 안에서 남은 높이를 패널에 전달한다. 페이지가 아닌 각 패널 내부만 스크롤한다. */
  .app { height:100dvh; min-height:0; overflow:hidden; }
  main { height:100dvh; min-height:0; display:flex; flex-direction:column; overflow:hidden; }
  #editorView.view.active { display:flex; flex:1; min-height:0; }
  #editorView .grid { flex:1; min-height:0; height:100%; align-items:stretch!important; overflow:hidden; }
  .chapter-card,.editor,.preview-card { min-height:0; height:100%!important; max-height:none!important; }
  .preview-card { position:static!important; align-self:stretch!important; display:flex; flex-direction:column; }
  .preview-card .preview { flex:1!important; min-height:0; height:auto!important; }
  .preview-stage { display:flex; flex:1; min-width:0; min-height:0; align-items:flex-start; justify-content:center; }
  .preview-stage > .preview[data-device-preview="true"] { box-sizing:border-box!important; flex:0 0 auto!important; align-self:flex-start; margin:0!important; }
  .editor { display:flex; flex-direction:column; overflow:hidden; }
  .editor-controls { flex:none; }
  /* 장 제목·목차 입력 영역과 두 편집기 사이의 간격은 모드와 관계없이 하나로 유지한다. */
  .editor { --editor-content-gap:12px; }
  .editor .fields { flex:none; min-height:0; row-gap:0!important; }
  .editor > .full,.editor > .rich-editor { margin-top:var(--editor-content-gap); }
  /* XHTML 안내 라벨은 보조기기에만 남겨 코드 편집기의 시작점을 일반편집기와 맞춘다. */
  .editor > .full > label { position:absolute; width:1px; height:1px; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
  .editor > .full:not([hidden]) { flex:1; min-height:0; display:flex; flex-direction:column; }
  .editor > .full:not([hidden]) .code-editor { flex:1; min-height:0; height:auto!important; }
  .editor > .full:not([hidden]) .code-editor > .line-numbers { min-height:0; }
  .editor > .full:not([hidden]) > .code-editor > textarea.code { height:100%!important; min-height:0; }
  .editor .rich-editor { flex:1; min-height:0; height:auto!important; }
  #xhtml-monaco-editor { height:100%!important; }
  .editor-mode { padding:3px!important; }
  .editor-mode button { min-width:76px; padding:7px 9px!important; }
  .parent-toc-picker { position:relative; width:100%; }.parent-toc-button { display:flex; align-items:center; justify-content:space-between; width:100%; height:36px; overflow:hidden; border:1px solid var(--line); border-radius:8px; padding:0 10px; background:var(--bg); color:var(--text); font:600 13px inherit; text-align:left; white-space:nowrap; text-overflow:ellipsis; cursor:pointer; }.parent-toc-button::after { content:'⌄'; flex:none; margin-left:8px; color:var(--sub); font-size:16px; }.parent-toc-button:hover,.parent-toc-button[aria-expanded="true"] { border-color:var(--accent); }.parent-toc-menu { position:absolute; top:calc(100% + 5px); left:0; z-index:30; width:100%; max-height:220px; overflow:auto; padding:4px; border:1px solid var(--line); border-radius:8px; background:var(--surface); box-shadow:0 14px 34px #0008; }.parent-toc-menu[hidden] { display:none; }.parent-toc-option { display:block; width:100%; overflow:hidden; border:0; border-radius:6px; padding:8px; background:transparent; color:var(--text); font:600 12px inherit; text-align:left; white-space:nowrap; text-overflow:ellipsis; cursor:pointer; }.parent-toc-option:hover,.parent-toc-option[aria-selected="true"] { background:var(--accent-soft); color:var(--accent); }
  .chapter-search-panel { position:fixed; top:76px; right:24px; z-index:1200; width:min(440px,calc(100vw - 28px)); padding:14px; border:1px solid var(--line); border-radius:12px; background:var(--surface); box-shadow:0 20px 52px #000a; }.chapter-search-panel[hidden] { display:none; }.chapter-search-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }.chapter-search-head strong { font-size:13px; }.chapter-search-close { width:26px; height:26px; border:0; border-radius:6px; background:transparent; color:var(--sub); font-size:19px; cursor:pointer; }.chapter-search-close:hover { background:var(--surface-2); color:var(--text); }.chapter-search-fields { display:grid; grid-template-columns:1fr 1fr; gap:7px; }.chapter-search-fields input { width:100%; height:34px; padding:6px 8px!important; font-size:12px!important; }.chapter-search-actions { display:flex; align-items:center; gap:7px; margin-top:9px; }.chapter-search-actions button { padding:7px 9px; font-size:12px; }.chapter-search-summary { margin:10px 0 6px; color:var(--sub); font-size:12px; }.chapter-search-results { max-height:280px; margin:0; padding:0; overflow:auto; list-style:none; }.chapter-search-result { display:block; width:100%; border:0; border-bottom:1px solid var(--line); padding:9px 4px; background:transparent; color:var(--text); text-align:left; cursor:pointer; }.chapter-search-result:hover { color:var(--accent); background:var(--accent-soft); }.chapter-search-result small { display:block; margin-top:3px; color:var(--sub); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .epub-transfer { display:flex; flex:none; align-items:stretch; gap:8px; }.epub-transfer .primary { margin:0; }
  .epub-topbar[hidden] { display:none!important; }
  .account-area { position:relative; flex:none; margin-right:10px; }.account-button { border:1px solid var(--line); border-radius:8px; padding:8px 11px; background:var(--surface-2); color:var(--text); font:700 12px inherit; cursor:pointer; }.account-button:hover { border-color:var(--accent); color:var(--accent); }
  .account-panel { position:absolute; top:calc(100% + 8px); right:0; z-index:40; width:270px; padding:14px; border:1px solid var(--line); border-radius:12px; background:var(--surface); box-shadow:0 18px 45px #0008; }.account-panel[hidden] { display:none; }.account-panel h3 { margin:0 0 10px; font-size:13px; }.account-panel label { display:block; margin:8px 0 4px; font-size:11px; color:var(--sub)!important; }.account-panel input { width:100%!important; height:34px; padding:6px 8px!important; }.account-actions { display:flex; gap:6px; margin-top:10px; }.account-actions button { flex:1; }.account-message { margin:8px 0 0; color:var(--sub); font-size:11px; line-height:1.4; }.account-message.error { color:#ff9c75; }.admin-panel { margin-top:14px; padding-top:12px; border-top:1px solid var(--line); }
  @media(max-width:1550px) { #editorView .grid { grid-template-rows:minmax(0,1fr) minmax(180px,.7fr); }.chapter-card,.editor { height:100%!important; }.preview-card { height:auto!important; max-height:none!important; } }
  @media(max-width:700px) { .app,main { height:100dvh; }.app { overflow:hidden; } main { overflow:auto; }.chapter-card,.editor,.preview-card { height:auto!important; max-height:none!important; }.epub-transfer { width:100%; flex-wrap:wrap; }.epub-transfer .primary { flex:1; } }
`;
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.2/+esm';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.4.16/+esm';
import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@4.4.6/+esm';
import { diffChars } from 'https://cdn.jsdelivr.net/npm/diff@9.0.0/+esm';
import { requestGeminiCorrections } from './gemini-interactions.js?v=20261007-59';
import { applySourceEdits, chunkProofreadParagraphs, dedupeAdjacentParagraphs, diffPartsToSourceEdits, extractProofreadParagraphs, isSuspiciousCorrection } from './gemini-proofread.js?v=20261007-59';

window.addEventListener('DOMContentLoaded', () => {
  document.head.append(uiStyle);
  // Existing markup is ID-heavy.  Accept both CSS selectors (`#body`) and
  // bare legacy IDs (`body`) so one selector typo cannot abort UI startup.
  const $ = (selector) => {
    if (typeof selector === 'string' && /^[A-Za-z][\w-]*$/.test(selector)) {
      return document.getElementById(selector) || document.querySelector(selector);
    }
    return document.querySelector(selector);
  };
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
  const previewStage = document.createElement('div');
  previewStage.className = 'preview-stage';
  preview.before(previewStage);
  previewStage.append(preview);
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
      preview.style.removeProperty('aspect-ratio');
      return;
    }
    // The stage is the actual area below the header.  The frame is measured
    // border-box, so its border cannot overflow the calculated dimensions.
    const availableWidth = Math.max(1, previewStage.clientWidth);
    const availableHeight = Math.max(1, previewStage.clientHeight);
    const scale = Math.min(1, availableWidth / device.width, availableHeight / device.height);
    preview.dataset.devicePreview = 'true';
    preview.style.setProperty('aspect-ratio', `${device.width} / ${device.height}`);
    preview.style.setProperty('width', `${Math.round(device.width * scale)}px`, 'important');
    preview.style.setProperty('height', `${Math.round(device.height * scale)}px`, 'important');
  };
  phonePreview.addEventListener('change', () => { selectedDevice = phonePreview.value; if (selectedDevice) tabletPreview.value = ''; applyDevicePreview(); });
  tabletPreview.addEventListener('change', () => { selectedDevice = tabletPreview.value; if (selectedDevice) phonePreview.value = ''; applyDevicePreview(); });
  new ResizeObserver(applyDevicePreview).observe(previewCard);
  new ResizeObserver(applyDevicePreview).observe(previewStage);

  root.dataset.theme = localStorage.getItem('epub-theme') || 'dark';

  side.insertAdjacentHTML('afterbegin', `
    <button class="sidebar-toggle" type="button" aria-label="사이드바 숨기기">☰</button>
  `);
  side.querySelector('.tip').insertAdjacentHTML('beforebegin', `
    <div class="theme-settings">
      <div class="theme-settings__head"><span>화면 설정</span><button class="api-settings-button" type="button" aria-label="API 설정" title="API 설정">⚙</button></div>
      <div><button type="button" data-theme="dark">다크</button><button type="button" data-theme="light">라이트</button></div>
    </div>
  `);

  top.querySelector('div').remove();
  top.classList.add('epub-topbar');
  side.querySelectorAll('[data-view]').forEach((tab) => tab.addEventListener('click', () => {
    // 이후 다른 앱 탭을 추가해도 EPUB 책 정보·내보내기 바는 EPUB 탭에서만 보인다.
    top.hidden = tab.dataset.view !== 'editorView';
  }));
  const accountArea = document.createElement('div');
  accountArea.className = 'account-area';
  accountArea.innerHTML = `<button type="button" class="account-button">로그인</button><div class="account-panel" hidden>
    <h3>Sitescout 로그인</h3>
    <form class="login-form"><label>아이디<input name="username" autocomplete="username" required pattern="[a-z0-9][a-z0-9_.-]{2,31}" /></label><label>비밀번호<input name="password" type="password" autocomplete="current-password" required minlength="6" /></label><div class="account-actions"><button type="submit" class="primary">로그인</button><button type="button" class="secondary account-close">닫기</button></div></form>
    <p class="account-message" aria-live="polite"></p><div class="admin-panel" hidden><h3>사용자 아이디 발급</h3><form class="admin-form"><label>새 아이디<input name="username" required pattern="[a-z0-9][a-z0-9_.-]{2,31}" /></label><label>임시 비밀번호<input name="password" type="password" required minlength="6" /></label><button type="submit" class="secondary" style="width:100%;margin-top:10px">아이디 발급</button></form></div>
  </div>`;
  top.insertBefore(accountArea, exportButton);
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
  const cssPresetStoragePrefix = 'epub-builder-css-presets-v2';
  let cssPresetOwnerId = null;
  // 프리셋은 사용자가 저장한 항목만 제공한다. 가져온 CSS는 항상 그대로 유지한다.
  const CSS_PRESETS = [];
  const cssEditor = cssSettings.querySelector('#css');
  const cssPresetControl = document.createElement('div');
  cssPresetControl.className = 'css-preset-control';
  cssPresetControl.innerHTML = '<div class="css-preset-row"><label for="cssPreset">프리셋 선택</label><select id="cssPreset"><option value="custom">사용자 정의 / 가져온 CSS</option></select><button type="button" class="css-preset-delete" hidden>삭제</button></div><div class="css-preset-row"><label for="cssPresetName">CSS 이름</label><input id="cssPresetName" placeholder="프리셋 제목"><button type="button" class="css-preset-save">CSS저장</button></div>';
  const cssPreset = cssPresetControl.querySelector('select');
  const cssPresetName = cssPresetControl.querySelector('#cssPresetName');
  const cssPresetSave = cssPresetControl.querySelector('.css-preset-save');
  const cssPresetDelete = cssPresetControl.querySelector('.css-preset-delete');
  const rebuildCssPresetOptions = () => {
    cssPreset.replaceChildren(new Option('사용자 정의 / 가져온 CSS', 'custom'));
    CSS_PRESETS.forEach((preset) => cssPreset.add(new Option(preset.name, preset.id)));
  };
  rebuildCssPresetOptions();
  cssSettings.querySelector('section')?.prepend(cssPresetControl);
  const matchingCssPreset = () => CSS_PRESETS.find((preset) => preset.css.trim() === cssEditor.value.trim())?.id || 'custom';
  const updatePresetDeleteButton = () => {
    cssPresetDelete.hidden = !CSS_PRESETS.some((preset) => preset.id === cssPreset.value);
  };
  const cssPresetStorageKey = () => cssPresetOwnerId ? `${cssPresetStoragePrefix}:${cssPresetOwnerId}` : null;
  const saveAccountCssPresets = () => {
    const key = cssPresetStorageKey();
    if (!key) return false;
    localStorage.setItem(key, JSON.stringify(CSS_PRESETS.filter((item) => item.custom)));
    return true;
  };
  const loadAccountCssPresets = (ownerId) => {
    cssPresetOwnerId = ownerId || null;
    let saved = [];
    if (cssPresetOwnerId) {
      try { saved = JSON.parse(localStorage.getItem(cssPresetStorageKey()) || '[]'); } catch { saved = []; }
    }
    CSS_PRESETS.splice(0, CSS_PRESETS.length, ...saved.filter((preset) => preset?.id && preset?.name && typeof preset.css === 'string'));
    rebuildCssPresetOptions();
    cssPreset.value = matchingCssPreset();
    updatePresetDeleteButton();
  };
  cssPreset.value = matchingCssPreset();
  updatePresetDeleteButton();
  cssPreset.addEventListener('change', () => {
    const preset = CSS_PRESETS.find((item) => item.id === cssPreset.value);
    if (!preset) { updatePresetDeleteButton(); return; }
    cssEditor.value = preset.css;
    cssEditor.dispatchEvent(new Event('input', { bubbles:true }));
    // 프리셋 선택은 곧 현재 책의 공통 CSS 변경이다. 별도 적용 단계 없이
    // 편집기·미리보기·내보내기가 같은 값을 사용하도록 즉시 다시 렌더링한다.
    refreshPreview();
    updatePresetDeleteButton();
  });
  cssEditor.addEventListener('input', () => { cssPreset.value = matchingCssPreset(); updatePresetDeleteButton(); });
  cssPresetSave.addEventListener('click', () => {
    if (!cssPresetOwnerId) { setStatus('CSS 프리셋은 로그인한 계정에서만 저장할 수 있습니다.', 'error'); return; }
    const name = cssPresetName.value.trim();
    if (!name) { cssPresetName.focus(); return; }
    const existing = CSS_PRESETS.find((preset) => preset.custom && preset.name === name);
    if (existing && !window.confirm(`“${name}” 프리셋을 현재 CSS로 덮어쓸까요?`)) return;
    const preset = existing || { id:`user-${Date.now()}`, name, css:'', custom:true };
    preset.css = cssEditor.value;
    if (!existing) {
      CSS_PRESETS.push(preset);
      cssPreset.add(new Option(preset.name, preset.id));
    }
    saveAccountCssPresets();
    cssPreset.value = preset.id;
    cssPresetName.value = '';
    updatePresetDeleteButton();
    setStatus(`“${preset.name}” 프리셋을 저장했습니다.`);
  });
  cssPresetDelete.addEventListener('click', () => {
    if (!cssPresetOwnerId) { setStatus('CSS 프리셋은 로그인한 계정에서만 관리할 수 있습니다.', 'error'); return; }
    const presetIndex = CSS_PRESETS.findIndex((preset) => preset.id === cssPreset.value);
    if (presetIndex < 0) return;
    const preset = CSS_PRESETS[presetIndex];
    if (!window.confirm(`“${preset.name}” 프리셋을 삭제할까요?`)) return;
    CSS_PRESETS.splice(presetIndex, 1);
    Array.from(cssPreset.options).find((option) => option.value === preset.id)?.remove();
    saveAccountCssPresets();
    cssPreset.value = 'custom';
    updatePresetDeleteButton();
    setStatus(`“${preset.name}” 프리셋을 삭제했습니다.`);
  });
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
  assetsPanel.innerHTML = '<label class="asset-upload" for="image">이미지·아이콘 업로드</label><p class="asset-hint">PNG, JPG, GIF, SVG 파일을 업로드해 본문 또는 아이콘으로 사용하세요.</p><p class="asset-hint">본문 삽입 예시: <code>&lt;img src="../Image/파일명.png" alt="이미지 설명"&gt;</code></p><ul id="assetList" class="images"></ul>';
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
  const editorFields = htmlEditor.closest('.fields');
  const editor = htmlEditor.closest('.editor');
  const editorActions = editor.querySelector('.toolbar');
  // 제목·목차 필드와 실제 편집 영역을 분리해, 본문만 남은 높이를 사용하게 한다.
  editorActions.before(htmlField);
  const xhtmlDiagnostics = document.createElement('div');
  xhtmlDiagnostics.className = 'xhtml-diagnostics';
  xhtmlDiagnostics.hidden = true;
  xhtmlDiagnostics.setAttribute('role', 'status');
  htmlField.append(xhtmlDiagnostics);
  const tocLevel = $('#clevel');
  const tocField = tocLevel.parentElement;
  const titleField = $('#ctitle').parentElement;
  const sigilFileField = document.createElement('div');
  const sigilFileName = document.createElement('input');
  sigilFileName.id = 'sigilFileName';
  sigilFileName.spellcheck = false;
  sigilFileName.placeholder = 'chapter-001.xhtml';
  sigilFileField.innerHTML = '<label for="sigilFileName">Sigil 파일명</label>';
  sigilFileField.append(sigilFileName);
  titleField.after(sigilFileField);
  tocField.querySelector('label').textContent = '상위 목차';
  tocLevel.hidden = true;
  tocLevel.value = 1;
  const parentToc = document.createElement('select');
  parentToc.setAttribute('aria-label', '상위 목차 선택');
  parentToc.hidden = true;
  const parentTocPicker = document.createElement('div');
  parentTocPicker.className = 'parent-toc-picker';
  const parentTocButton = document.createElement('button');
  parentTocButton.type = 'button';
  parentTocButton.className = 'parent-toc-button';
  parentTocButton.setAttribute('aria-haspopup', 'listbox');
  parentTocButton.setAttribute('aria-expanded', 'false');
  const parentTocMenu = document.createElement('div');
  parentTocMenu.className = 'parent-toc-menu';
  parentTocMenu.setAttribute('role', 'listbox');
  parentTocMenu.hidden = true;
  parentTocPicker.append(parentTocButton, parentTocMenu);
  tocField.append(parentToc, parentTocPicker);
  const fieldResizeHandle = document.createElement('div');
  fieldResizeHandle.className = 'field-resize-handle';
  fieldResizeHandle.title = '장 제목과 Sigil 파일명 영역 너비 조절';
  editorFields.append(fieldResizeHandle);
  const savedFieldWidth = Number(localStorage.getItem('epub-chapter-title-width'));
  if (Number.isFinite(savedFieldWidth) && savedFieldWidth > 220) {
    editorFields.classList.add('is-custom-width');
    editorFields.style.setProperty('--chapter-title-width', `${savedFieldWidth}px`);
  }
  const positionFieldResizeHandle = () => {
    if (!titleField) return;
    const titleBounds = titleField.getBoundingClientRect();
    const sigilBounds = sigilFileField.getBoundingClientRect();
    const fieldsBounds = editorFields.getBoundingClientRect();
    fieldResizeHandle.style.left = `${Math.round((titleBounds.right + sigilBounds.left) / 2 - fieldsBounds.left)}px`;
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
  const chapterFileNames = new Map();
  const defaultChapterFileName = (index) => `DOC-${String(index + 1).padStart(3, '0')}.xhtml`;
  const currentChapterFileName = (index) => chapterFileNames.get(index) || defaultChapterFileName(index);
  const syncSigilFileNameField = () => { sigilFileName.value = currentChapterFileName(activeChapterIndex()); };
  sigilFileName.addEventListener('input', () => chapterFileNames.set(activeChapterIndex(), sigilFileName.value.trim()));
  chapterList.addEventListener('click', () => {
    if (!collectingDraft) syncSigilFileNameField();
  });
  addChapter.addEventListener('click', () => requestAnimationFrame(syncSigilFileNameField));
  // Only root entries which actually own descendants can be collapsed.
  // This state is deliberately independent from the selected chapter state.
  const collapsedTocRoots = new Set();
  const activeChapterIndex = () => {
    return Number(chapterList.querySelector('.chapter.active[data-i]')?.dataset.i || 0);
  };
  // Keep an independent snapshot for every legacy chapter.  Saving a draft
  // must never need to click through the chapter list and reuse one editor.
  const chapterSnapshots = new Map();
  // EPUB import/load hydrates several chapters in a row.  Those writes are
  // state restoration, not user edits; firing the editor input pipeline here
  // can make Monaco's previous model overwrite the incoming XHTML.
  let hydratingChapter = false;
  const snapshotCurrentChapter = () => {
    if (hydratingChapter) return;
    const index = activeChapterIndex();
    if (!Number.isInteger(index)) return;
    const snapshot = {
      title: $('#ctitle').value,
      level: Math.max(1, Math.min(3, Number($('#clevel').value) || 1)),
      body: htmlEditor.value,
      fileName: currentChapterFileName(index),
    };
    chapterSnapshots.set(index, snapshot);
    const chapterButton = chapterList.querySelector(`.chapter[data-i="${index}"]`);
    if (chapterButton) setChapterButtonLabel(chapterButton, snapshot.title, index);
  };
  const shiftSnapshotsAfterDelete = (deletedIndex) => {
    const shifted = new Map();
    chapterSnapshots.forEach((snapshot, index) => {
      if (index < deletedIndex) shifted.set(index, snapshot);
      if (index > deletedIndex) shifted.set(index - 1, snapshot);
    });
    chapterSnapshots.clear();
    shifted.forEach((snapshot, index) => chapterSnapshots.set(index, snapshot));
  };
  const setChapterButtonLabel = (chapter, title, index) => {
    const number = chapter.querySelector('.num') || document.createElement('span');
    number.className = 'num';
    number.textContent = String(index + 1);
    chapter.replaceChildren(number, document.createTextNode(title || '제목 없는 장'));
  };
  const selectManagedChapter = (index) => {
    const target = chapterList.querySelector(`.chapter[data-i="${index}"]`);
    const snapshot = chapterSnapshots.get(index);
    if (!target || !snapshot) return;
    const current = activeChapterIndex();
    if (current !== index) saveCurrentChapter();
    chapterList.querySelectorAll('.chapter[data-i]').forEach((chapter) => chapter.classList.toggle('active', chapter === target));
    setCurrentChapter({ ...snapshot, fileName:currentChapterFileName(index) });
    syncOpenChapterEditor();
    refreshPreview();
    validateHtml();
    scheduleChapterControlsRefresh();
  };
  const bindManagedChapter = (chapter) => {
    chapter.onclick = (event) => {
      if (event.target.closest('.toc-toggle,.drag-handle')) return;
      const bounds = chapter.getBoundingClientRect();
      if (bounds.right - event.clientX <= 38) return;
      event.preventDefault();
      event.stopPropagation();
      selectManagedChapter(Number(chapter.dataset.i));
    };
  };
  Array.from(chapterList.querySelectorAll('.chapter[data-i]')).forEach(bindManagedChapter);
  addChapter.addEventListener('click', () => {
    snapshotCurrentChapter();
    const indexes = Array.from(chapterList.querySelectorAll('.chapter[data-i]')).map((chapter) => Number(chapter.dataset.i));
    const index = indexes.length ? Math.max(...indexes) + 1 : 0;
    const chapter = document.createElement('button');
    chapter.type = 'button';
    chapter.className = 'chapter';
    chapter.dataset.i = String(index);
    setChapterButtonLabel(chapter, '새 장', index);
    chapterSnapshots.set(index, { title:'새 장', level:1, body:'<p></p>', fileName:defaultChapterFileName(index) });
    chapterList.append(chapter);
    bindManagedChapter(chapter);
    selectManagedChapter(index);
  });
  $('#del').addEventListener('click', (event) => {
    // 이전 삭제 핸들러가 먼저 실행해 snapshot을 섞지 못하게 한다.
    event.stopImmediatePropagation();
    const chapters = Array.from(chapterList.querySelectorAll('.chapter[data-i]'));
    if (chapters.length <= 1) { setStatus('적어도 한 개의 장이 필요합니다.', 'error'); return; }
    const deleted = activeChapterIndex();
    saveCurrentChapter();
    const target = chapterList.querySelector(`.chapter[data-i="${deleted}"]`);
    target?.remove();
    const remaining = Array.from(chapterList.querySelectorAll('.chapter[data-i]'));
    const remap = new Map(remaining.map((chapter, next) => [Number(chapter.dataset.i), next]));
    const remapMap = (source) => {
      const next = new Map();
      source.forEach((value, key) => { if (remap.has(key)) next.set(remap.get(key), value); });
      return next;
    };
    const nextSnapshots = new Map();
    remap.forEach((next, old) => { const snapshot = chapterSnapshots.get(old); if (snapshot) nextSnapshots.set(next, snapshot); });
    chapterSnapshots.clear(); nextSnapshots.forEach((value, key) => chapterSnapshots.set(key, value));
    const nextFiles = remapMap(chapterFileNames); chapterFileNames.clear(); nextFiles.forEach((value, key) => chapterFileNames.set(key, value));
    const nextExcluded = new Set(Array.from(tocExcluded).filter((index) => remap.has(index)).map((index) => remap.get(index)));
    tocExcluded.clear(); nextExcluded.forEach((index) => tocExcluded.add(index));
    const nextParents = new Map();
    parentTocMap.forEach((parent, child) => { if (remap.has(child) && remap.has(parent)) nextParents.set(remap.get(child), remap.get(parent)); });
    parentTocMap.clear(); nextParents.forEach((parent, child) => parentTocMap.set(child, parent));
    footnotes.forEach((note) => { if (remap.has(note.sourceChapterId)) note.sourceChapterId = remap.get(note.sourceChapterId); });
    remaining.forEach((chapter) => {
      const next = remap.get(Number(chapter.dataset.i));
      chapter.dataset.i = String(next);
      setChapterButtonLabel(chapter, chapterLabel(chapter), next);
      bindManagedChapter(chapter);
    });
    selectManagedChapter(Math.max(0, Math.min(deleted, remaining.length - 1)));
    refreshChapterControls();
  }, true);
  snapshotCurrentChapter();
  ['#ctitle', '#clevel', '#body'].forEach((selector) => $(selector).addEventListener('input', snapshotCurrentChapter));
  sigilFileName.addEventListener('input', snapshotCurrentChapter);
  addChapter.addEventListener('click', snapshotCurrentChapter);
  let deletedChapterIndex = null;
  $('#del').addEventListener('click', () => { deletedChapterIndex = activeChapterIndex(); }, true);
  $('#del').addEventListener('click', () => {
    if (deletedChapterIndex === null) return;
    shiftSnapshotsAfterDelete(deletedChapterIndex);
    deletedChapterIndex = null;
    snapshotCurrentChapter();
  });
  let arrangingChapters = false;
  // 내부 재정렬로 발생한 childList 변경은 다시 갱신하지 않는다.
  // 그렇지 않으면 select 변경 → 재정렬 → MutationObserver 갱신이 연속 실행되어 UI가 흔들린다.
  let ignoreInternalChapterMutation = false;
  let chapterControlsRefreshQueued = false;
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
      ignoreInternalChapterMutation = true;
      ordered.forEach((chapter) => chapterList.append(chapter));
      arrangingChapters = false;
    }
    const rootHasChildren = new Set();
    chapters.forEach((chapter) => {
      const index = Number(chapter.dataset.i);
      const parent = parentTocMap.get(index) ?? null;
      if (parent !== null && (parentTocMap.get(parent) ?? null) === null) rootHasChildren.add(parent);
    });
    chapters.forEach((chapter) => {
      const index = Number(chapter.dataset.i);
      const parent = parentTocMap.get(index) ?? null;
      let ancestor = parent;
      let isCollapsedDescendant = false;
      const seen = new Set([index]);
      while (ancestor !== null && ancestor !== undefined && !seen.has(ancestor)) {
        if (collapsedTocRoots.has(ancestor)) {
          isCollapsedDescendant = true;
          break;
        }
        seen.add(ancestor);
        ancestor = parentTocMap.get(ancestor) ?? null;
      }
      chapter.hidden = isCollapsedDescendant;
      chapter.querySelector('.toc-toggle')?.remove();
      chapter.querySelector('.drag-handle')?.remove();
      const handle = document.createElement('span');
      handle.className = 'drag-handle';
      handle.draggable = true;
      handle.title = '끌어서 순서 또는 목차 계층 변경';
      handle.setAttribute('aria-label', handle.title);
      handle.textContent = '≡';
      chapter.prepend(handle);
      if (parent === null && rootHasChildren.has(index)) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'toc-toggle';
        const collapsed = collapsedTocRoots.has(index);
        toggle.textContent = collapsed ? '▸' : '▾';
        toggle.title = collapsed ? '하위 목차 펼치기' : '하위 목차 접기';
        toggle.setAttribute('aria-label', toggle.title);
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
        toggle.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (collapsedTocRoots.has(index)) collapsedTocRoots.delete(index);
          else collapsedTocRoots.add(index);
          arrangeChapterList();
        });
        chapter.append(toggle);
      }
    });
  };
  const closeParentTocMenu = () => {
    parentTocMenu.hidden = true;
    parentTocButton.setAttribute('aria-expanded', 'false');
  };
  const renderParentTocPicker = () => {
    const selected = parentToc.selectedOptions[0];
    parentTocButton.textContent = selected?.textContent || '최상위 목차';
    parentTocMenu.replaceChildren();
    Array.from(parentToc.options).forEach((option) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'parent-toc-option';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(option.selected));
      item.textContent = option.textContent;
      item.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        parentToc.value = option.value;
        closeParentTocMenu();
        parentToc.dispatchEvent(new Event('change', { bubbles:true }));
      });
      parentTocMenu.append(item);
    });
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
    renderParentTocPicker();
  };
  const scheduleChapterControlsRefresh = () => {
    if (chapterControlsRefreshQueued) return;
    chapterControlsRefreshQueued = true;
    requestAnimationFrame(() => {
      chapterControlsRefreshQueued = false;
      refreshChapterControls();
    });
  };
  parentToc.addEventListener('change', () => {
    const index = Number(chapterList.querySelector('.chapter.active[data-i]')?.dataset.i || 0);
    if (parentToc.value) parentTocMap.set(index, Number(parentToc.value));
    else parentTocMap.delete(index);
    arrangeChapterList();
    scheduleChapterControlsRefresh();
  });
  parentTocButton.addEventListener('click', () => {
    const opening = parentTocMenu.hidden;
    closeParentTocMenu();
    if (opening) {
      parentTocMenu.hidden = false;
      parentTocButton.setAttribute('aria-expanded', 'true');
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!parentTocPicker.contains(event.target)) closeParentTocMenu();
  }, true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeParentTocMenu();
  });
  chapterList.addEventListener('click', scheduleChapterControlsRefresh);
  chapterList.addEventListener('click', (event) => {
    if (event.target.closest('.toc-toggle')) return;
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
  new MutationObserver(() => {
    if (ignoreInternalChapterMutation) {
      ignoreInternalChapterMutation = false;
      return;
    }
    scheduleChapterControlsRefresh();
  }).observe(chapterList, { childList:true, subtree:true });
  let draggedChapter = null;
  const clearDropIndicator = () => chapterList.querySelectorAll('.drop-before,.drop-after,.drop-child').forEach((chapter) => chapter.classList.remove('drop-before', 'drop-after', 'drop-child'));
  chapterList.addEventListener('dragstart', (event) => {
    const handle = event.target.closest('.drag-handle');
    const chapter = handle?.closest('.chapter[data-i]');
    if (!chapter) return;
    draggedChapter = chapter;
    chapter.classList.add('is-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', chapter.dataset.i);
  });
  chapterList.addEventListener('dragover', (event) => {
    const target = event.target.closest('.chapter[data-i]');
    if (!draggedChapter || !target || target === draggedChapter) return;
    event.preventDefault();
    clearDropIndicator();
    const bounds = target.getBoundingClientRect();
    const childDrop = event.clientX > bounds.left + Math.min(72, bounds.width * .35);
    target.classList.add(childDrop ? 'drop-child' : event.clientY < bounds.top + bounds.height / 2 ? 'drop-before' : 'drop-after');
    event.dataTransfer.dropEffect = 'move';
  });
  chapterList.addEventListener('drop', (event) => {
    const target = event.target.closest('.chapter[data-i]');
    if (!draggedChapter || !target || target === draggedChapter) return;
    event.preventDefault();
    const draggedIndex = Number(draggedChapter.dataset.i);
    const targetIndex = Number(target.dataset.i);
    const bounds = target.getBoundingClientRect();
    const childDrop = event.clientX > bounds.left + Math.min(72, bounds.width * .35);
    let nextParent = childDrop ? (parentTocMap.get(targetIndex) ?? targetIndex) : (parentTocMap.get(targetIndex) ?? null);
    if (nextParent === draggedIndex || isDescendantOf(nextParent, draggedIndex)) nextParent = null;
    if (nextParent === null) parentTocMap.delete(draggedIndex);
    else parentTocMap.set(draggedIndex, nextParent);
    const before = !childDrop && event.clientY < bounds.top + bounds.height / 2;
    chapterList.insertBefore(draggedChapter, before ? target : target.nextSibling);
    collapsedTocRoots.delete(draggedIndex);
    arrangeChapterList();
    refreshChapterControls();
  });
  chapterList.addEventListener('dragend', () => { draggedChapter?.classList.remove('is-dragging'); draggedChapter = null; clearDropIndicator(); });
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
  const revokePreviewAssetUrl = (asset) => {
    if (asset?.url?.startsWith('blob:')) URL.revokeObjectURL(asset.url);
  };
  const clearPreviewAssets = () => {
    previewAssets.forEach(revokePreviewAssetUrl);
    previewAssets.clear();
  };
  window.addEventListener('pagehide', clearPreviewAssets, { once:true });
  // 본문 XHTML에는 noteref 링크만 두고, 각주 본문은 이 저장 가능한 목록으로
  // 관리한다. id는 표시 번호와 분리되어 삭제·재정렬 후에도 링크가 유지된다.
  const footnotes = new Map();
  // 가져온 EPUB은 원본 경로·spine·TOC 정보를 유지해 재내보낼 때 사용한다.
  let importedEpub = null;
  let importedCoverReplaced = false;
  coverInput.addEventListener('change', () => { if (importedEpub) importedCoverReplaced = true; });
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
      const blob = new Blob([safeSvg], { type:'image/svg+xml' });
      return { type:file.type, url:URL.createObjectURL(blob), blob };
    }
    return { type:file.type || 'image/png', url:URL.createObjectURL(file), blob:file };
  };
  const previewAssetForPath = (path) => previewAssets.get(path)
    || Array.from(previewAssets.values()).find((asset) => asset.originalPath === path);
  const savedCoverAsset = () => Array.from(previewAssets.values()).find((asset) =>
    asset.isCover || /(?:^|[\\/_-])cover(?:[._-]|$)/i.test(asset.originalPath || '')
  );
  const hydratePreviewAssets = () => {
    const activePath = importedEpub?.chapterMeta[activeChapterIndex()]?.path;
    const resolveAssetPath = (source) => {
      if (!source || /^(?:data:|blob:|https?:|#)/i.test(source)) return source;
      if (previewAssets.has(source)) return source;
      if (source.startsWith('images/')) return source.slice(7);
      if (source.startsWith('../Image/')) return source.slice('../Image/'.length);
      if (source.startsWith('Image/')) return source.slice('Image/'.length);
      if (!activePath) return source;
      return zipPath(activePath.slice(0, activePath.lastIndexOf('/') + 1), source.split('#')[0]);
    };
    preview.querySelectorAll('img[src], image[href], image[xlink\\:href]').forEach((image) => {
      const attribute = image.hasAttribute('src') ? 'src' : image.hasAttribute('href') ? 'href' : 'xlink:href';
      const asset = previewAssetForPath(resolveAssetPath(image.getAttribute(attribute)));
      if (asset?.url) image.setAttribute(attribute, asset.url);
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
  coverInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const asset = await toPreviewAsset(file);
    const name = uniqueAssetName(file.name || 'cover.png');
    previewAssets.forEach((existing) => { existing.isCover = false; });
    previewAssets.set(name, { ...asset, originalPath:'', isCover:true });
    coverPreview.src = asset.url;
    coverPreview.hidden = false;
    if (importedEpub) importedCoverReplaced = true;
    renderAssetShelf();
    event.target.value = '';
  });
  const visualEditor = document.createElement('div');
  visualEditor.className = 'rich-editor';
  visualEditor.contentEditable = 'true';
  visualEditor.setAttribute('aria-label', '일반 편집기');
  visualEditor.hidden = true;
  // 일반편집은 Tiptap이 준비되면 그 문서 모델을 사용한다. textarea는 XHTML
  // 모드·저장·EPUB 내보내기와 호환되는 HTML 브리지로 계속 유지한다.
  let tiptapEditor = null;
  const getVisualHtml = () => tiptapEditor ? tiptapEditor.getHTML() : visualEditor.innerHTML;
  const setVisualHtml = (html) => {
    if (tiptapEditor) tiptapEditor.commands.setContent(html || '', false);
    else visualEditor.innerHTML = html || '';
  };
  const visualSelectionStyle = document.createElement('style');
  visualSelectionStyle.textContent = '::highlight(epub-visual-selection){background:#ff510070;color:inherit;}';
  document.head.append(visualSelectionStyle);
  let lastVisualRange = null;
  const refreshVisualSelectionHighlight = () => {
    const registry = window.CSS?.highlights;
    if (!registry || typeof window.Highlight !== 'function') return;
    registry.delete('epub-visual-selection');
    if (!lastVisualRange || lastVisualRange.collapsed || !visualEditor.contains(lastVisualRange.commonAncestorContainer)) return;
    try { registry.set('epub-visual-selection', new window.Highlight(lastVisualRange.cloneRange())); }
    catch { /* 선택 범위가 DOM 변경으로 무효화된 경우 다음 선택에서 다시 만든다. */ }
  };
  const rememberVisualRange = () => {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    // 툴바 input을 누른 뒤에는 브라우저 selection이 input으로 옮겨간다. 이때
    // 본문의 드래그 범위를 덮어쓰면 단락 전체 fallback이 실행된다.
    if (range && visualEditor.contains(range.commonAncestorContainer)) {
      lastVisualRange = range.cloneRange();
      refreshVisualSelectionHighlight();
    }
  };
  const restoreVisualRange = () => {
    if (!lastVisualRange || !visualEditor.contains(lastVisualRange.commonAncestorContainer)) return null;
    const selection = window.getSelection();
    visualEditor.focus();
    selection.removeAllRanges();
    selection.addRange(lastVisualRange);
    refreshVisualSelectionHighlight();
    return selection.getRangeAt(0);
  };
  const storedVisualRange = () => (
    lastVisualRange && visualEditor.contains(lastVisualRange.commonAncestorContainer)
      ? lastVisualRange.cloneRange()
      : null
  );
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (visualEditor.contains(range.commonAncestorContainer)) {
      lastVisualRange = range.cloneRange();
      refreshVisualSelectionHighlight();
    }
  });
  const keepVisualSelection = (firstNode, lastNode = firstNode) => {
    if (!firstNode || !lastNode) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStartBefore(firstNode);
    range.setEndAfter(lastNode);
    selection.removeAllRanges();
    selection.addRange(range);
    lastVisualRange = range.cloneRange();
    refreshVisualSelectionHighlight();
  };
  const wrapVisualSelection = (range, styles) => {
    if (!range || range.collapsed) return null;
    const wrapper = document.createElement('span');
    Object.entries(styles).forEach(([property, value]) => wrapper.style.setProperty(property, value));
    try {
      // extractContents는 선택한 텍스트와 그 안의 인라인 서식만 꺼낸다. 따라서
      // 문단 전체를 건드리지 않고 선택 영역만 새 span으로 감쌀 수 있다.
      const contents = range.extractContents();
      wrapper.append(contents);
      range.insertNode(wrapper);
      return wrapper;
    } catch {
      return null;
    }
  };
  const exactSelectedStyleSpan = (range) => Array.from(visualEditor.querySelectorAll('span[style]')).find((span) => {
    const spanRange = document.createRange();
    spanRange.selectNode(span);
    return range.compareBoundaryPoints(Range.START_TO_START, spanRange) === 0
      && range.compareBoundaryPoints(Range.END_TO_END, spanRange) === 0;
  }) || null;
  const applyVisualSelectionStyle = (range, property, value) => {
    const selectedSpan = exactSelectedStyleSpan(range);
    const target = selectedSpan || wrapVisualSelection(range, { [property]:value });
    if (!target) return null;
    target.style.setProperty(property, value);
    // 같은 범위에 색상/크기를 반복 적용했을 때 이전 span 선언을 남기지 않는다.
    // 다른 속성(굵게, 기울임 등)은 유지한다.
    target.querySelectorAll('span[style]').forEach((child) => {
      child.style.removeProperty(property);
      if (!child.getAttribute('style')?.trim() && child.attributes.length === 0) child.replaceWith(...child.childNodes);
    });
    return target;
  };
  const materialiseVisualSelection = () => {
    const range = storedVisualRange();
    if (!range || range.collapsed) return null;
    const existing = exactSelectedStyleSpan(range);
    if (existing) return existing;
    const span = wrapVisualSelection(range, {});
    if (!span) return null;
    // style 속성을 남겨 이후 같은 선택 범위를 정확히 찾아 font-size만 교체한다.
    span.setAttribute('style', '');
    keepVisualSelection(span);
    return span;
  };
  const insertImageTag = (name) => {
    const asset = previewAssets.get(name);
    const activePath = importedEpub?.chapterMeta[activeChapterIndex()]?.path;
    // Imported EPUB assets retain their ZIP path.  Generate only the relative
    // reference needed by the currently-open XHTML document.
    const source = asset?.originalPath && activePath
      ? relativeEpubPath(activePath, asset.originalPath)
      : `../Image/${name}`;
    const markup = `<img src="${source}" alt="">`;
    if (visualEditor.hidden) {
      const monacoEditor = window.epubMonacoEditor;
      if (monacoEditor?.getModel()) {
        const selection = monacoEditor.getSelection() || new window.monaco.Selection(1, 1, 1, 1);
        const model = monacoEditor.getModel();
        const offset = model.getOffsetAt(selection.getStartPosition());
        monacoEditor.executeEdits('insert-epub-image', [{ range:selection, text:markup }]);
        const position = model.getPositionAt(offset + markup.length);
        monacoEditor.setPosition(position);
        monacoEditor.setSelection(new window.monaco.Selection(position.lineNumber, position.column, position.lineNumber, position.column));
        monacoEditor.focus();
        return;
      }
      htmlEditor.setRangeText(markup, htmlEditor.selectionStart, htmlEditor.selectionEnd, 'end');
      htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
      htmlEditor.focus();
      return;
    }
    if (tiptapEditor) {
      tiptapEditor.chain().focus().insertContent(markup).run();
      syncFromVisual();
      refreshPreview();
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
    htmlEditor.value = htmlEditor.value
      .replace(new RegExp(`images/${escapeRegExp(oldName)}`, 'g'), `images/${nextName}`)
      .replace(new RegExp(`\.\./Image/${escapeRegExp(oldName)}`, 'g'), `../Image/${nextName}`);
    if (!visualEditor.hidden) setVisualHtml(htmlEditor.value);
    htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
    renderAssetShelf();
    refreshPreview();
  };
  const richToolbar = document.createElement('div');
  richToolbar.className = 'rich-toolbar';
  richToolbar.hidden = true;
  richToolbar.innerHTML = `
    <button type="button" data-editor-action="undo" title="되돌리기 (Ctrl/Cmd+Z)" aria-label="되돌리기"><span aria-hidden="true">↶</span></button>
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
  mode.innerHTML = '<button type="button" data-mode-toggle aria-pressed="false">XHTML편집</button>';
  const chapterErrorAlert = document.createElement('button');
  chapterErrorAlert.type = 'button';
  chapterErrorAlert.className = 'editor-error-alert';
  chapterErrorAlert.hidden = true;
  chapterErrorAlert.setAttribute('aria-expanded', 'false');
  const chapterErrorPopover = document.createElement('section');
  chapterErrorPopover.className = 'chapter-error-popover';
  chapterErrorPopover.hidden = true;
  chapterErrorPopover.setAttribute('role', 'dialog');
  chapterErrorPopover.setAttribute('aria-label', '현재 장 XHTML 오류');
  document.body.append(chapterErrorPopover);
  let currentChapterErrors = [];
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
  editorControls.append(mode, chapterErrorAlert, toolbarViewport);
  editorFields.before(editorControls);
  editorFields.after(visualEditor);
  const chapterSearchPanel = document.createElement('section');
  chapterSearchPanel.className = 'chapter-search-panel';
  chapterSearchPanel.hidden = true;
  chapterSearchPanel.setAttribute('role', 'dialog');
  chapterSearchPanel.setAttribute('aria-label', '전체 장 검색 및 바꾸기');
  chapterSearchPanel.innerHTML = `<div class="chapter-search-head"><strong>전체 장 검색 · 바꾸기</strong><button type="button" class="chapter-search-close" aria-label="검색 패널 닫기">×</button></div><div class="chapter-search-fields"><input type="search" data-chapter-search placeholder="찾을 내용" aria-label="찾을 내용"><input type="text" data-chapter-replace placeholder="바꿀 내용" aria-label="바꿀 내용"></div><div class="chapter-search-actions"><button type="button" class="secondary" data-chapter-search-run>검색</button><button type="button" class="secondary" data-chapter-replace-all>모두 바꾸기</button></div><p class="chapter-search-summary" aria-live="polite">찾을 내용을 입력하세요.</p><ul class="chapter-search-results"></ul>`;
  document.body.append(chapterSearchPanel);
  const chapterSearchInput = chapterSearchPanel.querySelector('[data-chapter-search]');
  const chapterReplaceInput = chapterSearchPanel.querySelector('[data-chapter-replace]');
  const chapterSearchSummary = chapterSearchPanel.querySelector('.chapter-search-summary');
  const chapterSearchResults = chapterSearchPanel.querySelector('.chapter-search-results');
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

  // Dexie is persistence only.  The active BookProject remains in the
  // chapter/resource maps below; these tables contain serialised snapshots.
  const projectDatabase = new Dexie('epub-builder-projects');
  projectDatabase.version(1).stores({
    projects:'[ownerId+title], ownerId, updatedAt',
    assets:'[ownerId+title+name], [ownerId+title], ownerId',
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
      if (session?.user?.is_anonymous) {
        await supabaseClient.auth.signOut();
        session = null;
      }
      supabaseUser = session?.user || null;
      return supabaseClient;
    } catch (error) {
      console.warn('Supabase 연결을 사용할 수 없습니다.', error);
      return null;
    }
  })();
  const accountButton = accountArea.querySelector('.account-button');
  const accountPanel = accountArea.querySelector('.account-panel');
  const loginForm = accountArea.querySelector('.login-form');
  const adminForm = accountArea.querySelector('.admin-form');
  const accountMessage = accountArea.querySelector('.account-message');
  const adminPanel = accountArea.querySelector('.admin-panel');
  const usernameEmail = (username) => `${String(username).trim().toLowerCase()}@users.sitescout.local`;
  const setAccountMessage = (message, error = false) => {
    accountMessage.textContent = message;
    accountMessage.classList.toggle('error', error);
  };
  const refreshAccountUi = async () => {
    const client = await cloudReady;
    if (!client || !supabaseUser) {
      loadAccountCssPresets(null);
      accountButton.textContent = '로그인';
      adminPanel.hidden = true;
      await hydrateDrafts();
      renderDrafts();
      return;
    }
    loadAccountCssPresets(supabaseUser.id);
    const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '사용자';
    accountButton.textContent = `${username} · 로그아웃`;
    const { data } = await client.from('user_profiles').select('role').eq('user_id', supabaseUser.id).maybeSingle();
    adminPanel.hidden = data?.role !== 'admin';
    await hydrateDrafts();
  };
  accountButton.addEventListener('click', async () => {
    if (supabaseUser) {
      const client = await cloudReady;
      await client?.auth.signOut();
      supabaseUser = null;
      adminPanel.hidden = true;
      setAccountMessage('로그아웃했습니다.');
      await refreshAccountUi();
      newBookButton.click();
      return;
    }
    window.location.assign('login/');
  });
  accountArea.querySelector('.account-close').addEventListener('click', () => { accountPanel.hidden = true; });
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(loginForm);
    const client = await cloudReady;
    if (!client) return setAccountMessage('Supabase에 연결할 수 없습니다.', true);
    const { data, error } = await client.auth.signInWithPassword({ email:usernameEmail(form.get('username')), password:String(form.get('password')) });
    if (error) return setAccountMessage(error.message || '로그인에 실패했습니다.', true);
    supabaseUser = data.user;
    await refreshAccountUi();
    accountPanel.hidden = true;
    setAccountMessage('로그인했습니다.');
    await restoreCloudDrafts();
    renderDrafts();
  });
  adminForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(adminForm);
    const client = await cloudReady;
    const { data, error } = await client.functions.invoke('account-admin', { body:{ username:form.get('username'), password:form.get('password'), action:'create' } });
    if (error || data?.error) return setAccountMessage(data?.error || error?.message || '아이디 발급에 실패했습니다.', true);
    adminForm.reset();
    setAccountMessage(`아이디 ${data.username}을(를) 발급했습니다.`);
  });
  const persistenceOwnerId = () => supabaseUser?.id || 'local';
  const cloudAssetPath = (title, name) => `${supabaseUser.id}/${encodeURIComponent(title)}/${encodeURIComponent(name)}`;
  const saveDraftAssets = async (title) => {
    const ownerId = persistenceOwnerId();
    await projectDatabase.transaction('rw', projectDatabase.assets, async () => {
      await projectDatabase.assets.where('[ownerId+title]').equals([ownerId, title]).delete();
      await projectDatabase.assets.bulkPut(Array.from(previewAssets, ([name, asset]) => ({
        ownerId, title, name, blob:asset.blob, mediaType:asset.type,
        originalPath:asset.originalPath || '', isCover:Boolean(asset.isCover),
      })));
    });
  };
  const loadDraftAssets = async (draft) => {
    clearPreviewAssets();
    const ownerId = persistenceOwnerId();
    for (const asset of draft.assets || []) {
      let blob = (await projectDatabase.assets.get([ownerId, draft.title, asset.name]))?.blob || null;
      if (!blob) {
        const client = await cloudReady;
        if (client && supabaseUser) {
          const { data } = await client.storage.from('epub-assets').download(cloudAssetPath(draft.title, asset.name));
          blob = data || null;
        }
      }
      if (blob) previewAssets.set(asset.name, {
        type:asset.type,
        blob,
        url:URL.createObjectURL(blob),
        originalPath:asset.originalPath || '',
        isCover:Boolean(asset.isCover),
      });
    }
    renderAssetShelf();
  };
  const deleteDraftAssets = async (draft) => {
    await projectDatabase.assets.where('[ownerId+title]').equals([persistenceOwnerId(), draft.title]).delete();
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
    await projectDatabase.assets.bulkDelete(names.map((name) => [persistenceOwnerId(), title, name]));
  };
  const draftButton = document.createElement('button');
  draftButton.type = 'button';
  draftButton.className = 'secondary';
  draftButton.textContent = '임시저장';
  exportButton.before(draftButton);
  const autoFixHtmlButton = document.createElement('button');
  autoFixHtmlButton.type = 'button';
  autoFixHtmlButton.className = 'secondary';
  autoFixHtmlButton.textContent = 'XHTML 자동수정';
  autoFixHtmlButton.title = 'XHTML 들여쓰기, 태그 구조, self-closing 빈 태그를 정리합니다.';
  exportButton.before(autoFixHtmlButton);
  const proofreadButton = document.createElement('button');
  proofreadButton.type = 'button';
  proofreadButton.className = 'secondary';
  proofreadButton.textContent = '교정';
  proofreadButton.title = '현재 장의 텍스트만 Gemini로 교정합니다.';
  proofreadButton.setAttribute('aria-haspopup', 'dialog');
  autoFixHtmlButton.after(proofreadButton);
  const footnoteButton = document.createElement('button');
  footnoteButton.type = 'button';
  footnoteButton.className = 'secondary';
  footnoteButton.textContent = '각주 삽입';
  footnoteButton.title = '현재 커서 위치에 EPUB 3 각주 링크를 삽입합니다.';
  // 본문을 보며 누르는 동작이므로 상단 내보내기 묶음이 아니라 편집기 하단의
  // 이미지·미리보기·삭제 버튼과 같은 편집 도구 줄에 둔다.
  editorActions.append(footnoteButton);
  const epubTransfer = document.createElement('div');
  epubTransfer.className = 'epub-transfer';
  const importButton = document.createElement('button');
  importButton.type = 'button';
  importButton.className = 'primary';
  importButton.textContent = 'EPUB 가져오기';
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.epub,application/epub+zip,application/zip';
  importInput.hidden = true;
  exportButton.before(epubTransfer);
  epubTransfer.append(importButton, exportButton);
  document.body.append(importInput);
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
  let draftIndex = [];
  let hydratedDraftOwner = null;
  let restoredLastProjectOwner = null;
  const getDrafts = () => draftIndex.map((draft) => ({ ...draft }));
  const persistDraftIndex = async () => {
    const ownerId = persistenceOwnerId();
    const snapshots = draftIndex.map((payload) => ({ ownerId, title:payload.title, payload, updatedAt:payload.updatedAt || new Date().toISOString() }));
    await projectDatabase.transaction('rw', projectDatabase.projects, async () => {
      await projectDatabase.projects.where('ownerId').equals(ownerId).delete();
      await projectDatabase.projects.bulkPut(snapshots);
    });
  };
  const setDrafts = (drafts) => {
    draftIndex = drafts.map((draft) => ({ ...draft }));
    void persistDraftIndex().catch((error) => console.warn('Dexie 임시저장 인덱스 저장 실패', error));
  };
  const hydrateDrafts = async () => {
    const ownerId = persistenceOwnerId();
    if (hydratedDraftOwner === ownerId) return;
    const rows = await projectDatabase.projects.where('ownerId').equals(ownerId).toArray();
    draftIndex = rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).map((row) => row.payload).filter((draft) => draft?.title);
    hydratedDraftOwner = ownerId;
    renderDrafts();
    if (restoredLastProjectOwner !== ownerId && draftIndex[0]) {
      restoredLastProjectOwner = ownerId;
      await loadDraft(draftIndex[0]);
    }
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
  const GEMINI_API_KEY_STORAGE = 'epub-gemini-api-key-v1';
  const GEMINI_PROMPT_STORAGE = 'epub-gemini-proofread-prompt-v1';
  const DEFAULT_GEMINI_PROMPT = `한국어 맞춤법을 교정해 주세요.

원문의 의미와 문체는 유지하고,
맞춤법, 띄어쓰기, 표준 표기, 문장부호만 자연스럽게 교정해 주세요.

불필요한 문장 재작성이나 표현 개선은 하지 마세요.

교정된 본문만 반환하세요.`;
  const geminiSettingsStyle = document.createElement('style');
  geminiSettingsStyle.textContent = `
    .gemini-settings-dialog{width:min(680px,calc(100vw - 32px));max-height:min(78vh,760px);padding:0;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--text);box-shadow:0 24px 72px #000a}.gemini-settings-dialog::backdrop{background:#0009}.gemini-dialog-head,.gemini-dialog-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)}.gemini-dialog-footer{border-top:1px solid var(--line);border-bottom:0}.gemini-dialog-head h2{margin:0;font-size:14px}.gemini-dialog-tabs{display:flex;gap:4px;padding:10px 16px 0}.gemini-dialog-tabs button{border:0;border-bottom:2px solid var(--accent);padding:6px 2px;background:transparent;color:var(--text);font:700 12px inherit}.gemini-settings-form{display:grid;gap:12px;padding:14px 16px}.gemini-settings-form label{display:grid;gap:6px;color:var(--sub);font-size:12px}.gemini-settings-form input,.gemini-settings-form textarea{width:100%;box-sizing:border-box}.gemini-settings-form textarea{min-height:180px;resize:vertical;line-height:1.55}.gemini-dialog-head button,.gemini-dialog-footer button,.gemini-settings-form button{min-height:30px;border:1px solid var(--line);border-radius:7px;padding:5px 8px;background:var(--surface-2);color:var(--text);font:600 12px inherit;cursor:pointer}.gemini-dialog-head button:hover,.gemini-dialog-footer button:hover,.gemini-settings-form button:hover{border-color:var(--accent);color:var(--accent)}
  `;
  document.head.append(geminiSettingsStyle);
  const geminiSettingsDialog = document.createElement('dialog');
  geminiSettingsDialog.className = 'gemini-settings-dialog';
  geminiSettingsDialog.innerHTML = `<div class="gemini-dialog-head"><h2>설정</h2><button type="button" data-close>닫기</button></div><div class="gemini-dialog-tabs"><button type="button" aria-current="page">API 설정</button></div><form class="gemini-settings-form"><label>Gemini API Key<input name="apiKey" type="password" autocomplete="off" spellcheck="false" placeholder="AIza…" /></label><label>기본 프롬프트<textarea name="prompt" spellcheck="false"></textarea></label><div><button type="button" data-restore>기본값 복원</button></div><div class="gemini-dialog-footer"><span>키는 이 브라우저에만 저장되며 EPUB·프로젝트에는 포함되지 않습니다.</span><button type="submit" class="primary">저장</button></div></form>`;
  document.body.append(geminiSettingsDialog);
  const geminiSettingsForm = geminiSettingsDialog.querySelector('form');
  const geminiApiKeyField = geminiSettingsForm.elements.apiKey;
  const geminiPromptField = geminiSettingsForm.elements.prompt;
  const readGeminiSettings = () => ({ apiKey:localStorage.getItem(GEMINI_API_KEY_STORAGE) || '', prompt:localStorage.getItem(GEMINI_PROMPT_STORAGE) || DEFAULT_GEMINI_PROMPT });
  const openGeminiSettings = () => {
    const settings = readGeminiSettings();
    geminiApiKeyField.value = settings.apiKey;
    geminiPromptField.value = settings.prompt;
    if (!geminiSettingsDialog.open) geminiSettingsDialog.showModal();
    geminiApiKeyField.focus();
  };
  geminiSettingsDialog.querySelector('[data-close]').addEventListener('click', () => geminiSettingsDialog.close());
  geminiSettingsForm.querySelector('[data-restore]').addEventListener('click', () => { geminiPromptField.value = DEFAULT_GEMINI_PROMPT; });
  geminiSettingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const apiKey = geminiApiKeyField.value.trim();
    if (!apiKey) { geminiApiKeyField.focus(); setStatus('Gemini API Key를 입력하세요.', 'error'); return; }
    localStorage.setItem(GEMINI_API_KEY_STORAGE, apiKey);
    localStorage.setItem(GEMINI_PROMPT_STORAGE, geminiPromptField.value.trim() || DEFAULT_GEMINI_PROMPT);
    geminiSettingsDialog.close(); setStatus('Gemini API 설정을 저장했습니다.');
  });
  side.querySelector('.api-settings-button').addEventListener('click', openGeminiSettings);
  const geminiApiRequiredDialog = document.createElement('dialog');
  geminiApiRequiredDialog.className = 'gemini-settings-dialog';
  geminiApiRequiredDialog.innerHTML = '<div class="gemini-dialog-head"><h2>Gemini API 설정이 필요합니다</h2><button type="button" data-close>닫기</button></div><div class="gemini-dialog-footer"><span>현재 브라우저에 API Key를 저장한 뒤 교정을 시작할 수 있습니다.</span><button type="button" class="primary" data-open-settings>설정 열기</button></div>';
  document.body.append(geminiApiRequiredDialog);
  geminiApiRequiredDialog.querySelector('[data-close]').addEventListener('click', () => geminiApiRequiredDialog.close());
  geminiApiRequiredDialog.querySelector('[data-open-settings]').addEventListener('click', () => { geminiApiRequiredDialog.close(); openGeminiSettings(); });
  const setCurrentChapter = (chapter) => {
    const index = activeChapterIndex();
    const next = {
      title: chapter.title || '',
      level: Math.max(1, Math.min(3, Number(chapter.level) || 1)),
      body: chapter.body || '',
      fileName: chapter.fileName || currentChapterFileName(index),
    };
    hydratingChapter = true;
    try {
      chapterFileNames.set(index, next.fileName);
      $('#ctitle').value = next.title;
      $('#clevel').value = String(next.level);
      sigilFileName.value = next.fileName;
      htmlEditor.value = next.body;
      // 일반편집기가 숨겨진 XHTML 모드에서도 내부 Tiptap 문서를 함께 갱신한다.
      // 그렇지 않으면 나중에 일반편집으로 전환할 때 이전 장/기본 본문이 다시 보일 수 있다.
      setVisualHtml(next.body);
      // Update Monaco directly without a textarea input event.  Its own
      // synchronisation guard prevents the old model from being saved back.
      const monacoEditor = window.epubMonacoEditor;
      if (monacoEditor && monacoEditor.getValue() !== next.body) monacoEditor.setValue(next.body);
      chapterSnapshots.set(index, next);
      const chapterButton = chapterList.querySelector(`.chapter[data-i="${index}"]`);
      if (chapterButton) setChapterButtonLabel(chapterButton, next.title, index);
    } finally {
      hydratingChapter = false;
    }
  };
  const ensureChapterSlot = () => {
    if (!chapterList.querySelector('.chapter[data-i]')) addChapter.click();
  };
  newBookButton.addEventListener('click', () => {
    importedEpub = null;
    importedCoverReplaced = false;
    footnotes.clear();
    chapterList.replaceChildren();
    chapterSnapshots.clear();
    chapterFileNames.clear();
    $('#ctitle').value = '';
    $('#clevel').value = '1';
    sigilFileName.value = '';
    htmlEditor.value = '';
    setVisualHtml('');
    $('#title').value = '';
    $('#author').value = '';
    $('#language').value = 'ko';
    $('#css').value = '';
    cssPreset.value = 'custom';
    tocExcluded.clear();
    parentTocMap.clear();
    collapsedTocRoots.clear();
    clearPreviewAssets();
    openedDraftTitle = null;
    draftButton.textContent = '임시저장';
    coverPreview.removeAttribute('src');
    coverPreview.hidden = true;
    renderAssetShelf();
    refreshChapterControls();
    refreshPreview();
    setStatus('새 전자책 편집을 시작했습니다.');
  });
  let collectingDraft = false;
  const syncOpenChapterEditor = () => {
    if (!visualEditor.hidden) {
      setVisualHtml(htmlEditor.value);
      return;
    }
    const monacoEditor = window.epubMonacoEditor;
    if (monacoEditor && monacoEditor.getValue() !== htmlEditor.value) monacoEditor.setValue(htmlEditor.value);
  };
  const footnoteEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[character]));
  const footnotePopover = document.createElement('aside');
  footnotePopover.className = 'chapter-error-popover epub-footnote-popover';
  footnotePopover.hidden = true;
  footnotePopover.setAttribute('role', 'dialog');
  footnotePopover.setAttribute('aria-label', '각주');
  document.body.append(footnotePopover);
  const closeFootnotePopover = () => { footnotePopover.hidden = true; };
  const showFootnotePopover = (anchor, content) => {
    footnotePopover.replaceChildren();
    const header = document.createElement('div');
    header.className = 'chapter-error-popover__head';
    const title = document.createElement('strong');
    title.textContent = '각주';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'chapter-error-popover__close';
    close.setAttribute('aria-label', '각주 닫기');
    close.textContent = '×';
    close.addEventListener('click', closeFootnotePopover);
    header.append(title, close);
    const body = document.createElement('p');
    body.textContent = content || '각주 내용을 찾을 수 없습니다.';
    footnotePopover.append(header, body);
    footnotePopover.hidden = false;
    const bounds = anchor.getBoundingClientRect();
    footnotePopover.style.top = `${Math.min(window.innerHeight - footnotePopover.offsetHeight - 14, bounds.bottom + 8)}px`;
    footnotePopover.style.left = `${Math.max(14, Math.min(window.innerWidth - footnotePopover.offsetWidth - 14, bounds.left))}px`;
  };
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeFootnotePopover(); });
  const createFootnoteId = () => {
    const token = globalThis.crypto?.randomUUID?.().replace(/-/g, '').slice(0, 10) || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    return `fn-${token}`;
  };
  const attributeValue = (attributes, name) => new RegExp(`\\b${name.replace(':', '\\:')}\\s*=\\s*(["'])(.*?)\\1`, 'i').exec(attributes)?.[2] || '';
  const footnoteReferencesIn = (body) => {
    const references = [];
    const pattern = /<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi;
    let match;
    while ((match = pattern.exec(body))) {
      const attributes = match[1];
      if (!/(?:^|\s)noteref(?:\s|$)/i.test(attributeValue(attributes, 'epub:type'))) continue;
      const href = attributeValue(attributes, 'href');
      const target = /(?:^|\/)footnote\.xhtml#([^#\s]+)$/i.exec(href)?.[1] || '';
      references.push({ all:match[0], offset:match.index, attributes, href, target, referenceId:attributeValue(attributes, 'id'), generated:/\bdata-sitescout-footnote\s*=/.test(attributes) });
    }
    return references;
  };
  const prepareFootnotes = (draft, { rewrite = true } = {}) => {
    const errors = [];
    const referenced = new Set();
    const seenReferenceIds = new Set();
    let number = 0;
    draft.chapters.forEach((chapter, chapterIndex) => {
      let body = chapter.body;
      body = body.replace(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi, (all, attributes, label) => {
        if (!/(?:^|\s)noteref(?:\s|$)/i.test(attributeValue(attributes, 'epub:type'))) return all;
        const href = attributeValue(attributes, 'href');
        const id = /(?:^|\/)footnote\.xhtml#([^#\s]+)$/i.exec(href)?.[1] || '';
        const referenceId = attributeValue(attributes, 'id');
        const generated = /\bdata-sitescout-footnote\s*=/.test(attributes);
        // 가져온 EPUB의 기존 noteref는 원본 footnote.xhtml을 보존해 다시
        // 내보낸다. 새 프로젝트에서 대상 데이터가 없는 noteref는 깨진 링크다.
        if (!generated && !footnotes.has(id)) {
          if (importedEpub) return all;
          errors.push({ chapter:chapterIndex + 1, message:`각주 대상 “${id || '없음'}”을(를) 찾을 수 없습니다.` });
          return all;
        }
        if (!id) {
          errors.push({ chapter:chapterIndex + 1, message:'각주 링크 href는 footnote.xhtml#각주ID 형식이어야 합니다.' });
          return all;
        }
        const footnote = footnotes.get(id);
        if (!footnote) {
          errors.push({ chapter:chapterIndex + 1, message:`각주 대상 “${id}”을(를) 찾을 수 없습니다.` });
          return all;
        }
        if (!referenceId) {
          errors.push({ chapter:chapterIndex + 1, message:`각주 “${id}”의 본문 id(ref-…)가 없습니다.` });
          return all;
        }
        if (seenReferenceIds.has(referenceId)) errors.push({ chapter:chapterIndex + 1, message:`본문 각주 id “${referenceId}”가 중복됩니다.` });
        seenReferenceIds.add(referenceId);
        referenced.add(id);
        number += 1;
        footnote.number = number;
        footnote.referenceId = referenceId;
        footnote.sourceChapterId = chapter.sourceIndex ?? chapterIndex;
        footnote.sourceFile = chapter.fileName || '';
        if (!String(footnote.content || '').trim()) errors.push({ chapter:chapterIndex + 1, message:`각주 ${number}의 내용이 비어 있습니다.` });
        if (!rewrite || !generated) return all;
        const clean = attributes
          .replace(/\bhref\s*=\s*(["']).*?\1/i, '')
          .replace(/\bid\s*=\s*(["']).*?\1/i, '')
          .trim();
        return `<a ${clean} href="footnote.xhtml#${id}" id="${referenceId}">[${number}]</a>`;
      });
      if (rewrite) chapter.body = body;
    });
    // 본문 링크를 지운 각주는 재내보내지 않는다. 링크와 데이터가 불일치하는
    // 상태가 남지 않도록 저장할 때 함께 정리한다.
    if (rewrite) Array.from(footnotes.keys()).forEach((id) => { if (!referenced.has(id)) footnotes.delete(id); });
    return { errors, notes:Array.from(footnotes.values()).filter((note) => referenced.has(note.id)).sort((a, b) => a.number - b.number) };
  };
  footnoteButton.addEventListener('click', () => {
    const content = window.prompt('각주 내용을 입력하세요.');
    if (content === null) return;
    if (!content.trim()) { setStatus('각주 내용을 입력하세요.', 'error'); return; }
    const id = createFootnoteId();
    const referenceId = `ref-${id.slice(3)}`;
    const currentDraft = collectDraft();
    const number = currentDraft.chapters.reduce((total, chapter) => total + footnoteReferencesIn(chapter.body).length, 0) + 1;
    footnotes.set(id, { id, number, content:footnoteEscape(content), sourceChapterId:activeChapterIndex(), sourceFile:currentChapterFileName(activeChapterIndex()), referenceId });
    const markup = `<sup><a epub:type="noteref" data-sitescout-footnote="${id}" href="footnote.xhtml#${id}" id="${referenceId}">[${number}]</a></sup>`;
    if (visualEditor.hidden) {
      const monacoEditor = window.epubMonacoEditor;
      if (monacoEditor?.getModel()) {
        const selection = monacoEditor.getSelection();
        const model = monacoEditor.getModel();
        const offset = model.getOffsetAt(selection.getStartPosition());
        monacoEditor.executeEdits('insert-epub-footnote', [{ range:selection, text:markup }]);
        const position = model.getPositionAt(offset + markup.length);
        monacoEditor.setPosition(position);
        monacoEditor.focus();
      } else {
        htmlEditor.setRangeText(markup, htmlEditor.selectionStart, htmlEditor.selectionEnd, 'end');
        htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
        htmlEditor.focus();
      }
    } else if (tiptapEditor) {
      tiptapEditor.chain().focus().insertContent(markup).run();
      syncFromVisual({ normalise:false });
    } else {
      restoreVisualRange() || visualEditor.focus();
      document.execCommand('insertHTML', false, markup);
      syncFromVisual({ normalise:false });
    }
    snapshotCurrentChapter();
    setStatus(`각주 ${number}을(를) 삽입했습니다.`);
  });
  const collectDraft = () => {
    saveCurrentChapter();
    const activeSourceIndex = Number(chapterList.querySelector('.chapter.active[data-i]')?.dataset.i || 0);
    const orderedIndexes = Array.from(chapterList.querySelectorAll('.chapter[data-i]')).map((chapter) => Number(chapter.dataset.i));
    const chapters = orderedIndexes.map((index) => {
      const snapshot = chapterSnapshots.get(index);
      if (!snapshot) throw new Error(`제${index + 1}장의 저장 데이터를 찾을 수 없습니다.`);
      return {
        title:snapshot.title,
        level:(parentTocMap.get(index) ?? null) === null ? 1 : 2,
        body:snapshot.body,
        // File names are maintained independently for each chapter index.
        // Do not reuse a potentially stale editor snapshot here.
        fileName:currentChapterFileName(index),
        sourceIndex:index,
      };
    });
    return {
      title: $('#title').value.trim(),
      author: $('#author').value,
      language: $('#language').value,
      css: $('#css').value,
      chapters,
      activeIndex: Math.max(0, orderedIndexes.indexOf(activeSourceIndex)),
      tocExcluded: orderedIndexes.flatMap((sourceIndex, index) => tocExcluded.has(sourceIndex) ? [index] : []),
      parentToc: orderedIndexes.flatMap((sourceIndex, index) => {
        const parent = parentTocMap.get(sourceIndex);
        const parentIndex = parent === undefined ? -1 : orderedIndexes.indexOf(parent);
        return parentIndex >= 0 ? [[index, parentIndex]] : [];
      }),
      coverSource: coverPreview.getAttribute('src') || '',
      footnotes: Array.from(footnotes.values()).map((note) => ({ ...note })),
      assets: Array.from(previewAssets.entries()).map(([name, asset]) => ({
        name,
        type:asset.type,
        originalPath:asset.originalPath || '',
        isCover:Boolean(asset.isCover),
      })),
    };
  };
  const closeChapterSearch = () => { chapterSearchPanel.hidden = true; };
  const occurrencesInChapter = (body, query) => {
    if (!query) return [];
    const matches = [];
    let offset = 0;
    while (offset <= body.length - query.length) {
      const found = body.indexOf(query, offset);
      if (found < 0) break;
      matches.push(found);
      offset = found + Math.max(1, query.length);
    }
    return matches;
  };
  const chapterSearchState = { results:[] };
  const renderChapterSearchResults = (draft = collectDraft()) => {
    const query = chapterSearchInput.value;
    chapterSearchResults.replaceChildren();
    chapterSearchState.results = [];
    if (!query) {
      chapterSearchSummary.textContent = '찾을 내용을 입력하세요.';
      return;
    }
    draft.chapters.forEach((chapter, chapterIndex) => {
      occurrencesInChapter(chapter.body, query).forEach((offset) => {
        const line = chapter.body.slice(0, offset).split('\n').length;
        const context = chapter.body.slice(Math.max(0, offset - 28), offset + query.length + 46).replace(/\s+/g, ' ');
        chapterSearchState.results.push({ chapterIndex, offset, line, title:chapter.title || '제목 없는 장', context });
      });
    });
    const chapterCount = new Set(chapterSearchState.results.map((result) => result.chapterIndex)).size;
    chapterSearchSummary.textContent = chapterSearchState.results.length ? `${chapterCount}개 장에서 ${chapterSearchState.results.length}개 항목을 찾았습니다.` : '일치하는 내용이 없습니다.';
    chapterSearchState.results.forEach((result) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chapter-search-result';
      button.textContent = `${result.title} · ${result.line}행`;
      const detail = document.createElement('small');
      detail.textContent = result.context;
      button.append(detail);
      button.addEventListener('click', () => {
        saveCurrentChapter();
        chapterList.querySelector(`.chapter[data-i="${result.chapterIndex}"]`)?.click();
        if (!visualEditor.hidden) setMode('html');
        requestAnimationFrame(() => {
          const monacoEditor = window.epubMonacoEditor;
          const position = monacoEditor?.getModel()?.getPositionAt(result.offset);
          if (!position) return;
          monacoEditor.focus();
          monacoEditor.setPosition(position);
          monacoEditor.setSelection({ startLineNumber:position.lineNumber, startColumn:position.column, endLineNumber:position.lineNumber, endColumn:position.column });
          monacoEditor.revealPositionInCenter(position);
        });
      });
      item.append(button);
      chapterSearchResults.append(item);
    });
  };
  const replaceAllChapters = () => {
    const query = chapterSearchInput.value;
    if (!query) { chapterSearchSummary.textContent = '바꿀 내용을 먼저 입력하세요.'; return; }
    const draft = collectDraft();
    const replacement = chapterReplaceInput.value;
    const changed = draft.chapters.map((chapter, index) => {
      const count = occurrencesInChapter(chapter.body, query).length;
      return count ? { index, body:chapter.body.split(query).join(replacement), count } : null;
    }).filter(Boolean);
    if (!changed.length) { chapterSearchSummary.textContent = '바꿀 일치 항목이 없습니다.'; return; }
    const total = changed.reduce((sum, chapter) => sum + chapter.count, 0);
    if (!window.confirm(`${changed.length}개 장의 ${total}개 항목을 바꿉니다. 계속할까요?`)) return;
    collectingDraft = true;
    try {
      changed.forEach(({ index, body }) => {
        chapterList.querySelector(`.chapter[data-i="${index}"]`)?.click();
        htmlEditor.value = body;
        htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
      });
      chapterList.querySelector(`.chapter[data-i="${draft.activeIndex}"]`)?.click();
    } finally {
      collectingDraft = false;
      syncOpenChapterEditor();
    }
    chapterSearchSummary.textContent = `${changed.length}개 장의 ${total}개 항목을 바꿨습니다.`;
    renderChapterSearchResults();
    setStatus(`${changed.length}개 장의 ${total}개 항목을 바꿨습니다.`);
  };
  chapterSearchPanel.querySelector('.chapter-search-close').addEventListener('click', closeChapterSearch);
  chapterSearchPanel.querySelector('[data-chapter-search-run]').addEventListener('click', () => renderChapterSearchResults());
  chapterSearchPanel.querySelector('[data-chapter-replace-all]').addEventListener('click', replaceAllChapters);
  chapterSearchInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') renderChapterSearchResults(); });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      chapterSearchPanel.hidden = false;
      chapterSearchInput.focus();
      chapterSearchInput.select();
    }
    if (event.key === 'Escape' && !chapterSearchPanel.hidden) closeChapterSearch();
  }, true);
  const epubText = (value) => new TextEncoder().encode(value);
  const epubEscape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[character]));
  const createEpubZip = async (files) => {
    const archive = new JSZip();
    // EPUB requires this exact entry to be first and stored (not compressed).
    const mimetype = files.find((file) => file.name === 'mimetype');
    if (mimetype) archive.file('mimetype', mimetype.data, { compression:'STORE' });
    files.filter((file) => file.name !== 'mimetype').forEach((file) => {
      archive.file(file.name, file.data, { compression:'DEFLATE', compressionOptions:{ level:6 } });
    });
    return archive.generateAsync({ type:'blob', mimeType:'application/epub+zip', compression:'DEFLATE', streamFiles:false });
  };
  const normaliseImportedFootnoteLinks = (body, chapterPath, footnotePath) => String(body).replace(/<a\b([^>]*)>/gi, (all, attributes) => {
    const href = attributeValue(attributes, 'href');
    const id = href.split('#')[1] || '';
    const targetPath = href ? zipPath(chapterPath.slice(0, chapterPath.lastIndexOf('/') + 1), href.split('#')[0]) : '';
    if (!id || targetPath !== footnotePath) return all;
    const withoutTarget = attributes.replace(/\s+target\s*=\s*(["']).*?\1/gi, '');
    if (/(?:^|\s)noteref(?:\s|$)/i.test(attributeValue(withoutTarget, 'epub:type'))) return `<a${withoutTarget}>`;
    return `<a${withoutTarget} epub:type="noteref">`;
  });
  const importedMetadata = (imported, draft) => {
    const identifier = imported.identifier || `urn:uuid:${crypto.randomUUID()}`;
    return `<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="pub-id">${epubEscape(identifier)}</dc:identifier><dc:title>${epubEscape(draft.title || '새 전자책')}</dc:title>${draft.author ? `<dc:creator>${epubEscape(draft.author)}</dc:creator>` : ''}<dc:language>${epubEscape(draft.language || 'ko')}</dc:language>${imported.metadataExtras || ''}<meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta></metadata>`;
  };
  const makeEpubNav = (chapters, filenames = chapters.map((_, index) => defaultChapterFileName(index)), structure = { tocExcluded, parentTocMap }) => {
    const included = chapters.filter((_, index) => !structure.tocExcluded.has(index));
    const visible = new Set(included.map((_, index) => chapters.indexOf(included[index])));
    const parentFor = (index) => {
      const seen = new Set([index]);
      let parent = structure.parentTocMap.get(index);
      while (parent !== undefined && !seen.has(parent)) {
        if (visible.has(parent)) return parent;
        seen.add(parent);
        parent = structure.parentTocMap.get(parent);
      }
      return null;
    };
    const items = included.map((chapter) => ({ chapter, index:chapters.indexOf(chapter) }));
    const render = (parent) => items.filter((item) => parentFor(item.index) === parent).map((item) => {
      const children = render(item.index);
      const link = `<a href="text/${epubEscape(filenames[item.index])}">${epubEscape(item.chapter.title || '제목 없는 장')}</a>`;
      return `<li>${link}${children ? `<ol>${children}</ol>` : ''}</li>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>목차</title></head><body><nav epub:type="toc"><h1>목차</h1><ol>${render(null)}</ol></nav></body></html>`;
  };
  const replaceXhtmlBody = (source, body) => /<body\b[^>]*>[\s\S]*?<\/body\s*>/i.test(source) ? source.replace(/(<body\b[^>]*>)[\s\S]*?(<\/body\s*>)/i, `$1${body}$2`) : source;
  const replaceXhtmlTitle = (source, title) => /<title\b[^>]*>[\s\S]*?<\/title\s*>/i.test(source) ? source.replace(/(<title\b[^>]*>)[\s\S]*?(<\/title\s*>)/i, `$1${epubEscape(title)}$2`) : source;
  const relativeEpubPath = (fromFile, toFile) => {
    const from = fromFile.split('/').slice(0, -1);
    const to = toFile.split('/');
    while (from.length && to.length && from[0] === to[0]) { from.shift(); to.shift(); }
    return `${'../'.repeat(from.length)}${to.join('/')}` || toFile.split('/').pop();
  };
  const exportImportedEpub3 = async (draft) => {
    const imported = importedEpub;
    if (!imported || imported.chapterMeta.length !== draft.chapters.length) return false;
    const output = new Map(imported.files);
    let replacementCoverType = '';
    if (importedCoverReplaced && imported.coverImagePath && draft.coverSource) {
      const blob = await fetch(draft.coverSource).then((response) => response.blob());
      output.set(imported.coverImagePath, new Uint8Array(await blob.arrayBuffer()));
      replacementCoverType = blob.type || '';
    }
    const metaForChapter = (chapter, index) => imported.chapterMeta.find((meta) => meta.index === chapter.sourceIndex) || imported.chapterMeta[index];
    draft.chapters.forEach((chapter, index) => {
      const meta = metaForChapter(chapter, index);
      const exportBody = normaliseImportedFootnoteLinks(
        chapter.body.replace(/\sdata-sitescout-footnote\s*=\s*(["']).*?\1/gi, ''), meta.path, imported.footnotePath,
      );
      let source = chapter.body === meta.body ? meta.source : replaceXhtmlBody(meta.source, exportBody);
      if (chapter.title && chapter.title !== meta.tocTitle) source = replaceXhtmlTitle(source, chapter.title);
      output.set(meta.path, epubText(source));
    });
    if (imported.stylesheetPath && output.has(imported.stylesheetPath)) output.set(imported.stylesheetPath, epubText(draft.css));
    // 원본 EPUB에 없던 새 각주만 기존 각주 문서 끝에 추가한다. 기존 footnote
    // 마크업과 내부 링크는 삭제하거나 재작성하지 않는다.
    const footnotePath = imported.footnotePath || `${imported.packageBase}text/footnote.xhtml`;
    const generatedFootnoteId = 'sitescout-footnotes';
    if (draft.footnotes?.length) {
      const asides = draft.footnotes.map((note) => {
        const sourceIndex = draft.chapters.findIndex((chapter) => chapter.sourceIndex === note.sourceChapterId);
        const source = metaForChapter(draft.chapters[Math.max(0, sourceIndex)], Math.max(0, sourceIndex));
        const href = relativeEpubPath(footnotePath, source.path);
        return `<aside epub:type="footnote" id="${epubEscape(note.id)}"><p><a href="${epubEscape(href)}#${epubEscape(note.referenceId)}">${note.number}.</a> ${note.content}</p></aside>`;
      }).join('');
      if (output.has(footnotePath)) {
        const original = zipText(output.get(footnotePath));
        const addition = `<section id="${generatedFootnoteId}" epub:type="footnotes">${asides}</section>`;
        output.set(footnotePath, epubText(/<\/body\s*>/i.test(original) ? original.replace(/<\/body\s*>/i, `${addition}</body>`) : `${original}${addition}`));
      } else {
        output.set(footnotePath, epubText(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${epubEscape(draft.language || 'ko')}"><head><title>각주</title></head><body><section id="${generatedFootnoteId}" epub:type="footnotes"><h1>각주</h1>${asides}</section></body></html>`));
      }
    }
    const draftTocExcluded = new Set(draft.tocExcluded);
    const draftParentTocMap = new Map(draft.parentToc);
    const navItems = draft.chapters.map((chapter, index) => ({ meta:metaForChapter(chapter, index), index, chapter })).filter(({ index }) => !draftTocExcluded.has(index));
    const renderNav = (parent) => navItems.filter(({ index }) => (draftParentTocMap.get(index) ?? null) === parent).map(({ meta, index, chapter }) => {
      const children = renderNav(index);
      const href = relativeEpubPath(imported.navPath, meta.path);
      return `<li><a href="${epubEscape(href)}">${epubEscape(chapter.title || meta.tocTitle || '제목 없는 장')}</a>${children ? `<ol>${children}</ol>` : ''}</li>`;
    }).join('');
    output.set(imported.navPath, epubText(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>목차</title></head><body><nav epub:type="toc"><h1>목차</h1><ol>${renderNav(null)}</ol></nav></body></html>`));
    const manifest = imported.manifest.filter((item) => !item.properties.split(/\s+/).includes('nav')).map((item) => {
      const properties = new Set(item.properties.split(/\s+/).filter(Boolean));
      if (item.href === imported.coverImagePath) properties.add('cover-image');
      const mediaType = item.href === imported.coverImagePath && replacementCoverType ? replacementCoverType : item.type;
      return `<item id="${epubEscape(item.id)}" href="${epubEscape(item.rawHref)}" media-type="${epubEscape(mediaType)}"${properties.size ? ` properties="${epubEscape(Array.from(properties).join(' '))}"` : ''}/>`;
    });
    const hasFootnoteManifest = imported.manifest.some((item) => item.href === footnotePath);
    if (draft.footnotes?.length && !hasFootnoteManifest) manifest.push(`<item id="footnotes" href="${epubEscape(relativeEpubPath(imported.packagePath, footnotePath))}" media-type="application/xhtml+xml"/>`);
    const navHref = relativeEpubPath(imported.packagePath, imported.navPath);
    manifest.push(`<item id="nav" href="${epubEscape(navHref)}" media-type="application/xhtml+xml" properties="nav"/>`);
    const orderedRefs = draft.chapters.map((chapter, index) => imported.spineRefs.find((ref) => ref.idref === metaForChapter(chapter, index).idref));
    const chapterRefIds = new Set(imported.chapterMeta.map((meta) => meta.idref));
    let chapterRefIndex = 0;
    const spineRefs = imported.spineRefs.map((ref) => {
      const next = chapterRefIds.has(ref.idref) ? orderedRefs[chapterRefIndex++] : ref;
      return { ...next };
    });
    if (draft.footnotes?.length && !spineRefs.some((ref) => ref.idref === (imported.footnoteManifestId || 'footnotes'))) spineRefs.push({ idref:'footnotes', linear:'no' });
    const spine = spineRefs.map((ref) => `<itemref idref="${epubEscape(ref.idref)}"${ref.linear ? ` linear="${epubEscape(ref.linear)}"` : ''}/>`).join('');
    const title = draft.title || '새 전자책';
    const language = draft.language || 'ko';
    output.set(imported.packagePath, epubText(`<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="${epubEscape(language)}">${importedMetadata(imported, draft)}<manifest>${manifest.join('')}</manifest><spine>${spine}</spine></package>`));
    const link = document.createElement('a');
    link.href = URL.createObjectURL(await createEpubZip(Array.from(output, ([name, data]) => ({ name, data }))));
    link.download = `${title.replace(/[\\/:*?"<>|]/g, '-')}.epub`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    setStatus(`[${title}] EPUB 3.0 파일을 다운로드했습니다. 원본 spine·경로·목차를 보존했습니다.`);
    return true;
  };
  const exportAssetAwareEpub = async () => {
    const draft = collectDraft();
    // This is the single export gateway: imported and newly-created EPUBs
    // both stop here before a ZIP Blob or download link can be made.
    const xhtmlErrors = validateAllChapters(draft);
    if (xhtmlErrors.length) {
      setStatus(`XHTML 오류 ${xhtmlErrors.length}건이 있어 EPUB을 내보낼 수 없습니다. 오류를 수정한 뒤 다시 시도하세요.`, 'error');
      return false;
    }
    const footnoteResult = prepareFootnotes(draft);
    if (footnoteResult.errors.length) {
      setStatus(`각주 오류 ${footnoteResult.errors.length}건이 있어 EPUB을 내보낼 수 없습니다. 각주 링크와 내용을 확인하세요.`, 'error');
      return false;
    }
    draft.footnotes = footnoteResult.notes.map((note) => ({ ...note }));
    draft.updatedAt = new Date().toISOString();
    if (await exportImportedEpub3(draft)) return;
    const title = draft.title || '새 전자책';
    const language = draft.language || 'ko';
    const files = [
      { name:'mimetype', data:epubText('application/epub+zip') },
      { name:'META-INF/container.xml', data:epubText('<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>') },
      { name:'EPUB/styles/book.css', data:epubText(draft.css) },
    ];
    const manifest = ['<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>', '<item id="css" href="styles/book.css" media-type="text/css"/>'];
    const spine = [];
    const usedFilenames = new Set();
    const filenames = draft.chapters.map((chapter, index) => {
      const requested = String(chapter.fileName || defaultChapterFileName(index)).trim().replace(/^.*[\\/]/, '').replace(/[<>:"|?*]/g, '-') || defaultChapterFileName(index);
      const hasXhtmlExtension = /\.xhtml?$/i.test(requested);
      const extension = hasXhtmlExtension ? '' : '.xhtml';
      const base = hasXhtmlExtension ? requested : requested || `chapter-${index + 1}`;
      let filename = `${base}${extension}`;
      let suffix = 2;
      while (usedFilenames.has(filename.toLowerCase())) {
        filename = `${base}-${suffix}${extension}`;
        suffix += 1;
      }
      usedFilenames.add(filename.toLowerCase());
      return filename;
    });
    if (draft.coverSource) {
      const coverBlob = await fetch(draft.coverSource).then((response) => response.blob());
      const coverExtension = coverBlob.type === 'image/png' ? 'png' : 'jpg';
      const coverName = `cover.${coverExtension}`;
      files.push({ name:`EPUB/Image/${coverName}`, data:new Uint8Array(await coverBlob.arrayBuffer()) });
      files.push({ name:'EPUB/text/cover.xhtml', data:epubText(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>표지</title><link rel="stylesheet" type="text/css" href="../styles/book.css"/></head><body><img src="../Image/${coverName}" alt="표지"/></body></html>`) });
      manifest.push(`<item id="cover-image" href="Image/${coverName}" media-type="${coverBlob.type}" properties="cover-image"/>`, '<item id="cover-page" href="text/cover.xhtml" media-type="application/xhtml+xml"/>');
      spine.push('<itemref idref="cover-page" linear="no"/>');
    }
    for (let index = 0; index < draft.chapters.length; index += 1) {
      const chapter = draft.chapters[index];
      const filename = filenames[index];
      // data-sitescout-footnote는 편집기 내부 재정렬용 메타데이터다. 최종 EPUB에는
      // 표준 noteref 속성과 일반 href/id 링크만 남긴다.
      const body = normaliseXhtml(chapter.body).replace(/\sdata-sitescout-footnote\s*=\s*(["']).*?\1/gi, '').replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-f]+;)/gi, '&amp;').replace(/src=(['"])images\//g, 'src=$1../Image/');
      files.push({ name:`EPUB/text/${filename}`, data:epubText(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${epubEscape(language)}"><head><meta charset="UTF-8"/><title>${epubEscape(chapter.title || title)}</title><link rel="stylesheet" type="text/css" href="../styles/book.css"/></head><body>${body}</body></html>`) });
      manifest.push(`<item id="chapter-${index + 1}" href="text/${filename}" media-type="application/xhtml+xml"/>`);
      spine.push(`<itemref idref="chapter-${index + 1}"/>`);
    }
    if (draft.footnotes.length) {
      const footnoteBody = draft.footnotes.map((note) => {
        const sourceIndex = draft.chapters.findIndex((chapter) => chapter.sourceIndex === note.sourceChapterId);
        const sourceFile = filenames[Math.max(0, sourceIndex)] || filenames[0];
        return `<aside epub:type="footnote" id="${epubEscape(note.id)}"><p><a href="${epubEscape(sourceFile)}#${epubEscape(note.referenceId)}">${note.number}.</a> ${note.content}</p></aside>`;
      }).join('');
      files.push({ name:'EPUB/text/footnote.xhtml', data:epubText(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${epubEscape(language)}"><head><meta charset="UTF-8"/><title>각주</title><link rel="stylesheet" type="text/css" href="../styles/book.css"/></head><body><section epub:type="footnotes"><h1>각주</h1>${footnoteBody}</section></body></html>`) });
      manifest.push('<item id="footnotes" href="text/footnote.xhtml" media-type="application/xhtml+xml"/>');
      spine.push('<itemref idref="footnotes" linear="no"/>');
    }
    for (let index = 0; index < draft.assets.length; index += 1) {
      const asset = draft.assets[index];
      const stored = previewAssets.get(asset.name);
      if (!stored?.blob) continue;
      files.push({ name:`EPUB/Image/${asset.name}`, data:new Uint8Array(await stored.blob.arrayBuffer()) });
      manifest.push(`<item id="image-${index + 1}" href="Image/${epubEscape(asset.name)}" media-type="${epubEscape(asset.type || 'image/png')}"/>`);
    }
    files.push({ name:'EPUB/nav.xhtml', data:epubText(makeEpubNav(draft.chapters, filenames, { tocExcluded:new Set(draft.tocExcluded), parentTocMap:new Map(draft.parentToc) })) });
    files.push({ name:'EPUB/package.opf', data:epubText(`<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="${epubEscape(language)}"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="pub-id">urn:uuid:${crypto.randomUUID()}</dc:identifier><dc:title>${epubEscape(title)}</dc:title>${draft.author ? `<dc:creator>${epubEscape(draft.author)}</dc:creator>` : ''}<dc:language>${epubEscape(language)}</dc:language><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta></metadata><manifest>${manifest.join('')}</manifest><spine>${spine.join('')}</spine></package>`) });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(await createEpubZip(files));
    link.download = `${title.replace(/[\\/:*?"<>|]/g, '-')}.epub`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    setStatus(`[${title}] EPUB 3.0 파일을 다운로드했습니다. 다운로드 폴더를 확인하세요.`);
  };
  exportButton.addEventListener('click', (event) => {
    if (!useAssetAwareExporter) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    exportAssetAwareEpub().catch((error) => setStatus(error.message || 'EPUB 파일을 만들지 못했습니다.', 'error'));
  }, true);
  const loadDraft = async (draft) => {
    if (!draft?.chapters?.length) return;
    draft = { ...draft, chapters:draft.chapters.map((chapter) => ({ ...chapter, body:dedupeAdjacentParagraphs(chapter.body) })) };
    importedEpub = null;
    footnotes.clear();
    (draft.footnotes || []).forEach((note) => {
      if (note?.id && note?.referenceId) footnotes.set(note.id, { ...note });
    });
    while (chapterList.querySelectorAll('.chapter[data-i]').length > 1) $('#del').click();
    ensureChapterSlot();
    chapterFileNames.clear();
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
    cssPreset.value = matchingCssPreset();
    tocExcluded.clear();
    (draft.tocExcluded || []).forEach((index) => tocExcluded.add(index));
    parentTocMap.clear();
    collapsedTocRoots.clear();
    (draft.parentToc || []).forEach(([child, parent]) => parentTocMap.set(Number(child), Number(parent)));
    await loadDraftAssets(draft);
    const selected = Math.max(0, Math.min(draft.activeIndex || 0, draft.chapters.length - 1));
    chapterList.querySelector(`.chapter[data-i="${selected}"]`)?.click();
    refreshChapterControls();
    // blob: URL은 새로고침 뒤 무효가 된다. 가져온 표지는 저장한 이미지 자산에서
    // 새 object URL을 만들어 우선 복원하고, 직접 업로드한 data URL만 fallback으로 쓴다.
    const restoredCover = savedCoverAsset();
    const coverSource = restoredCover?.url || (!String(draft.coverSource || '').startsWith('blob:') ? draft.coverSource : '');
    if (coverSource) {
      coverPreview.src = coverSource;
      coverPreview.hidden = false;
    } else {
      coverPreview.removeAttribute('src');
      coverPreview.hidden = true;
    }
    if (!visualEditor.hidden) setVisualHtml(htmlEditor.value);
    refreshPreview();
    hydratePreviewAssets();
    setStatus(`“${draft.title}” 임시저장본을 불러왔습니다.`);
  };
  const zipText = (bytes) => new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '');
  const zipPath = (basePath, href) => {
    try { return decodeURIComponent(new URL(href, `https://epub.local/${basePath}`).pathname.slice(1)); }
    catch { return href.replace(/^\.\//, ''); }
  };
  const unzipEpub = async (file) => {
    let archive;
    try { archive = await JSZip.loadAsync(file); }
    catch { throw new Error('유효한 EPUB(ZIP) 파일이 아닙니다.'); }
    const files = new Map();
    await Promise.all(Object.entries(archive.files)
      .filter(([, entry]) => !entry.dir)
      .map(async ([name, entry]) => files.set(name, await entry.async('uint8array'))));
    return files;
  };
  const xmlDocument = (source, label) => {
    const documentNode = new DOMParser().parseFromString(source, 'application/xml');
    if (documentNode.querySelector('parsererror')) throw new Error(`${label} 형식이 올바르지 않습니다.`);
    return documentNode;
  };
  const elementText = (documentNode, name) => documentNode.getElementsByTagNameNS('*', name)[0]?.textContent?.trim() || '';
  const xhtmlBody = (source) => /<body\b[^>]*>([\s\S]*?)<\/body\s*>/i.exec(source)?.[1] ?? source;
  const xhtmlTitle = (source) => /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(source)?.[1].replace(/<[^>]+>/g, '').trim() || '';
  const tocEntriesFromNcx = (source, basePath) => {
    const documentNode = xmlDocument(source, 'toc.ncx');
    const entries = new Map();
    const visit = (node, level, parentPath = null) => Array.from(node.children).filter((child) => child.localName === 'navPoint').forEach((point) => {
      const href = point.getElementsByTagNameNS('*', 'content')[0]?.getAttribute('src') || '';
      const path = zipPath(basePath, href.split('#')[0]);
      const title = point.getElementsByTagNameNS('*', 'text')[0]?.textContent?.trim() || '';
      if (path) entries.set(path, { title, level, parentPath });
      visit(point, level + 1, path || parentPath);
    });
    visit(documentNode.getElementsByTagNameNS('*', 'navMap')[0] || documentNode, 1);
    return entries;
  };
  const tocEntriesFromNav = (source, basePath) => {
    const documentNode = new DOMParser().parseFromString(source, 'text/html');
    const toc = Array.from(documentNode.querySelectorAll('nav')).find((node) => /(^|\s)toc(\s|$)/i.test(node.getAttribute('epub:type') || node.getAttribute('type') || '')) || documentNode.querySelector('nav');
    const entries = new Map();
    const visit = (list, level, parentPath = null) => Array.from(list?.children || []).filter((node) => node.tagName === 'LI').forEach((item) => {
      const link = item.querySelector(':scope > a');
      const path = link ? zipPath(basePath, (link.getAttribute('href') || '').split('#')[0]) : '';
      if (path) entries.set(path, { title:link.textContent.trim(), level, parentPath });
      visit(Array.from(item.children).find((node) => node.tagName === 'OL'), level + 1, path || parentPath);
    });
    visit(toc?.querySelector('ol'), 1);
    return entries;
  };
  const importEpub = async (file) => {
    const files = await unzipEpub(file);
    const container = xmlDocument(zipText(files.get('META-INF/container.xml') || new Uint8Array()), 'container.xml');
    const packagePath = container.getElementsByTagNameNS('*', 'rootfile')[0]?.getAttribute('full-path');
    if (!packagePath || !files.has(packagePath)) throw new Error('EPUB 패키지(OPF)를 찾을 수 없습니다.');
    const packageDocument = xmlDocument(zipText(files.get(packagePath)), 'EPUB 패키지');
    const packageBase = packagePath.slice(0, packagePath.lastIndexOf('/') + 1);
    const metadataNode = packageDocument.getElementsByTagNameNS('*', 'metadata')[0];
    const originalIdentifier = elementText(packageDocument, 'identifier');
    const metadataExtras = Array.from(metadataNode?.children || [])
      .filter((node) => !['identifier', 'title', 'creator', 'language'].includes(node.localName) && !(node.localName === 'meta' && node.getAttribute('property') === 'dcterms:modified'))
      .map((node) => new XMLSerializer().serializeToString(node)).join('');
    const manifest = new Map(Array.from(packageDocument.getElementsByTagNameNS('*', 'item')).map((item) => [item.getAttribute('id'), {
      id:item.getAttribute('id'), href:zipPath(packageBase, item.getAttribute('href') || ''), rawHref:item.getAttribute('href') || '', type:item.getAttribute('media-type') || '', properties:item.getAttribute('properties') || '',
    }]));
    const spineRefs = Array.from(packageDocument.getElementsByTagNameNS('*', 'itemref')).map((item) => ({ idref:item.getAttribute('idref'), linear:item.getAttribute('linear') || '' }));
    const metadataCoverId = Array.from(packageDocument.getElementsByTagNameNS('*', 'meta')).find((item) => item.getAttribute('name') === 'cover')?.getAttribute('content');
    const guideCoverRef = Array.from(packageDocument.getElementsByTagNameNS('*', 'reference')).find((item) => item.getAttribute('type') === 'cover')?.getAttribute('href') || '';
    const guideCoverPath = guideCoverRef ? zipPath(packageBase, guideCoverRef.split('#')[0]) : '';
    let coverImage = Array.from(manifest.values()).find((item) => item.properties.split(/\s+/).includes('cover-image')) || manifest.get(metadataCoverId);
    const coverPagePaths = new Set();
    if (guideCoverPath) {
      const guideItem = Array.from(manifest.values()).find((item) => item.href === guideCoverPath);
      if (guideItem?.type.includes('xhtml')) coverPagePaths.add(guideCoverPath);
      else if (guideItem?.type.startsWith('image/')) coverImage ||= guideItem;
    }
    const imageFromCoverPage = (path) => {
      const source = zipText(files.get(path) || new Uint8Array());
      const match = /(?:src|href|xlink:href)\s*=\s*(["'])(.*?)\1/i.exec(source);
      return match ? Array.from(manifest.values()).find((item) => item.href === zipPath(path.slice(0, path.lastIndexOf('/') + 1), match[2].split('#')[0])) : null;
    };
    if (!coverImage && guideCoverPath) coverImage = imageFromCoverPage(guideCoverPath);
    const spineXhtmlItems = spineRefs.map((ref) => manifest.get(ref.idref)).filter((item) => item?.type.includes('xhtml'));
    // 일부 EPUB은 OPF 표지 메타데이터가 없다. 이 경우 파일명만으로 제외하지 않고,
    // spine XHTML이 실제 이미지 리소스를 참조하며 본문 텍스트가 거의 없는지를 함께
    // 확인해 표지 페이지를 추론한다.
    const inferredCoverPage = spineXhtmlItems.find((item) => {
      const referencedImage = imageFromCoverPage(item.href);
      if (!referencedImage) return false;
      const plainText = xhtmlBody(zipText(files.get(item.href) || new Uint8Array()))
        .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return plainText.length < 80 && (/cover|front/i.test(item.rawHref) || /cover|front/i.test(referencedImage.rawHref) || item === spineXhtmlItems[0]);
    });
    if (!coverImage && inferredCoverPage) coverImage = imageFromCoverPage(inferredCoverPage.href);
    // 표지 페이지는 정확히 하나만 선택한다. 같은 이미지를 사용하는 일반 본문이나
    // 속표지를 모두 표지로 분류하면 spine에서 표지가 중복되는 문제가 생긴다.
    if (!coverPagePaths.size) {
      const coverPage = inferredCoverPage || (coverImage && spineXhtmlItems.find((item) => imageFromCoverPage(item.href)?.href === coverImage.href));
      if (coverPage) coverPagePaths.add(coverPage.href);
    }
    const spine = spineRefs.map((ref) => ({ ...ref, item:manifest.get(ref.idref) })).filter((ref) => ref.item?.type.includes('xhtml') && !coverPagePaths.has(ref.item.href));
    const chapterSources = spine;
    if (!chapterSources.length) throw new Error('불러올 XHTML 본문을 찾을 수 없습니다.');
    const navItem = Array.from(manifest.values()).find((item) => item.properties.split(/\s+/).includes('nav'));
    const ncxItem = Array.from(manifest.values()).find((item) => item.type === 'application/x-dtbncx+xml');
    const tocEntries = navItem && files.has(navItem.href) ? tocEntriesFromNav(zipText(files.get(navItem.href)), navItem.href.slice(0, navItem.href.lastIndexOf('/') + 1)) : ncxItem && files.has(ncxItem.href) ? tocEntriesFromNcx(zipText(files.get(ncxItem.href)), ncxItem.href.slice(0, ncxItem.href.lastIndexOf('/') + 1)) : new Map();
    const chapterMeta = chapterSources.map(({ item, idref, linear }, index) => {
      const source = zipText(files.get(item.href) || new Uint8Array());
      const toc = tocEntries.get(item.href);
      return { index, idref, linear, path:item.href, rawHref:item.rawHref, source, body:xhtmlBody(source), tocTitle:toc?.title || xhtmlTitle(source) || `제${index + 1}장`, tocLevel:toc?.level || 1, tocParentPath:toc?.parentPath || null, includeInToc:Boolean(toc) };
    });
    const chapters = chapterMeta.map((meta) => ({ title:meta.tocTitle, level:meta.tocLevel, body:meta.body, fileName:meta.path.split('/').pop() || defaultChapterFileName(meta.index) }));
    const title = elementText(packageDocument, 'title') || file.name.replace(/\.epub$/i, '');
    if (!window.confirm(`“${title}” EPUB의 ${chapters.length}개 장을 현재 편집기에 불러옵니다. 현재 작업 내용은 교체됩니다.`)) return;
    importedEpub = null;
    importedCoverReplaced = false;
    footnotes.clear();
    while (chapterList.querySelectorAll('.chapter[data-i]').length > 1) $('#del').click();
    ensureChapterSlot();
    chapterFileNames.clear();
    setCurrentChapter(chapters[0]);
    chapters.slice(1).forEach((chapter) => { addChapter.click(); setCurrentChapter(chapter); });
    $('#title').value = title;
    $('#author').value = elementText(packageDocument, 'creator');
    $('#language').value = elementText(packageDocument, 'language') || 'ko';
    const stylesheet = Array.from(manifest.values()).find((item) => item.type === 'text/css' && files.has(item.href));
    $('#css').value = stylesheet ? zipText(files.get(stylesheet.href)) : '';
    cssPreset.value = 'custom';
    tocExcluded.clear();
    chapterMeta.forEach((meta) => { if (!meta.includeInToc) tocExcluded.add(meta.index); });
    parentTocMap.clear();
    collapsedTocRoots.clear();
    chapterMeta.forEach((meta) => {
      const parentIndex = chapterMeta.findIndex((candidate) => candidate.path === meta.tocParentPath);
      if (parentIndex >= 0) parentTocMap.set(meta.index, parentIndex);
    });
    clearPreviewAssets();
    // Keep every image declared by the OPF manifest, including unused images.
    // Its full ZIP path is the map key so case and directory names remain exact
    // for both preview resolution and a later source-preserving export.
    Array.from(manifest.values()).forEach((item) => {
      if (!item.type.startsWith('image/') || !files.has(item.href)) return;
      const blob = new Blob([files.get(item.href)], { type:item.type });
      const fileName = uniqueAssetName(item.href.split('/').pop() || 'image');
      previewAssets.set(fileName, {
        type:item.type,
        blob,
        url:URL.createObjectURL(blob),
        originalPath:item.href,
        isCover:item.href === coverImage?.href,
      });
    });
    const coverAsset = coverImage && previewAssetForPath(coverImage.href);
    if (coverAsset) { coverPreview.src = coverAsset.url; coverPreview.hidden = false; }
    else { coverPreview.removeAttribute('src'); coverPreview.hidden = true; }
    const footnoteItem = Array.from(manifest.values()).find((item) => item.type.includes('xhtml') && files.has(item.href) && (
      /<aside\b[^>]*\bepub:type\s*=\s*(["'])[^"']*\bfootnote\b/i.test(zipText(files.get(item.href))) ||
      /(?:^|\/)footnote\.xhtml$/i.test(item.href)
    ));
    importedEpub = {
      files, packagePath, packageBase, manifest:Array.from(manifest.values()), spineRefs, chapterMeta,
      navPath:navItem?.href || `${packageBase}nav.xhtml`, coverImagePath:coverImage?.href || '',
      coverPagePaths:Array.from(coverPagePaths), footnotePath:footnoteItem?.href || '', footnoteManifestId:footnoteItem?.id || '',
      stylesheetPath:stylesheet?.href || '', identifier:originalIdentifier, metadataExtras,
    };
    openedDraftTitle = null;
    draftButton.textContent = '임시저장';
    chapterList.querySelector('.chapter[data-i="0"]')?.click();
    // 가져온 원문은 contenteditable의 HTML 재직렬화를 거치지 않도록 XHTML 모드에서 연다.
    htmlField.hidden = false;
    richToolbar.hidden = true;
    visualEditor.hidden = true;
    const modeToggle = mode.querySelector('[data-mode-toggle]');
    modeToggle.textContent = '일반편집';
    modeToggle.setAttribute('aria-pressed', 'true');
    syncOpenChapterEditor();
    renderAssetShelf();
    refreshChapterControls();
    refreshPreview();
    hydratePreviewAssets();
    setStatus(`“${title}” EPUB을 불러왔습니다. ${chapters.length}개 장을 편집할 수 있습니다.`);
  };
  importButton.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try { await importEpub(file); }
    catch (error) { setStatus(error.message || 'EPUB 파일을 불러오지 못했습니다.', 'error'); }
    finally { importInput.value = ''; }
  });
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
        setDrafts(getDrafts().filter((item) => item.title !== draft.title));
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
    await hydrateDrafts();
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
    setDrafts(merged);
    renderDrafts();
  };
  const saveCurrentDraft = async ({ shortcut = false } = {}) => {
    await cloudReady;
    await hydrateDrafts();
    const draft = collectDraft();
    const footnoteResult = prepareFootnotes(draft);
    if (footnoteResult.errors.length) {
      setStatus(`각주 오류 ${footnoteResult.errors.length}건이 있어 저장할 수 없습니다. 각주 링크와 내용을 확인하세요.`, 'error');
      return false;
    }
    draft.footnotes = footnoteResult.notes.map((note) => ({ ...note }));
    draft.chapters.forEach((chapter) => {
      const snapshot = chapterSnapshots.get(chapter.sourceIndex);
      if (snapshot) snapshot.body = chapter.body;
    });
    const activeSnapshot = chapterSnapshots.get(activeChapterIndex());
    if (activeSnapshot && htmlEditor.value !== activeSnapshot.body) {
      htmlEditor.value = activeSnapshot.body;
      htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
      if (!visualEditor.hidden) setVisualHtml(activeSnapshot.body);
    }
    const htmlErrors = validateAllChapters(draft);
    if (!draft.title) { setStatus('책 제목을 입력한 뒤 임시저장하세요.', 'error'); return false; }
    const drafts = getDrafts();
    const existingIndex = drafts.findIndex((item) => item.title === draft.title);
    const isUpdate = openedDraftTitle === draft.title && existingIndex >= 0;
    if (existingIndex >= 0 && !isUpdate) {
      setStatus('같은 책 제목의 임시저장본이 이미 있습니다.', 'error');
      return false;
    }
    try {
      await saveDraftAssets(draft.title);
      if (isUpdate) {
        const existing = drafts[existingIndex];
        const currentNames = new Set(draft.assets.map((asset) => asset.name));
        await deleteDraftAssetNames(draft.title, (existing.assets || []).map((asset) => asset.name).filter((name) => !currentNames.has(name)));
        drafts[existingIndex] = draft;
        setDrafts(drafts);
        setStatus(`“${draft.title}” 변경사항을 저장했습니다.`);
      } else {
        setDrafts([...drafts, draft]);
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
        return false;
      }
      if (!htmlErrors.length && shortcut) setStatus('저장되었습니다.');
      return true;
    } catch {
      setStatus('임시저장 공간이 부족합니다. 이미지 용량을 줄인 뒤 다시 시도하세요.', 'error');
      return false;
    }
  };
  draftButton.addEventListener('click', () => { void saveCurrentDraft(); });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (!event.repeat) void saveCurrentDraft({ shortcut:true });
    }
  });
  renderDrafts();
  void refreshAccountUi();
  void hydrateDrafts();
  void restoreCloudDrafts();

  const refreshPreview = () => {
    snapshotCurrentChapter();
    // Preview-only sanitisation: the editor and EPUB exporter retain the
    // original XHTML verbatim, while imported content cannot execute in this
    // app's document.
    const style = document.createElement('style');
    style.textContent = $('#css').value;
    const content = document.createElement('template');
    content.innerHTML = DOMPurify.sanitize(htmlEditor.value, {
      USE_PROFILES:{ html:true, svg:true, svgFilters:true },
      ADD_ATTR:['epub:type', 'xml:lang', 'data-sitescout-footnote'],
    });
    preview.replaceChildren(style, content.content);
    hydratePreviewAssets();
  };
  $('#previewBtn').addEventListener('click', refreshPreview);
  const normaliseParagraphs = () => {
    // Tiptap은 DOM이 아닌 ProseMirror 문서 상태가 기준이다. 여기서 DOM을 직접
    // 바꾸면 선택/Undo 이력이 깨지므로 정규화는 Tiptap의 HTML 직렬화에 맡긴다.
    if (tiptapEditor) return;
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
    // 서식값을 고르지 않고 닫은 선택용 span은 저장본에 남기지 않는다.
    visualEditor.querySelectorAll('span[style=""]').forEach((span) => span.replaceWith(...span.childNodes));
  };
  const syncFromVisual = ({ normalise = true } = {}) => {
    // contenteditable의 input 이벤트마다 DOM을 재작성하면 브라우저 Undo 스택이
    // 초기화된다. 입력 중에는 값만 동기화하고, 저장·모드 전환·툴바 작업 때만
    // 문단 구조를 정리한다.
    if (normalise) normaliseParagraphs();
    htmlEditor.value = getVisualHtml();
    htmlEditor.dispatchEvent(new Event('input', { bubbles: true }));
    refreshPreview();
  };
  function saveCurrentChapter() {
    chapterFileNames.set(activeChapterIndex(), sigilFileName.value.trim());
    if (collectingDraft) return;
    if (!visualEditor.hidden) {
      syncFromVisual();
    } else {
      const monacoEditor = window.epubMonacoEditor;
      if (monacoEditor && monacoEditor.getValue() !== htmlEditor.value) htmlEditor.value = monacoEditor.getValue();
      // 기존 앱의 input 저장 핸들러를 통해 현재 장의 title·목차·본문 state를 함께 갱신한다.
      htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
    }
    snapshotCurrentChapter();
  }
  const previewBlockSelector = 'p,h1,h2,h3,h4,h5,li,blockquote,td,th';
  const sourceBlocksForTag = (tag) => Array.from(htmlEditor.value.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi')));
  const previewBlockIndex = (block) => Array.from(preview.querySelectorAll(previewBlockSelector)).indexOf(block);
  const sourceBlockForPreviewBlock = (block) => {
    const tag = block.tagName.toLowerCase();
    const occurrence = Array.from(preview.querySelectorAll(tag)).indexOf(block);
    return occurrence < 0 ? null : sourceBlocksForTag(tag)[occurrence] || null;
  };
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
  const syncHtmlPreview = (offset = htmlEditor.selectionStart) => {
    const before = htmlEditor.value.slice(0, offset);
    const matches = Array.from(before.matchAll(/<(p|h[1-5]|li|blockquote|td|th)\b[^>]*>/gi));
    if (!matches.length) return;
    const currentBlock = matches.at(-1);
    const tag = currentBlock[1].toLowerCase();
    const sourceOccurrence = sourceBlocksForTag(tag).findIndex((block) => block.index === currentBlock.index);
    const previewBlock = Array.from(preview.querySelectorAll(tag))[sourceOccurrence];
    const previewIndex = previewBlockIndex(previewBlock);
    if (previewIndex < 0) return;
    const blockContentStart = currentBlock.index + currentBlock[0].length;
    // 태그·HTML 엔티티를 브라우저가 렌더링한 텍스트 길이로 변환해 Monaco 커서와 미리보기 단어 위치를 맞춘다.
    const fragment = document.createElement('div');
    fragment.innerHTML = htmlEditor.value.slice(blockContentStart, offset);
    focusPreviewBlock(previewIndex, fragment.textContent.length);
  };
  preview.addEventListener('click', (event) => {
    const footnoteAnchor = event.target.closest('a[href]');
    if (footnoteAnchor && preview.contains(footnoteAnchor)) {
      const href = footnoteAnchor.getAttribute('href') || '';
      const id = href.split('#')[1] || '';
      const activePath = importedEpub?.chapterMeta[activeChapterIndex()]?.path || '';
      const targetPath = activePath ? zipPath(activePath.slice(0, activePath.lastIndexOf('/') + 1), href.split('#')[0]) : href.split('#')[0];
      const isFootnote = id && (targetPath === importedEpub?.footnotePath || /(?:^|\/)footnote\.xhtml$/i.test(targetPath));
      if (isFootnote) {
        event.preventDefault();
        event.stopPropagation();
        let content = footnotes.get(id)?.content || '';
        if (!content && importedEpub?.files?.has(targetPath)) {
          const documentNode = new DOMParser().parseFromString(zipText(importedEpub.files.get(targetPath)), 'text/html');
          const target = documentNode.getElementById(id);
          content = target?.closest('p,li,aside,section')?.textContent?.replace(/^\s*\d+\.?\s*/, '').trim() || target?.textContent?.trim() || '';
        }
        showFootnotePopover(footnoteAnchor, content);
        return;
      }
    }
    const previewBlock = event.target.closest(previewBlockSelector);
    if (!previewBlock || !preview.contains(previewBlock)) return;
    const index = previewBlockIndex(previewBlock);
    const sourceBlock = sourceBlockForPreviewBlock(previewBlock);
    if (index < 0 || !sourceBlock) return;
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
    const monacoEditor = window.epubMonacoEditor;
    if (monacoEditor && !htmlField.hidden) {
      const position = monacoEditor.getModel()?.getPositionAt(sourceBlock.index);
      if (!position) return;
      monacoEditor.focus();
      monacoEditor.setPosition(position);
      monacoEditor.setSelection({
        startLineNumber: position.lineNumber, startColumn: position.column,
        endLineNumber: position.lineNumber, endColumn: position.column,
      });
      monacoEditor.revealPositionInCenter(position);
      return;
    }
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
    const documentSource = `<epub-fragment xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">${prepared}</epub-fragment>`;
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
  const findHtmlErrors = (source) => {
    const errors = [];
    const stack = [];
    for (const malformed of source.matchAll(/<\s+([A-Za-z][\w:-]*)\b/g)) {
      errors.push({ line:source.slice(0, malformed.index).split('\n').length, message:`<${malformed[1]}> 태그 앞의 불필요한 공백을 제거하세요.` });
    }
    const tags = /<\/?([a-zA-Z][\w:-]*)\b[^>]*>/g;
    let match;
    while ((match = tags.exec(source))) {
      const token = match[0];
      const tag = match[1].toLowerCase();
      const line = source.slice(0, match.index).split('\n').length;
      if (token.startsWith('</')) {
        const opened = stack.at(-1);
        if (!opened) {
          errors.push({ line, message:`</${tag}>에 대응하는 여는 태그가 없습니다.` });
        } else if (opened.tag !== tag) {
          errors.push({ line, message:`</${tag}> 대신 </${opened.tag}>가 필요합니다.` });
        } else stack.pop();
      } else if (!xhtmlVoidTags.has(tag) && !token.endsWith('/>')) {
        stack.push({ tag, line });
      }
      if (!token.startsWith('</') && xhtmlVoidTags.has(tag) && !/\/\s*>$/.test(token)) errors.push({ line, message:`<${tag}>는 XHTML에서 self-closing(<${tag} />)이어야 합니다.` });
      if (!token.startsWith('</') && tag === 'img' && !/\balt\s*=\s*(['"]).*?\1/i.test(token)) errors.push({ line, message:'img 태그에 alt 속성이 없습니다.' });
    }
    stack.forEach((opened) => errors.push({ line:opened.line, message:`<${opened.tag}> 태그가 닫히지 않았습니다.` }));
    // 스택 검사로 찾기 어려운 미인용 속성, 잘못된 엔티티, 깨진 태그도
    // 실제 XML 파서로 한 번 더 검증한다. 본문 조각을 단일 XML 루트로 감싼다.
    const parsed = new DOMParser().parseFromString(`<root xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">${source}</root>`, 'application/xml');
    const parserError = parsed.getElementsByTagName('parsererror')[0];
    if (parserError) {
      const detail = parserError.textContent.replace(/\s+/g, ' ').trim();
      const line = Number(detail.match(/(?:line|행)\s*(\d+)/i)?.[1]) || 1;
      errors.push({ line, message:'XHTML XML 문법 오류가 있습니다.' });
    }
    return errors;
  };
  const findHtmlError = (source) => findHtmlErrors(source)[0] || null;
  const closeChapterErrorPopover = () => {
    chapterErrorPopover.hidden = true;
    chapterErrorAlert.setAttribute('aria-expanded', 'false');
  };
  const renderChapterErrorPopover = () => {
    chapterErrorPopover.replaceChildren();
    const header = document.createElement('div');
    header.className = 'chapter-error-popover__head';
    const title = document.createElement('span');
    title.textContent = `현재 장 오류 ${currentChapterErrors.length}개`;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'chapter-error-popover__close';
    close.setAttribute('aria-label', '오류 상세 닫기');
    close.textContent = '×';
    close.addEventListener('click', closeChapterErrorPopover);
    header.append(title, close);
    const list = document.createElement('ol');
    list.className = 'chapter-error-popover__list';
    currentChapterErrors.forEach((error) => {
      const item = document.createElement('li');
      item.textContent = `${error.line}행: ${error.message}`;
      list.append(item);
    });
    chapterErrorPopover.append(header, list);
  };
  const updateChapterErrorAlert = (errors) => {
    currentChapterErrors = errors;
    const count = errors.length;
    chapterErrorAlert.hidden = count === 0;
    chapterErrorAlert.textContent = `오류 ${count}`;
    chapterErrorAlert.title = `현재 장의 XHTML 오류 ${count}개 보기`;
    if (!count) closeChapterErrorPopover();
    else if (!chapterErrorPopover.hidden) renderChapterErrorPopover();
  };
  chapterErrorAlert.addEventListener('click', (event) => {
    event.stopPropagation();
    if (chapterErrorPopover.hidden) {
      renderChapterErrorPopover();
      chapterErrorPopover.hidden = false;
      const bounds = chapterErrorAlert.getBoundingClientRect();
      chapterErrorPopover.style.top = `${Math.min(window.innerHeight - chapterErrorPopover.offsetHeight - 14, bounds.bottom + 8)}px`;
      chapterErrorPopover.style.left = `${Math.max(14, Math.min(window.innerWidth - chapterErrorPopover.offsetWidth - 14, bounds.left))}px`;
      chapterErrorAlert.setAttribute('aria-expanded', 'true');
    } else closeChapterErrorPopover();
  });
  document.addEventListener('click', (event) => {
    if (!chapterErrorPopover.hidden && !chapterErrorPopover.contains(event.target) && event.target !== chapterErrorAlert) closeChapterErrorPopover();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeChapterErrorPopover();
  });
  const validateHtml = () => {
    const errors = findHtmlErrors(htmlEditor.value);
    // 긴 상세 문구는 작업 화면에 직접 노출하지 않고, 고정 폭 알림 버튼의 팝오버에서만 보여준다.
    xhtmlDiagnostics.hidden = true;
    updateChapterErrorAlert(errors);
  };
  const validateAllChapters = (draft = collectDraft()) => draft.chapters.flatMap((chapter, index) =>
    findHtmlErrors(chapter.body).map((error) => ({ chapter:index + 1, title:chapter.title || '제목 없는 장', ...error }))
  );
  const countXhtmlFixes = (before, after) => {
    if (before === after) return 0;
    const voidFixes = Array.from(before.matchAll(/<\s*(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b[^>]*?(?<!\/)\s*>/gi)).length;
    const malformedOpenings = Array.from(before.matchAll(/<\s+[A-Za-z][\w:-]*/g)).length;
    return Math.max(1, voidFixes + malformedOpenings);
  };
  const GEMINI_MAX_CHUNK_CHARACTERS = 12000;
  // 교정 요청은 현재 장 하나에 대해 한 번만 실행한다. 완료·실패 여부와 관계없이
  // finally에서 해제해 다음 교정 요청을 막지 않는다.
  let geminiProofreadBusy = false;
  const applyGeminiSuggestions = (items, chapterIndex) => {
    if (activeChapterIndex() !== chapterIndex) { setStatus('검사한 장이 바뀌었습니다. 현재 장을 다시 검사하세요.', 'error'); return false; }
    if (!items.length) { setStatus('수정할 항목이 없습니다.'); return true; }
    try {
      const before = htmlEditor.value;
      const edits = items.map(({ start, end, original, replacement }) => ({ start, end, original, replacement }));
      const after = applySourceEdits(before, edits);
      const monacoEditor = window.epubMonacoEditor;
      if (!visualEditor.hidden) {
        // 일반편집은 Tiptap 한 곳에만 반영한다. Monaco까지 동시에 갱신하면 재저장 때 본문이 중복될 수 있다.
        htmlEditor.value = after;
        setVisualHtml(after);
        htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
      } else if (monacoEditor && monacoEditor.getValue() === before && window.monaco) {
        const model = monacoEditor.getModel();
        monacoEditor.executeEdits('gemini-proofread', edits.sort((a, b) => b.start - a.start).map((edit) => {
          const from = model.getPositionAt(edit.start); const to = model.getPositionAt(edit.end);
          return { range:new window.monaco.Range(from.lineNumber, from.column, to.lineNumber, to.column), text:edit.replacement };
        }));
      } else { htmlEditor.value = after; htmlEditor.dispatchEvent(new Event('input', { bubbles:true })); }
      if (htmlEditor.value !== after) { htmlEditor.value = after; htmlEditor.dispatchEvent(new Event('input', { bubbles:true })); }
      snapshotCurrentChapter();
      refreshPreview();
      setStatus(`${items.length}건의 교정을 적용했습니다.`); return true;
    } catch (error) { setStatus(error.message || '교정을 적용하지 못했습니다. 다시 검사하세요.', 'error'); return false; }
  };
  proofreadButton.addEventListener('click', async () => {
    if (geminiProofreadBusy) return;
    const settings = readGeminiSettings();
    if (!settings.apiKey) {
      setStatus('Gemini API 설정이 필요합니다.', 'error');
      if (!geminiApiRequiredDialog.open) geminiApiRequiredDialog.showModal();
      return;
    }
    saveCurrentChapter();
    const chapterIndex = activeChapterIndex();
    const source = htmlEditor.value;
    const paragraphs = extractProofreadParagraphs(source);
    if (!paragraphs.length) { setStatus('현재 장에서 검사할 본문 텍스트가 없습니다.', 'error'); return; }
    geminiProofreadBusy = true; proofreadButton.disabled = true; proofreadButton.textContent = '교정 중...'; setStatus('교정 중...');
    try {
      const chunks = chunkProofreadParagraphs(paragraphs, GEMINI_MAX_CHUNK_CHARACTERS);
      const paragraphById = new Map(paragraphs.map((paragraph) => [paragraph.id, paragraph]));
      const raw = [];
      for (const chunk of chunks) raw.push(...await requestGeminiCorrections({
        apiKey:settings.apiKey,
        systemInstruction:settings.prompt,
        paragraphs:chunk,
      }));
      const seen = new Set(); const accepted = [];
      raw.forEach((result) => {
        const paragraph = paragraphById.get(result?.id);
        const correctedText = String(result?.correctedText ?? '');
        if (!paragraph || correctedText === paragraph.text || isSuspiciousCorrection(paragraph.text, correctedText)) return;
        diffPartsToSourceEdits(diffChars(paragraph.text, correctedText), paragraph, source).forEach((edit) => {
          const key = `${edit.start}:${edit.end}:${edit.replacement}`;
          if (seen.has(key) || accepted.some((item) => edit.start < item.end && edit.end > item.start)) return;
          seen.add(key); accepted.push({ ...edit, type:'교정' });
        });
      });
      applyGeminiSuggestions(accepted, chapterIndex);
    } catch (error) { console.warn('Gemini 교정 실패', error); setStatus(error.message || '교정에 실패했습니다.', 'error'); }
    finally { geminiProofreadBusy = false; proofreadButton.disabled = false; proofreadButton.textContent = '교정'; }
  });
  autoFixHtmlButton.addEventListener('click', () => {
    // Monaco·일반편집 어느 쪽에서 눌러도 현재 보이는 장의 최신 원고를 기준으로 처리한다.
    saveCurrentChapter();
    const before = htmlEditor.value;
    const normalised = normaliseXhtml(before);
    // 이미 유효한 XHTML은 들여쓰기만을 이유로 바꾸지 않는다. 명확한 오류가 있을 때만 구조를 보정한다.
    const after = normalised !== before || findHtmlError(before) ? prettyHtml(normalised) : before;
    const fixedCount = countXhtmlFixes(before, after);
    if (fixedCount) {
      htmlEditor.value = after;
      htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
      if (window.epubMonacoEditor?.getValue() !== after) window.epubMonacoEditor?.setValue(after);
      if (!visualEditor.hidden) setVisualHtml(after);
    }
    const remainingErrors = findHtmlErrors(htmlEditor.value);
    if (remainingErrors.length) {
      setStatus(`${fixedCount ? `XHTML ${fixedCount}개 항목 수정 완료` : '수정할 항목이 없습니다'} · 현재 장 오류 ${remainingErrors.length}개`, 'error');
      return;
    }
    setStatus(fixedCount ? `XHTML ${fixedCount}개 항목 수정 완료` : '수정할 항목이 없습니다.');
  });
  const setMode = (nextMode) => {
    const visual = nextMode === 'visual';
    if (visual) setVisualHtml(htmlEditor.value);
    else {
      syncFromVisual();
      htmlEditor.value = prettyHtml(htmlEditor.value);
      htmlEditor.dispatchEvent(new Event('input', { bubbles: true }));
    }
    htmlField.hidden = visual;
    richToolbar.hidden = !visual;
    visualEditor.hidden = !visual;
    const toggle = mode.querySelector('[data-mode-toggle]');
    toggle.textContent = visual ? 'XHTML편집' : '일반편집';
    toggle.setAttribute('aria-pressed', String(!visual));
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
  mode.addEventListener('click', () => setMode(visualEditor.hidden ? 'visual' : 'html'));
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
    // ProseMirror(Tiptap)는 clipboard 이벤트를 자체 transaction으로 이미 처리한다.
    // 이 fallback 로직까지 같은 이벤트를 삽입하면 같은 조각이 두 번 들어간다.
    // Tiptap을 사용할 때는 onUpdate가 XHTML·미리보기·장 snapshot을 동기화한다.
    if (tiptapEditor) return;
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
    const undoButton = richToolbar.querySelector('[data-editor-action="undo"]');
    if (tiptapEditor) {
      undoButton.disabled = !tiptapEditor.can().undo();
      return;
    }
    undoButton.disabled = false;
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
  visualEditor.addEventListener('input', () => { syncFromVisual({ normalise:false }); updateToolbarState(); syncVisualPreview(); });
  visualEditor.addEventListener('keyup', () => { rememberVisualRange(); updateToolbarState(); syncVisualPreview(); });
  visualEditor.addEventListener('mouseup', () => { rememberVisualRange(); updateToolbarState(); syncVisualPreview(); });
  richToolbar.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.editorAction === 'undo') {
      if (tiptapEditor) tiptapEditor.chain().focus().undo().run();
      else {
        restoreVisualRange() || visualEditor.focus();
        document.execCommand('undo', false, null);
      }
      syncFromVisual({ normalise:false });
      updateToolbarState();
      return;
    }
    if (tiptapEditor) {
      const chain = tiptapEditor.chain().focus();
      if (button.dataset.table !== undefined) {
        chain.insertTable({ rows:2, cols:2, withHeaderRow:true }).run();
      } else if (button.dataset.tableAction === 'row') {
        chain.addRowAfter().run();
      } else if (button.dataset.tableAction === 'column') {
        chain.addColumnAfter().run();
      } else if (button.dataset.list) {
        (button.dataset.list === 'disc' ? chain.toggleBulletList() : chain.toggleOrderedList()).run();
      } else if (button.dataset.block) {
        chain.toggleBlockquote().run();
      } else {
        const actions = {
          bold:'toggleBold', italic:'toggleItalic', superscript:'toggleSuperscript',
          subscript:'toggleSubscript', justifyLeft:'setTextAlign', justifyCenter:'setTextAlign',
          justifyRight:'setTextAlign', justifyFull:'setTextAlign',
        };
        const action = actions[button.dataset.command];
        if (!action) return;
        if (action === 'setTextAlign') {
          const alignments = { justifyLeft:'left', justifyCenter:'center', justifyRight:'right', justifyFull:'justify' };
          chain.setTextAlign(alignments[button.dataset.command]).run();
        } else chain[action]().run();
      }
      syncFromVisual();
      updateToolbarState();
      return;
    }
    restoreVisualRange() || visualEditor.focus();
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
    rememberVisualRange();
  });
  richToolbar.querySelector('[data-heading]').addEventListener('change', (event) => {
    if (tiptapEditor) {
      const level = Number(String(event.target.value).replace('h', ''));
      const chain = tiptapEditor.chain().focus();
      if (level) chain.toggleHeading({ level }).run();
      else chain.setParagraph().run();
      syncFromVisual();
      return;
    }
    visualEditor.focus();
    document.execCommand('formatBlock', false, event.target.value || 'p');
    syncFromVisual();
  });
  const fontSizeInput = richToolbar.querySelector('[data-font-size]');
  let fontSizeApplyTimer = null;
  let fontSizeValueBeforeFocus = '';
  let fontSizeValueTouched = false;
  fontSizeInput.addEventListener('focus', (event) => {
    fontSizeValueBeforeFocus = event.target.value;
    fontSizeValueTouched = false;
    // datalist는 현재 input 값을 검색어로 사용한다. 기존 14px 값을 비워 전체
    // 크기 목록을 다시 열어, 다른 값도 클릭만으로 바꿀 수 있게 한다.
    event.target.value = '';
  });
  fontSizeInput.addEventListener('input', (event) => {
    // datalist에서 항목을 고른 경우에는 blur 없이도 바로 반영한다. 직접 여러
    // 자릿수를 입력할 때는 잠깐 기다려 값이 완성된 뒤 한 번만 적용한다.
    fontSizeValueTouched = true;
    window.clearTimeout(fontSizeApplyTimer);
    fontSizeApplyTimer = window.setTimeout(() => {
      event.target.dispatchEvent(new Event('change', { bubbles:true }));
    }, 280);
  });
  fontSizeInput.addEventListener('change', (event) => {
    window.clearTimeout(fontSizeApplyTimer);
    const input = event.target;
    // 목록을 열어 보기만 하고 닫은 경우에는 기존 크기를 유지한다. 빈 값으로
    // 변경하려는 의도가 아니므로 font-size 제거로 해석하지 않는다.
    if (!fontSizeValueTouched && !input.value) {
      input.value = fontSizeValueBeforeFocus;
      return;
    }
    // 툴바 input을 클릭하면 편집기의 브라우저 선택 영역이 사라질 수 있다.
    // 마지막 선택 범위를 복원해, 텍스트 선택 시에는 단락이 아닌 그 범위만 바꾼다.
    // 폰트 크기 input이 포커스를 가진 상태에서도, 드래그해 둔 범위를 직접
    // 수정한다. focus()로 에디터를 다시 활성화하면 선택이 사라질 수 있다.
    const range = storedVisualRange();
    const hasTextSelection = Boolean(range && !range.collapsed);
    if (!input.value) {
      if (tiptapEditor) {
        // font-family 등 같은 span의 다른 속성은 보존하고 크기만 제거한다.
        tiptapEditor.chain().focus().setMark('textStyle', { fontSize:null }).run();
        syncFromVisual();
        return;
      }
      if (hasTextSelection) {
        // 기존 선택 범위에 만들어진 font-size span만 제거한다. removeFormat은 굵게,
        // 링크 등 다른 서식까지 지우므로 사용하지 않는다.
        const selectedSpans = Array.from(visualEditor.querySelectorAll('span[style*="font-size"]')).filter((span) => range.intersectsNode(span));
        selectedSpans.forEach((span) => {
          span.style.removeProperty('font-size');
          if (!span.getAttribute('style')?.trim()) span.replaceWith(...span.childNodes);
        });
      } else if (activeBlock) activeBlock.style.removeProperty('font-size');
      else window.getSelection()?.anchorNode?.parentElement?.closest('span[style*="font-size"]')?.style.removeProperty('font-size');
      syncFromVisual();
      return;
    }
    const size = /^\d+(?:\.\d+)?$/.test(input.value) ? `${input.value}px` : input.value;
    if (tiptapEditor) {
      // Tiptap의 TextStyle mark는 선택 범위를 정확히 span으로 직렬화하므로,
      // 문단 전체에 font-size가 적용되는 contenteditable fallback을 쓰지 않는다.
      tiptapEditor.chain().focus().setMark('textStyle', { fontSize:size }).run();
      syncFromVisual();
      updateToolbarState();
      return;
    }
    if (hasTextSelection) {
      const span = applyVisualSelectionStyle(range, 'font-size', size);
      if (span) {
        syncFromVisual();
        keepVisualSelection(span);
        updateToolbarState();
        return;
      }
    }
    if (!hasTextSelection && activeBlock) {
      activeBlock.style.fontSize = size;
      syncFromVisual();
      updateToolbarState();
      return;
    }
    const existingFontTags = new Set(visualEditor.querySelectorAll('font[size="7"]'));
    const sizedSpans = [];
    document.execCommand('fontSize', false, '7');
    visualEditor.querySelectorAll('font[size="7"]').forEach((font) => {
      if (existingFontTags.has(font)) return;
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.innerHTML = font.innerHTML;
      font.replaceWith(span);
      sizedSpans.push(span);
    });
    syncFromVisual();
    // 새 span으로 바뀐 뒤에도 같은 텍스트를 선택 상태로 유지한다. 이어서 색상,
    // 굵기 등 다른 서식을 선택해도 재드래그할 필요가 없다.
    if (sizedSpans.length) keepVisualSelection(sizedSpans[0], sizedSpans.at(-1));
    else rememberVisualRange();
    updateToolbarState();
  });
  fontSizeInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  fontSizeInput.addEventListener('pointerdown', () => {
    rememberVisualRange();
    // Tiptap은 선택 범위와 span mark를 자체 transaction으로 관리한다.
    if (!tiptapEditor) materialiseVisualSelection();
  }, true);
  fontSizeInput.addEventListener('blur', (event) => {
    event.target.dispatchEvent(new Event('change', { bubbles: true }));
  });
  richToolbar.querySelector('[data-font-family]').addEventListener('change', (event) => {
    const fontFamily = event.target.value;
    if (tiptapEditor) {
      const chain = tiptapEditor.chain().focus();
      if (fontFamily) chain.setMark('textStyle', { fontFamily }).run();
      else chain.unsetMark('textStyle').run();
      syncFromVisual();
      return;
    }
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
    if (tiptapEditor) {
      const chain = tiptapEditor.chain().focus();
      (event.target.value === 'disc' ? chain.toggleBulletList() : chain.toggleOrderedList()).run();
      syncFromVisual();
      return;
    }
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
    if (tiptapEditor) {
      tiptapEditor.chain().focus().setColor(event.target.value).run();
      syncFromVisual();
      return;
    }
    const range = storedVisualRange();
    if (!range) visualEditor.focus();
    const span = range && !range.collapsed ? applyVisualSelectionStyle(range, 'color', event.target.value) : null;
    if (!span) document.execCommand('foreColor', false, event.target.value);
    syncFromVisual();
    if (span) keepVisualSelection(span);
    else rememberVisualRange();
  });
  richToolbar.querySelectorAll('[data-table-color]').forEach((input) => input.addEventListener('input', (event) => {
    const table = currentTable();
    if (!table) return;
    table.querySelectorAll(event.target.dataset.tableColor === 'head' ? 'th' : 'td').forEach((cell) => { cell.style.backgroundColor = event.target.value; });
    syncFromVisual();
  }));
  document.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return;
    // 일반편집 본문에 포커스가 있을 때만 가로챈다. XHTML Monaco, 제목 입력칸
    // 등은 각 컴포넌트가 제공하는 기본 Undo 동작을 그대로 사용한다.
    if (visualEditor.hidden || !visualEditor.contains(document.activeElement)) return;
    event.preventDefault();
    if (tiptapEditor) {
      const chain = tiptapEditor.chain().focus();
      if (event.shiftKey) chain.redo().run();
      else chain.undo().run();
    } else {
      document.execCommand(event.shiftKey ? 'redo' : 'undo', false, null);
    }
    syncFromVisual({ normalise:false });
    updateToolbarState();
  });
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
        /* Monaco 내부 textarea는 실제 키보드 입력을 받으므로, 기존 직접 자식 textarea만 숨긴다. */
        .code-editor:has(#xhtml-monaco-editor) > .line-numbers,.code-editor:has(#xhtml-monaco-editor) > textarea.code{display:none!important}
        #xhtml-monaco-editor{height:100%;min-height:0;text-align:left}
        .xhtml-diagnostics{margin-top:8px;padding:8px 10px;border:1px solid #ff8b72aa;border-radius:7px;background:#ff510018;color:#ffb39d;font-size:12px;line-height:1.45}.xhtml-diagnostics[hidden]{display:none}
        .monaco-editor .xhtml-emmet-suggestion{color:#a78bfa!important}
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
        automaticLayout:true, minimap:{ enabled:false }, lineNumbers:'on', lineNumbersMinChars:2,
        glyphMargin:false, lineDecorationsWidth:0, fontSize:13, tabSize:2,
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
      editor.onDidChangeCursorPosition((event) => {
        const offset = editor.getModel()?.getOffsetAt(event.position);
        if (Number.isInteger(offset)) syncHtmlPreview(offset);
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
          window.emmetMonaco.emmetCSS?.(monaco, ['css']);
        };
        if (window.emmetMonaco) return activate();
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/emmet-monaco-es@5.7.0/dist/emmet-monaco.min.js';
        script.onload = activate;
        script.onerror = () => console.warn('Emmet 라이브러리를 불러오지 못했습니다.');
        document.head.append(script);
      };
      addEmmetLibrary();
      const cssHost = document.createElement('div');
      cssHost.id = 'css-monaco-editor';
      cssHost.setAttribute('aria-label', '공통 CSS 편집기');
      cssEditor.before(cssHost);
      const cssMonacoEditor = monaco.editor.create(cssHost, {
        value:cssEditor.value, language:'css', theme:document.documentElement.dataset.theme === 'light' ? 'vs' : 'vs-dark',
        automaticLayout:true, minimap:{ enabled:false }, lineNumbers:'on', lineNumbersMinChars:2,
        glyphMargin:false, fontSize:13, tabSize:2, insertSpaces:true, wordWrap:'on',
        quickSuggestions:true, suggestOnTriggerCharacters:true, tabCompletion:'on', formatOnPaste:true,
      });
      window.epubCssMonacoEditor = cssMonacoEditor;
      window.emmetMonaco?.emmetCSS?.(monaco, ['css']);
      let syncingCss = false;
      cssMonacoEditor.onDidChangeModelContent(() => {
        if (syncingCss) return;
        syncingCss = true;
        cssEditor.value = cssMonacoEditor.getValue();
        cssEditor.dispatchEvent(new Event('input', { bubbles:true }));
        syncingCss = false;
      });
      cssEditor.addEventListener('input', () => {
        if (syncingCss || cssMonacoEditor.getValue() === cssEditor.value) return;
        syncingCss = true;
        cssMonacoEditor.setValue(cssEditor.value);
        syncingCss = false;
      });
      const expandCssEmmet = () => {
        const model = cssMonacoEditor.getModel();
        const position = cssMonacoEditor.getPosition();
        const before = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
        const match = /([^\s{};]+)$/.exec(before);
        if (!match || !window.emmetMonaco?.expandAbbreviation) return false;
        try {
          const expanded = window.emmetMonaco.expandAbbreviation(match[1], { type:'stylesheet', syntax:'css' });
          if (!expanded || expanded === match[1]) return false;
          const start = new monaco.Position(position.lineNumber, position.column - match[1].length);
          cssMonacoEditor.executeEdits('css-emmet', [{ range:new monaco.Range(start.lineNumber, start.column, position.lineNumber, position.column), text:expanded }]);
          return true;
        } catch { return false; }
      };
      cssMonacoEditor.addAction({
        id:'epub.css.tab', label:'CSS Emmet 확장 또는 들여쓰기', keybindings:[monaco.KeyCode.Tab], precondition:'editorTextFocus',
        run:() => expandCssEmmet() || cssMonacoEditor.getAction('editor.action.indentLines')?.run(),
      });
      chapterHeader.querySelector('[data-panel="cssPanel"]')?.addEventListener('click', () => requestAnimationFrame(() => cssMonacoEditor.layout()));
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
  const installTiptapVisualEditor = async () => {
    try {
      // CDN의 ESM 번들을 사용하므로 이 정적 앱의 저장/배포 구조는 바꾸지 않는다.
      const [coreModule, starterModule, textStyleModule, colorModule, imageModule, tableModule, tableRowModule, tableCellModule, tableHeaderModule, alignModule, superModule, subModule, linkModule, underlineModule] = await Promise.all([
        import('https://esm.sh/@tiptap/core@2.11.5'),
        import('https://esm.sh/@tiptap/starter-kit@2.11.5'),
        import('https://esm.sh/@tiptap/extension-text-style@2.11.5'),
        import('https://esm.sh/@tiptap/extension-color@2.11.5'),
        import('https://esm.sh/@tiptap/extension-image@2.11.5'),
        import('https://esm.sh/@tiptap/extension-table@2.11.5'),
        import('https://esm.sh/@tiptap/extension-table-row@2.11.5'),
        import('https://esm.sh/@tiptap/extension-table-cell@2.11.5'),
        import('https://esm.sh/@tiptap/extension-table-header@2.11.5'),
        import('https://esm.sh/@tiptap/extension-text-align@2.11.5'),
        import('https://esm.sh/@tiptap/extension-superscript@2.11.5'),
        import('https://esm.sh/@tiptap/extension-subscript@2.11.5'),
        import('https://esm.sh/@tiptap/extension-link@2.11.5'),
        import('https://esm.sh/@tiptap/extension-underline@2.11.5'),
      ]);
      const Editor = coreModule.Editor;
      const Extension = coreModule.Extension;
      const Node = coreModule.Node;
      const Mark = coreModule.Mark;
      const StarterKit = starterModule.default;
      const TextStyle = textStyleModule.default;
      if (!Editor || !StarterKit || !TextStyle) throw new Error('Tiptap module unavailable');
      const InlineStyle = TextStyle.extend({
        addGlobalAttributes() {
          return [{
            types:['textStyle'],
            attributes:{
              fontSize:{ default:null, parseHTML:(element) => element.style.fontSize || null, renderHTML:(attributes) => attributes.fontSize ? { style:`font-size: ${attributes.fontSize}` } : {} },
              fontFamily:{ default:null, parseHTML:(element) => element.style.fontFamily || null, renderHTML:(attributes) => attributes.fontFamily ? { style:`font-family: ${attributes.fontFamily}` } : {} },
            },
          }];
        },
      });
      // EPUB 본문에 흔한 div/span의 class·id·style을 일반편집을 거쳤다는 이유로
      // 버리지 않도록 최소 보존 확장을 함께 등록한다.
      const Div = Node.create({
        name:'epubDiv', group:'block', content:'block*', defining:true,
        addAttributes:() => ({ class:{default:null}, id:{default:null}, style:{default:null} }),
        parseHTML:() => [{ tag:'div' }], renderHTML:({ HTMLAttributes }) => ['div', HTMLAttributes, 0],
      });
      const Span = Mark.create({
        name:'epubSpan', inclusive:false,
        addAttributes:() => ({ class:{default:null}, id:{default:null}, style:{default:null} }),
        parseHTML:() => [{ tag:'span' }], renderHTML:({ HTMLAttributes }) => ['span', HTMLAttributes, 0],
      });
      const PreserveAttributes = Extension.create({
        name:'epubPreserveAttributes',
        addGlobalAttributes() {
          return [{
            types:['paragraph','heading','blockquote','bulletList','orderedList','listItem','tableCell','tableHeader','image','link'],
            attributes:{
              class:{default:null}, id:{default:null}, style:{default:null},
              'epub:type':{ default:null, parseHTML:(element) => element.getAttribute('epub:type'), renderHTML:(attributes) => attributes['epub:type'] ? { 'epub:type':attributes['epub:type'] } : {} },
              'data-sitescout-footnote':{ default:null, parseHTML:(element) => element.getAttribute('data-sitescout-footnote'), renderHTML:(attributes) => attributes['data-sitescout-footnote'] ? { 'data-sitescout-footnote':attributes['data-sitescout-footnote'] } : {} },
            },
          }];
        },
      });
      tiptapEditor = new Editor({
        element:visualEditor,
        extensions:[
          StarterKit.configure({ link:false, underline:false }), InlineStyle,
          colorModule.default.configure({ types:['textStyle'] }), imageModule.default,
          tableModule.default.configure({ resizable:true }), tableRowModule.default, tableHeaderModule.default, tableCellModule.default,
          alignModule.default.configure({ types:['heading','paragraph'] }), superModule.default, subModule.default,
          linkModule.default.configure({ openOnClick:false }), underlineModule.default, Div, Span, PreserveAttributes,
        ],
        content:htmlEditor.value,
        parseOptions:{ preserveWhitespace:'full' },
        onUpdate:({ editor:instance }) => {
          if (visualEditor.hidden) return;
          htmlEditor.value = instance.getHTML();
          htmlEditor.dispatchEvent(new Event('input', { bubbles:true }));
          refreshPreview();
        },
      });
      visualEditor.removeAttribute('contenteditable');
      const style = document.createElement('style');
      style.textContent = '.rich-editor .ProseMirror{min-height:100%;outline:0}.rich-editor .ProseMirror:focus{outline:0}';
      document.head.append(style);
    } catch (error) {
      // 네트워크가 없는 환경에서는 기존 contenteditable을 fallback으로 유지한다.
      console.warn('Tiptap 일반편집기를 불러오지 못했습니다.', error);
    }
  };
  installMonacoEditor();
  void installTiptapVisualEditor();
  setMode('visual');
  chapterControls.classList.add('active');
  updateLineNumbers();
  validateHtml();
});

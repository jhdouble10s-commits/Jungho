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
  .editor-controls { display:flex; align-items:center; gap:10px; margin:0 0 14px; }.editor-mode { display:flex; flex:none; align-items:center; gap:4px; padding:4px; border:1px solid var(--line); border-radius:10px; background:var(--bg); }.editor-mode button { border:0; border-radius:7px; padding:7px 10px; background:transparent; color:var(--sub); font:700 12px inherit; cursor:pointer; white-space:nowrap; }.editor-mode button.active { background:var(--accent-soft); color:var(--accent); }.rich-toolbar { display:flex; flex:1; flex-wrap:nowrap; align-items:center; gap:6px; min-width:0; overflow-x:auto; padding:5px 7px; margin:0; border:1px solid var(--line); border-radius:10px; background:var(--surface-2); }.rich-toolbar button { min-width:30px; border:1px solid var(--line); border-radius:6px; padding:5px 7px; background:var(--bg); color:var(--text); font:700 12px inherit; cursor:pointer; white-space:nowrap; }.rich-toolbar button:hover { border-color:var(--accent); color:var(--accent); }.rich-toolbar input { width:31px!important; height:28px; padding:2px!important; cursor:pointer; }.rich-toolbar select { height:29px; flex:none; border:1px solid var(--line); border-radius:6px; padding:0 6px; background:var(--bg); color:var(--text); font:600 11px inherit; cursor:pointer; }.rich-toolbar .tool-separator { width:1px; height:22px; flex:none; background:var(--line); }.rich-editor { min-height:610px; padding:18px; border:1px solid var(--line); border-radius:10px; background:var(--bg); color:var(--text); line-height:1.8; outline:none; overflow:auto; }.rich-editor:focus { border-color:var(--accent); box-shadow:0 0 0 3px #ff510030; }.rich-editor img { max-width:100%; height:auto; }.rich-editor table { border-collapse:collapse; max-width:100%; }.rich-editor td,.rich-editor th { min-width:72px; border:1px solid var(--sub); padding:6px; }
  .rich-toolbar button.active { border-color:var(--accent); background:var(--accent-soft); color:var(--accent); }.rich-toolbar input[data-font-size] { width:62px!important; height:29px; flex:none; font-size:11px!important; }.rich-toolbar input[data-table-color] { width:29px!important; height:29px; flex:none; }.rich-toolbar .tool-label { flex:none; color:var(--sub); font-size:10px; white-space:nowrap; }
  h1,h2,label { color:var(--text)!important; } input,textarea { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; } input:focus,textarea:focus { border-color:var(--accent)!important; box-shadow:0 0 0 3px #ff510030!important; }.secondary { background:var(--surface-2)!important; border-color:var(--line)!important; color:var(--text)!important; }.danger { color:#ff8660!important; }.chapter { color:var(--text)!important; }.chapter:hover { background:var(--surface-2)!important; }.chapter.active { background:var(--accent-soft)!important; color:var(--accent)!important; }.preview { background:var(--bg)!important; border-color:var(--line)!important; color:var(--text)!important; }.preview-card .head { padding:0 0 12px!important; border-bottom:1px solid var(--line)!important; margin-bottom:12px; }.code { height:610px!important; }
  @media(max-width:1050px) { .grid { grid-template-columns:240px minmax(0,1fr)!important; }.preview-card { grid-column:1/-1; }.book-inline .field:nth-child(3) { display:none; } }
  @media(max-width:700px) { .app { grid-template-columns:1fr!important; }.side { display:none; } main { padding:14px!important; }.top { align-items:stretch!important; flex-direction:column; }.book-inline { margin:0; }.book-inline section { flex-wrap:wrap; }.book-inline input { width:110px!important; }.primary { align-self:flex-end; }.grid { display:block!important; }.editor,.preview-card { margin-top:16px; }.editor-controls { align-items:stretch; flex-direction:column; }.rich-toolbar { flex-wrap:wrap; }.left-panel#cssPanel .css { height:260px!important; } }
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
    <button type="button" data-command="superscript" title="위첨자">x<sup>2</sup></button>
    <button type="button" data-command="subscript" title="아래첨자">x<sub>2</sub></button>
    <span class="tool-separator"></span>
    <select data-heading aria-label="제목 단계"><option value="">본문</option><option value="h1">제목 1</option><option value="h2">제목 2</option><option value="h3">제목 3</option><option value="h4">제목 4</option><option value="h5">제목 5</option></select>
    <input data-font-size list="font-size-options" inputmode="numeric" aria-label="글자 크기" placeholder="기본" title="글자 크기 직접 입력">
    <datalist id="font-size-options"><option value="10"><option value="11"><option value="12"><option value="13"><option value="14"><option value="15"><option value="16"><option value="20"><option value="24"><option value="32"><option value="36"><option value="40"><option value="48"><option value="64"></datalist>
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
  editorControls.append(mode, richToolbar);
  editorFields.before(editorControls);
  editorFields.after(visualEditor);

  const refreshPreview = () => $('#previewBtn').click();
  const normaliseParagraphs = () => {
    Array.from(visualEditor.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const paragraph = document.createElement('p');
        paragraph.textContent = node.textContent;
        node.replaceWith(paragraph);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV') {
        const paragraph = document.createElement('p');
        paragraph.innerHTML = node.innerHTML;
        node.replaceWith(paragraph);
      }
    });
  };
  const syncFromVisual = () => {
    normaliseParagraphs();
    htmlEditor.value = visualEditor.innerHTML;
    htmlEditor.dispatchEvent(new Event('input', { bubbles: true }));
    refreshPreview();
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
    if (!htmlField.hidden) refreshPreview();
  });
  mode.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (button) setMode(button.dataset.mode);
  });
  let activeTable = null;
  const currentTable = () => activeTable || visualEditor.querySelector('table:last-of-type');
  visualEditor.addEventListener('click', (event) => {
    activeTable = event.target.closest('table');
  });
  const updateToolbarState = () => {
    const selection = window.getSelection();
    const node = selection?.anchorNode?.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection?.anchorNode?.parentElement;
    if (!node || !visualEditor.contains(node)) return;
    [['bold', 'bold'], ['italic', 'italic'], ['superscript', 'superscript'], ['subscript', 'subscript'], ['justifyLeft', 'justifyLeft'], ['justifyCenter', 'justifyCenter'], ['justifyRight', 'justifyRight'], ['justifyFull', 'justifyFull']].forEach(([command, selector]) => {
      richToolbar.querySelector(`[data-command="${selector}"]`)?.classList.toggle('active', document.queryCommandState(command));
    });
    const heading = node.closest('h1,h2,h3,h4,h5');
    richToolbar.querySelector('[data-heading]').value = heading?.tagName.toLowerCase() || '';
    const list = node.closest('ol,ul');
    richToolbar.querySelector('[data-list]').value = list ? (list.tagName === 'UL' ? 'disc' : (list.style.listStyleType || 'decimal')) : '';
    const sized = node.closest('span[style*="font-size"]');
    richToolbar.querySelector('[data-font-size]').value = sized?.style.fontSize?.replace('px', '') || '';
  };
  visualEditor.addEventListener('input', () => { syncFromVisual(); updateToolbarState(); });
  visualEditor.addEventListener('keyup', updateToolbarState);
  visualEditor.addEventListener('mouseup', updateToolbarState);
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
      const node = window.getSelection()?.anchorNode?.parentElement;
      node?.closest('span[style*="font-size"]')?.style.removeProperty('font-size');
      syncFromVisual();
      return;
    }
    const size = /^\d+(?:\.\d+)?$/.test(input.value) ? `${input.value}px` : input.value;
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

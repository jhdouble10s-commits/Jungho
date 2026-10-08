import { validateStyle, styleTags } from './text-styles.js';
import { shortcutFromEvent, validateStyleShortcut, displayStyleShortcut, readStyleShortcut } from './style-shortcuts.js';

export function mountTextStyles({ project, toolbar, cssEditor, onError }) {
  const select = toolbar.querySelector('[data-heading]');
  const sheet = document.createElement('style');
  sheet.dataset.editorTypography = '';
  document.head.append(sheet);
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-label', '텍스트 스타일 설정');
  dialog.innerHTML = `<form method="dialog">
    <header class="style-dialog-header">
      <span class="style-dialog-mark" aria-hidden="true">Aa</span>
      <div><h2>텍스트 스타일 설정</h2><p>새 스타일을 만들거나 기존 스타일을 다듬어보세요.</p></div>
    </header>
    <div class="style-dialog-body">
      <div class="style-dialog-picker"><label class="style-field"><span>스타일</span><select name="style" autofocus></select></label></div>
      <div class="style-field-group">
        <label class="style-field"><span>라벨</span><input name="label" required maxlength="100" placeholder="예: 강조문"></label>
        <div class="style-field"><span>대상 종류</span><div class="style-target-kind">
          <label><input type="radio" name="kind" value="class" checked> CSS 클래스</label>
          <label><input type="radio" name="kind" value="tag"> 태그</label>
        </div></div>
        <label class="style-field"><span data-target-label>CSS 클래스명</span><input name="target" required placeholder="예: highlight-text"></label>
        <p class="style-dialog-hint" data-target-hint>외형은 공통 CSS에서 설정합니다.</p>
      </div>
      <div class="style-field-group">
        <div class="style-field"><label for="style-shortcut-input">단축키</label><div class="style-shortcut-control">
          <input id="style-shortcut-input" name="shortcut" readonly placeholder="클릭 후 키 조합을 누르세요" aria-describedby="style-shortcut-help">
          <button type="button" data-shortcut-clear aria-label="단축키 해제">해제</button>
        </div></div>
        <p class="style-dialog-hint" id="style-shortcut-help">Ctrl/Cmd + Alt + 숫자를 권장합니다.<br>일반편집 본문에서 사용할 수 있습니다.</p>
      </div>
      <p class="style-dialog-note">CSS 클래스는 선택한 텍스트 또는 현재 블록에 적용됩니다. 태그는 현재 블록의 태그를 바꿉니다. 외형은 공통 CSS에서 설정하세요.</p>
      <p role="alert" data-style-error></p>
    </div>
    <footer class="style-dialog-footer">
      <button type="button" data-style-delete>스타일 삭제</button>
      <div><button type="button" data-style-close>닫기</button><button type="submit">저장</button></div>
    </footer>
  </form>`;
  dialog.className = 'text-style-dialog';
  const layout = document.createElement('style');
  layout.textContent = `
    .text-style-dialog{--style-label-width:92px;box-sizing:border-box;width:520px;max-width:calc(100vw - 32px);max-height:calc(100dvh - 40px);padding:0;border:1px solid var(--line);border-radius:20px;background:var(--surface);color:var(--text);box-shadow:0 24px 80px #00000038;overflow:hidden}
    .text-style-dialog::backdrop{background:#0c102052;backdrop-filter:blur(5px)}
    .text-style-dialog form{display:flex;flex-direction:column;max-height:calc(100dvh - 42px);margin:0}
    .text-style-dialog .style-dialog-header{display:flex;align-items:center;gap:14px;padding:26px 26px 22px;flex:none}
    .text-style-dialog .style-dialog-mark{display:grid;place-items:center;flex:none;width:46px;height:46px;border:1px solid color-mix(in srgb,var(--accent) 18%,transparent);border-radius:14px;background:var(--accent-soft);color:var(--accent);font:600 23px Georgia,serif;letter-spacing:-1px}
    .text-style-dialog h2{margin:0;font-size:18px;line-height:1.5;letter-spacing:-.4px}
    .text-style-dialog .style-dialog-header p{margin:4px 0 0;font-size:12px;line-height:1.6;color:var(--sub)}
    .text-style-dialog .style-dialog-body{min-height:0;overflow-y:auto;padding:0 26px 20px;overscroll-behavior:contain;scrollbar-width:thin}
    .text-style-dialog .style-dialog-picker{padding-bottom:18px}
    .text-style-dialog .style-field-group{display:grid;gap:12px;border-top:1px solid var(--line);padding:18px 0}
    .text-style-dialog .style-field{display:grid;grid-template-columns:var(--style-label-width) minmax(0,1fr);align-items:center;column-gap:18px;min-width:0;margin:0;font-size:13px;font-weight:500;line-height:1.5}
    .text-style-dialog .style-field > label{margin:0;font-size:inherit;font-weight:inherit}
    .text-style-dialog :is(input:not([type="radio"]),select){box-sizing:border-box;width:100%;min-width:0;height:40px;margin:0;padding:0 12px!important;border:1px solid var(--line)!important;border-radius:9px;background:var(--bg)!important;color:var(--text)!important;font-family:inherit;font-size:13px;font-weight:400;box-shadow:none;transition:border-color .16s,box-shadow .16s}
    .text-style-dialog .style-target-kind{display:flex;align-items:center;gap:20px;min-height:40px}
    .text-style-dialog .style-target-kind label{display:flex;align-items:center;gap:6px;white-space:nowrap;cursor:pointer;font-weight:400}
    .text-style-dialog .style-target-kind input{width:16px;height:16px;margin:0;accent-color:var(--accent)}
    .text-style-dialog select{cursor:pointer;font-weight:600}
    .text-style-dialog :is(input:not([type="radio"]),select):focus{outline:none;border-color:var(--accent)!important;box-shadow:0 0 0 3px var(--focus-fill)!important}
    .text-style-dialog input::placeholder{color:var(--sub);opacity:.72}
    .text-style-dialog input:disabled{opacity:.5;cursor:not-allowed;background:var(--surface-2)!important}
    .text-style-dialog .style-dialog-hint{margin:0 0 0 calc(var(--style-label-width) + 18px);color:var(--sub);font-size:11px;line-height:1.7}
    .text-style-dialog .style-shortcut-control{position:relative;min-width:0}
    .text-style-dialog .style-shortcut-control input{padding-right:52px!important;font-size:12px;cursor:pointer}
    .text-style-dialog button{border:1px solid transparent;border-radius:8px;background:transparent;color:var(--text);font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:background .16s,border-color .16s}
    .text-style-dialog button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
    .text-style-dialog [data-shortcut-clear]{position:absolute;right:7px;top:7px;height:26px;padding:0 7px;color:var(--sub);font-size:11px}
    .text-style-dialog [data-shortcut-clear]:hover{background:var(--surface-2);color:var(--text)}
    .text-style-dialog .style-dialog-note{margin:0;padding:12px 14px;border-radius:9px;background:var(--surface-2);color:var(--sub);font-size:11px;line-height:1.8}
    .text-style-dialog [role="alert"]{margin:12px 0 0;color:var(--destructive);font-size:12px;line-height:1.6}
    .text-style-dialog [role="alert"]:empty{display:none}
    .text-style-dialog .style-dialog-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;flex:none;padding:16px 26px;border-top:1px solid var(--line);background:var(--surface)}
    .text-style-dialog .style-dialog-footer > div{display:flex;gap:8px;margin-left:auto}
    .text-style-dialog .style-dialog-footer button{height:38px;padding:0 18px}
    .text-style-dialog [data-style-close]{border-color:var(--line)}
    .text-style-dialog [data-style-close]:hover{background:var(--surface-2)}
    .text-style-dialog .style-dialog-footer [type="submit"]{background:var(--accent);color:var(--primary-foreground);min-width:76px}
    .text-style-dialog .style-dialog-footer [type="submit"]:hover{background:color-mix(in srgb,var(--accent) 85%,var(--text))}
    .text-style-dialog .style-dialog-footer [data-style-delete]{padding:0 4px;color:var(--destructive);font-weight:500}
    .text-style-dialog [data-style-delete]:hover{text-decoration:underline}
    @media(max-width:480px){.text-style-dialog{--style-label-width:68px;border-radius:16px}.text-style-dialog .style-dialog-header{padding:20px 18px;gap:10px}.text-style-dialog .style-dialog-body{padding:0 18px 18px}.text-style-dialog .style-dialog-footer{padding:14px 18px}.text-style-dialog .style-field{column-gap:12px}.text-style-dialog .style-dialog-hint{margin-left:calc(var(--style-label-width) + 12px)}.text-style-dialog .style-dialog-mark{width:38px;height:38px}.text-style-dialog h2{font-size:16px}.text-style-dialog .style-dialog-header p{font-size:11px}}
    @media(prefers-reduced-motion:reduce){.text-style-dialog :is(input,select,button){transition:none}}
  `;
  document.head.append(layout); document.body.append(dialog);
  const form = dialog.querySelector('form');
  const fields = form.elements;
  let openedStyles = null;
  const all = () => [...project.typographyStyles, ...project.customStyles];
  const renderCss = () => { sheet.textContent = cssEditor.value ? `@scope (.rich-editor .ProseMirror) { ${cssEditor.value} }` : ''; };
  cssEditor.addEventListener('input', renderCss);
  function render() {
    const value = select.value;
    select.replaceChildren();
    project.typographyStyles.forEach(style => select.add(new Option(style.label, style.tag === 'p' ? '' : style.tag)));
    if (project.customStyles.length) {
      const group = document.createElement('optgroup'); group.label = '사용자 정의';
      project.customStyles.forEach(style => group.append(new Option(style.label, `custom:${style.id}`)));
      select.append(group);
    }
    select.add(new Option('+ 스타일 추가', 'add-style'));
    select.value = Array.from(select.options).some(option => option.value === value) ? value : '';
    renderCss();
    if (dialog.open && openedStyles !== project.typographyStyles) dialog.close();
  }
  function fill() {
    const style = all().find(item => item.id === fields.style.value);
    fields.label.value = style?.label || '';
    fields.shortcut.value = displayStyleShortcut(style?.shortcut);
    form.querySelector(`input[name="kind"][value="${style?.kind === 'tag' ? 'tag' : 'class'}"]`).checked = true;
    fields.target.value = style?.tag || style?.className || '';
    fields.target.disabled = Boolean(style);
    form.querySelectorAll('input[name="kind"]').forEach(input => { input.disabled = Boolean(style); });
    updateTarget();
    dialog.querySelector('[data-style-delete]').hidden = !style || project.typographyStyles.includes(style);
    dialog.querySelector('[data-style-error]').textContent = '';
  }
  function updateTarget() {
    const tag = form.querySelector('input[name="kind"]:checked').value === 'tag';
    dialog.querySelector('[data-target-label]').textContent = tag ? '태그명' : 'CSS 클래스명';
    dialog.querySelector('[data-target-hint]').textContent = tag ? `사용 가능한 태그: ${styleTags.join(', ')}. 외형은 공통 CSS에서 설정합니다.` : '외형은 공통 CSS에서 설정합니다.';
    fields.target.placeholder = tag ? '예: blockquote' : '예: highlight-text';
  }
  function open(add = false) {
    openedStyles = project.typographyStyles;
    fields.style.replaceChildren(...all().map(style => new Option(style.label, style.id)), new Option('+ 스타일 추가', 'new'));
    fields.style.value = add ? 'new' : project.typographyStyles.find(style => (style.tag === 'p' ? '' : style.tag) === select.value)?.id || project.customStyles.find(style => `custom:${style.id}` === select.value)?.id || 'h1';
    fill(); dialog.showModal();
  }
  function commit(typographyStyles, customStyles) {
    if (openedStyles !== project.typographyStyles) { dialog.close(); return; }
    project.typographyStyles = typographyStyles; project.customStyles = customStyles;
    openedStyles = typographyStyles;
    project.dirty = true; project.revision++;
    render(); dialog.close();
  }
  fields.style.addEventListener('change', fill);
  form.querySelectorAll('input[name="kind"]').forEach(input => input.addEventListener('change', () => { fields.target.value = ''; updateTarget(); }));
  fields.shortcut.addEventListener('keydown', event => {
    if (['Tab','Escape'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    if (['Control','Meta','Alt','Shift'].includes(event.key)) return;
    const error = dialog.querySelector('[data-style-error]');
    if (['Backspace','Delete'].includes(event.key)) { fields.shortcut.value = ''; error.textContent = ''; return; }
    try {
      const shortcut = shortcutFromEvent(event);
      if (shortcut === null) return;
      fields.shortcut.value = displayStyleShortcut(validateStyleShortcut(shortcut, all(), fields.style.value));
      error.textContent = '';
    } catch (problem) { error.textContent = problem.message; }
  });
  dialog.querySelector('[data-shortcut-clear]').addEventListener('click', () => {
    fields.shortcut.value = '';
    dialog.querySelector('[data-style-error]').textContent = '';
  });
  dialog.querySelector('[data-style-close]').addEventListener('click', () => dialog.close());
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const existing = all().find(style => style.id === fields.style.value);
      const kind = form.querySelector('input[name="kind"]:checked').value;
      const target = fields.target.value.trim();
      const style = { ...(existing || { id:crypto.randomUUID(), kind, ...(kind === 'tag' ? { tag:target.toLowerCase() } : { className:target }) }), label:fields.label.value.trim() };
      style.shortcut = validateStyleShortcut(readStyleShortcut(fields.shortcut.value), all(), style.id);
      validateStyle(style, !project.typographyStyles.some(item => item.id === style.id));
      if (!existing && all().some(item => item.kind === style.kind && (style.kind === 'tag' ? item.tag === style.tag : item.className === style.className))) throw new Error('이미 등록된 적용 대상입니다.');
      commit(project.typographyStyles.some(item => item.id === style.id) ? project.typographyStyles.map(item => item.id === style.id ? style : item) : project.typographyStyles,
        project.typographyStyles.some(item => item.id === style.id) ? project.customStyles : existing ? project.customStyles.map(item => item.id === style.id ? style : item) : [...project.customStyles, style]);
    } catch (error) { dialog.querySelector('[data-style-error]').textContent = error.message; }
  });
  dialog.querySelector('[data-style-delete]').addEventListener('click', () => {
    if (!window.confirm('이 스타일이 본문에 사용 중일 수 있습니다. 설정만 삭제하고 본문과 공통 CSS는 유지합니다.')) return;
    try { commit(project.typographyStyles, project.customStyles.filter(style => style.id !== fields.style.value)); }
    catch (error) { onError(error.message); }
  });
  render();
  return { render, open };
}

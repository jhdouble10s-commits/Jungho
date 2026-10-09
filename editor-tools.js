import * as icons from 'https://cdn.jsdelivr.net/npm/lucide@1.52.0/+esm';
import * as search from 'https://esm.sh/prosemirror-search@1.1.0?external=prosemirror-model,prosemirror-state,prosemirror-view';
import { computePosition, autoUpdate, offset, flip, shift } from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/+esm';
import { parse, generate } from './vendor/csstree.esm.js';

export const editorSearchPlugin = () => search.search();
export function setEditorActionIcon(button,icon,label) {
  button.setAttribute('aria-label',label);
  button.title = label;
  const labels = { '맞춤법 교정':'맞춤법교정', 'XHTML 자동수정':'xhtml교정', '임시저장':'저장' };
  button.classList.add('editor-action-labeled');
  button.setAttribute('aria-busy', String(icon === 'LoaderCircle'));
  button.replaceChildren(icons.createElement(icons[icon],{width:16,height:16,'aria-hidden':'true'}), document.createTextNode(labels[label] || label));
}

// Only append missing rules; never stringify or overwrite the user's stylesheet.
function indentCss(css, rules) {
  const ast = parse(css);
  const selectors = new Set();
  ast.children.forEach(node => {
    if (node.type === 'Rule' && node.prelude?.type === 'SelectorList') {
      node.prelude.children.forEach(selector => selectors.add(generate(selector)));
    }
  });
  const missing = [...rules].filter(([name]) => !selectors.has(`.${name}`));
  return missing.length ? css + '\n' + missing.map(([name, declaration]) => `.${name} { ${declaration} }`).join('\n') + '\n' : css;
}

export function mountEditorTools({ toolbar, getEditor, canEdit, cssEditor, onError }) {
  const separateUndo = () => {
    window.epubMonacoEditor?.getModel()?.pushStackElement();
  };
  const iconButton = (label, icon, action) => {
    const button = document.createElement('button');
    button.type = 'button'; button.title = label; button.setAttribute('aria-label', label);
    button.append(icons.createElement(icons[icon], {width:16,height:16,'aria-hidden':'true'}));
    button.addEventListener('click', event => { event.stopPropagation(); action(); });
    return button;
  };
  for (const [selector, icon] of [
    ['[data-editor-action="undo"]','Undo2'], ['[data-editor-action="redo"]','Redo2'], ['[data-command="bold"]','Bold'],
    ['[data-command="italic"]','Italic'], ['[data-command="superscript"]','Superscript'],
    ['[data-command="subscript"]','Subscript'], ['[data-command="justifyLeft"]','AlignLeft'],
    ['[data-command="justifyCenter"]','AlignCenter'], ['[data-command="justifyRight"]','AlignRight'],
    ['[data-command="justifyFull"]','AlignJustify'],
  ]) {
    const button = toolbar.querySelector(selector);
    button.setAttribute('aria-label', button.title);
    button.replaceChildren(icons.createElement(icons[icon], {width:16,height:16,'aria-hidden':'true'}));
  }
  const clear = iconButton('서식 지우기 (글자 서식)', 'RemoveFormatting', () => {
    if (!canEdit()) return;
    separateUndo();
    const editor = getEditor();
    let chain = editor.chain().focus();
    // Preserve link/footnote marks, class/id spans and structural nodes.
    for (const name of ['bold','italic','underline','strike','code','textStyle','superscript','subscript']) {
      if (editor.schema.marks[name]) chain = chain.unsetMark(name);
    }
    chain.command(({tr}) => {
      const {from,to} = tr.selection;
      tr.doc.nodesBetween(from,to,(node,pos) => {
        if (!node.isText) return;
        for (const mark of node.marks) {
          if (mark.type.name !== 'epubSpan' || !mark.attrs.style) continue;
          const style = document.createElement('span').style;
          style.cssText = mark.attrs.style;
          for (const property of ['font-size','font-family','font-weight','font-style','color','background-color','text-decoration','vertical-align']) style.removeProperty(property);
          const start = Math.max(pos,from), end = Math.min(pos+node.nodeSize,to);
          tr.removeMark(start,end,mark);
          const attrs = {...mark.attrs,style:style.cssText || null};
          if (Object.values(attrs).some(Boolean)) tr.addMark(start,end,mark.type.create(attrs));
        }
      });
      return true;
    }).run();
  });
  toolbar.querySelector('[data-command="subscript"]').after(clear);

  const indent = mode => {
    if (!canEdit()) return;
    separateUndo();
    const editor = getEditor(), {from,to} = editor.state.selection;
    const changes = [], rules = new Map();
    editor.state.doc.nodesBetween(from,to,(node,pos) => {
      if (!['paragraph','heading'].includes(node.type.name)) return;
      const classes = new Set((node.attrs.class || '').split(/\s+/).filter(Boolean));
      if (mode === 'first') {
        const name = 'jh-first-line-indent';
        if (classes.has(name)) classes.delete(name);
        else { classes.add(name); rules.set(name,'text-indent: 1em;'); }
      } else {
        let level = 0;
        for (let i=1;i<=4;i++) if (classes.delete(`jh-paragraph-indent-${i}`)) level = i;
        level = Math.max(0,Math.min(4,level + (mode === 'in' ? 1 : -1)));
        if (level) {
          const name = `jh-paragraph-indent-${level}`;
          classes.add(name); rules.set(name,`margin-left: ${level * 1.5}em;`);
        }
      }
      changes.push({pos, attrs:{...node.attrs, class:[...classes].join(' ') || null}});
    });
    let css;
    try { css = indentCss(cssEditor.value,rules); }
    catch { onError('공통 CSS 문법을 확인한 뒤 들여쓰기를 적용하세요.'); return; }
    if (css !== cssEditor.value) {
      cssEditor.value = css;
      cssEditor.dispatchEvent(new Event('input',{bubbles:true}));
    }
    const tr = editor.state.tr;
    for (const change of changes) tr.setNodeMarkup(change.pos,undefined,change.attrs);
    editor.view.dispatch(tr); editor.commands.focus();
  };
  for (const [label,icon,mode] of [['첫 줄 들여쓰기 켜기/끄기','Pilcrow','first'],['단락 전체 들여쓰기','IndentIncrease','in'],['단락 전체 내어쓰기','IndentDecrease','out']]) {
    toolbar.append(iconButton(label,icon,() => indent(mode)));
  }

  const tablePanel = document.createElement('div');
  tablePanel.className = 'editor-tools-table editor-popover-motion'; tablePanel.popover = 'auto';
  tablePanel.setAttribute('role','group'); tablePanel.setAttribute('aria-label','표 편집');
  document.body.append(tablePanel);
  const tableCommands = [
    ['2×2 표 삽입','Table2','insertTable',{rows:2,cols:2,withHeaderRow:true}],
    ['위에 행 추가','BetweenHorizontalStart','addRowBefore'], ['아래에 행 추가','BetweenHorizontalEnd','addRowAfter'],
    ['행 삭제','TableRowsSplit','deleteRow'], ['왼쪽에 열 추가','BetweenVerticalStart','addColumnBefore'],
    ['오른쪽에 열 추가','BetweenVerticalEnd','addColumnAfter'], ['열 삭제','TableColumnsSplit','deleteColumn'],
    ['셀 병합','Combine','mergeCells'], ['셀 분할','Split','splitCell'],
    ['표 삭제','Trash2','deleteTable'],
  ];
  const tableActions = tableCommands.map(([label,icon,command,options]) => {
    const button = iconButton(label,icon,() => {
      if (!canEdit()) return;
      separateUndo();
      getEditor().chain().focus()[command](options).run(); updateTableActions();
    });
    tablePanel.append(button); return {button,command,options};
  });
  const updateTableActions = () => {
    for (const item of tableActions) item.button.disabled = !canEdit() || !getEditor().can()[item.command](item.options);
  };
  const tableButton = iconButton('표 편집','Table2',() => {
    if (!canEdit()) return;
    updateTableActions();
    if (!tablePanel.matches(':popover-open')) tablePanel.style.visibility = 'hidden';
    tablePanel.togglePopover();
  });
  toolbar.append(tableButton);
  tableButton.setAttribute('aria-expanded', 'false');
  tableButton.setAttribute('aria-haspopup', 'true');
  let stopTablePosition;
  tablePanel.addEventListener('toggle', () => {
    stopTablePosition?.(); stopTablePosition = null;
    const open = tablePanel.matches(':popover-open');
    tableButton.setAttribute('aria-expanded', String(open));
    if (!open) return;
    stopTablePosition = autoUpdate(tableButton, tablePanel, () => {
      computePosition(tableButton, tablePanel, {strategy:'fixed', placement:'bottom-start', middleware:[offset(8), flip(), shift({padding:8})]})
        .then(({x,y}) => {
          if (!tablePanel.matches(':popover-open')) return;
          const opening = tablePanel.style.visibility === 'hidden';
          Object.assign(tablePanel.style, {left:`${x}px`,top:`${y}px`,visibility:'visible'});
          if (opening) tablePanel.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
        });
    });
  });
  // Keep the document selection when clicking an operation. Native popover
  // supplies outside-click dismissal and ESC, independently from editor focus.
  tablePanel.addEventListener('mousedown', event => { if (event.target.closest('button')) event.preventDefault(); });
  tablePanel.append(iconButton('표 도구 닫기', 'X', () => { tablePanel.hidePopover(); tableButton.focus(); }));

  // Existing table color inputs now write through ProseMirror, never live DOM.
  toolbar.querySelectorAll('[data-table-color]').forEach(input => {
    const control = input.closest('.table-color-control');
    const label = control.querySelector('.tool-label');
    label.replaceChildren(icons.createElement(icons[input.dataset.tableColor === 'head' ? 'TableProperties' : 'PaintBucket'],{width:16,height:16,'aria-hidden':'true'}));
    control.title = input.getAttribute('aria-label'); tablePanel.append(control);
    input.addEventListener('input',() => {
    if (!canEdit()) return;
    const editor = getEditor(), {$from} = editor.state.selection;
    let depth = $from.depth;
    while (depth > 0 && $from.node(depth).type.name !== 'table') depth--;
    if (!depth) return;
    const tr = editor.state.tr, start = $from.start(depth);
    $from.node(depth).descendants((node,pos) => {
      if (node.type.name !== (input.dataset.tableColor === 'head' ? 'tableHeader' : 'tableCell')) return;
      const style = document.createElement('span').style;
      style.cssText = node.attrs.style || ''; style.backgroundColor = input.value;
      tr.setNodeMarkup(start+pos,undefined,{...node.attrs,style:style.cssText});
    });
    editor.view.dispatch(tr);
    });
  });

  const panel = document.createElement('section');
  panel.className = 'editor-tools-search editor-popover-motion'; panel.hidden = true;
  panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','현재 장 찾기 및 바꾸기');
  const heading = document.createElement('strong'); heading.textContent = '현재 장 · 찾기 및 바꾸기'; panel.append(heading);
  const queryInput = document.createElement('input'), replacement = document.createElement('input');
  queryInput.placeholder = '찾을 내용'; queryInput.setAttribute('aria-label','찾을 내용');
  replacement.placeholder = '바꿀 내용'; replacement.setAttribute('aria-label','바꿀 내용');
  const summary = document.createElement('output'); summary.setAttribute('aria-live','polite');
  const controls = document.createElement('div'); controls.className = 'editor-tools-search-actions';
  panel.append(queryInput,replacement,controls,summary); document.body.append(panel);
  const updateQuery = () => {
    if (!canEdit()) return false;
    const editor = getEditor();
    editor.view.dispatch(search.setSearchState(editor.state.tr,new search.SearchQuery({search:queryInput.value,replace:replacement.value,literal:true})));
    summary.textContent = `${search.getMatchHighlights(editor.state).find().length}개 일치`;
    return true;
  };
  const close = () => {
    panel.hidden = true;
    if (tablePanel.matches(':popover-open')) tablePanel.hidePopover();
    const editor = getEditor();
    if (editor) editor.view.dispatch(search.setSearchState(editor.state.tr,new search.SearchQuery({search:''})));
  };
  for (const [label,icon,command] of [['이전 결과','ChevronUp','findPrev'],['다음 결과','ChevronDown','findNext'],['현재 항목 바꾸기','Replace','replaceNext'],['현재 장 모두 바꾸기','ReplaceAll','replaceAll']]) {
    controls.append(iconButton(label,icon,() => {
      if (!updateQuery()) return;
      if (command.startsWith('replace')) separateUndo();
      const editor = getEditor(); search[command](editor.state,tr => editor.view.dispatch(tr)); updateQuery();
    }));
  }
  controls.append(iconButton('찾기 닫기','X',() => { close(); if (canEdit()) getEditor().commands.focus(); }));
  const open = () => {
    if (!canEdit()) return;
    panel.hidden = false; updateQuery(); queryInput.focus(); queryInput.select();
  };
  queryInput.addEventListener('input',updateQuery);
  replacement.addEventListener('input',updateQuery);
  queryInput.addEventListener('keydown',event => {
    if (event.key !== 'Enter' || !updateQuery()) return;
    event.preventDefault(); const editor = getEditor();
    search[event.shiftKey ? 'findPrev' : 'findNext'](editor.state,tr => editor.view.dispatch(tr));
  });
  toolbar.append(iconButton('찾기 및 바꾸기 (Ctrl+F)','Search',open));
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && tablePanel.matches(':popover-open')) { event.preventDefault(); event.stopPropagation(); tablePanel.hidePopover(); tableButton.focus(); return; }
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(); if (canEdit()) getEditor().commands.focus(); return; }
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || event.key.toLowerCase() !== 'f') return;
    if (!canEdit() || event.target.closest('input,textarea,.monaco-editor') && !panel.contains(event.target)) return;
    event.preventDefault(); event.stopPropagation(); open();
  },true);
  return {close};
}

import { parse } from './vendor/csstree.esm.js';
import { restoreStyleShortcuts } from './style-shortcuts.js';

export const styleTags = ['h1','h2','h3','h4','h5','h6','p','blockquote'];
export const defaultTypography = () => ['h1','h2','h3','h4','h5','p'].map((tag, i) => ({
  id:tag, kind:'tag', tag, label:i === 5 ? '본문' : `제목 ${i + 1}`, shortcut:'',
}));
export function validateStyle(style, custom = false) {
  if (!style.label?.trim()) throw new Error('라벨을 입력하세요.');
  if (!custom) return style;
  if (style.kind === 'tag') {
    if (!styleTags.includes(style.tag)) throw new Error(`사용할 수 있는 태그: ${styleTags.join(', ')}`);
  } else if (style.kind === 'class' && !/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(style.className)) {
    throw new Error('class는 영문/밑줄로 시작하고 영문, 숫자, 밑줄, 하이픈만 사용하세요.');
  } else if (style.kind !== 'class') {
    throw new Error('태그 또는 CSS 클래스를 선택하세요.');
  }
  return style;
}
export function restoreStyles(source = {}) {
  const typographyStyles = defaultTypography().map(base => {
    const saved = source.typographyStyles?.find(style => style.tag === base.tag);
    if (!saved) return base;
    const next = { ...base, label:String(saved.label ?? base.label), shortcut:String(saved.shortcut ?? '') };
    try { return validateStyle(next); } catch { return base; }
  });
  const customStyles = [];
  for (const saved of source.customStyles || []) {
    if (!saved?.id) continue;
    const kind = saved.kind || (saved.tag ? 'tag' : 'class');
    const next = { id:String(saved.id), label:String(saved.label ?? ''), kind, shortcut:String(saved.shortcut ?? '') };
    if (kind === 'tag') next.tag = String(saved.tag ?? '').toLowerCase();
    else next.className = String(saved.className ?? '');
    if (customStyles.some(style => style.id === next.id || (style.kind === kind && (kind === 'tag' ? style.tag === next.tag : style.className === next.className)))) continue;
    if (kind === 'tag' && typographyStyles.some(style => style.tag === next.tag)) continue;
    try { customStyles.push(validateStyle(next, true)); } catch { /* ignore invalid saved definitions, never alter XHTML */ }
  }
  restoreStyleShortcuts([...typographyStyles, ...customStyles]);
  return { typographyStyles, customStyles };
}
function comments(css) {
  const result = [];
  const ast = parse(css, { positions:true, onComment:(value, loc) => result.push({ value:value.trim(), start:loc.start.offset, end:loc.end.offset }) });
  for (const token of result) token.topLevel = !ast.children.some(node => node.loc.start.offset <= token.start && node.loc.end.offset >= token.end);
  return result;
}
export function stylesFromCss(css) {
  try {
    const tokens = comments(css);
    const start = tokens.find(token => token.topLevel && token.value === 'JH-STUDIO-TYPOGRAPHY-START');
    const end = tokens.find(token => token.topLevel && token.value === 'JH-STUDIO-TYPOGRAPHY-END' && token.start > start?.end);
    const metadata = tokens.find(token => token.start > start?.end && token.end < end?.start && token.value.startsWith('JH-STUDIO-STYLE-CONFIG '));
    return restoreStyles(metadata ? JSON.parse(metadata.value.slice('JH-STUDIO-STYLE-CONFIG '.length)) : {});
  } catch { return restoreStyles(); }
}
// Commands operate on ProseMirror nodes/marks and retain existing classes and tags.
export function applyCustomStyle(editor, style) {
  const { from, to, empty } = editor.state.selection;
  if (!empty) {
    return editor.chain().focus().command(({ tr, state }) => {
      const markType = state.schema.marks.epubSpan;
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (!node.isText) return;
        const existing = node.marks.find(mark => mark.type === markType);
        const classes = new Set((existing?.attrs.class || '').split(/\s+/).filter(Boolean));
        classes.add(style.className);
        tr.addMark(Math.max(from, pos), Math.min(to, pos + node.nodeSize), markType.create({ ...existing?.attrs, class:[...classes].join(' ') }));
      });
      return true;
    }).run();
  }
  return editor.chain().focus().command(({ tr, state }) => {
    const { $from } = state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (!node.isBlock || !Object.hasOwn(node.attrs, 'class')) continue;
      const classes = new Set((node.attrs.class || '').split(/\s+/).filter(Boolean));
      classes.add(style.className);
      tr.setNodeMarkup($from.before(depth), undefined, { ...node.attrs, class:[...classes].join(' ') });
      return true;
    }
    return false;
  }).run();
}
export function applyTagStyle(editor, tag) {
  if (tag === 'p') return editor.chain().focus().setParagraph().run();
  if (tag === 'blockquote') return editor.isActive('blockquote') || editor.chain().focus().toggleBlockquote().run();
  if (/^h[1-6]$/.test(tag)) return editor.chain().focus().setHeading({ level:Number(tag.slice(1)) }).run();
  return false;
}

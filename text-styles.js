import { parse, generate, lexer } from './vendor/csstree.esm.js';
import { restoreStyleShortcuts } from './style-shortcuts.js';

const properties = { fontSize:'font-size', lineHeight:'line-height', color:'color', fontWeight:'font-weight' };
export const defaultTypography = () => ['h1','h2','h3','h4','h5','p'].map((tag, i) => ({
  id:tag, tag, label:i === 5 ? '본문' : `제목 ${i + 1}`, fontSize:'', lineHeight:'', color:'', fontWeight:'', shortcut:'',
}));
export function validateStyle(style, custom = false) {
  if (!style.label?.trim()) throw new Error('라벨을 입력하세요.');
  if (custom && !/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(style.className)) {
    throw new Error('class는 영문/밑줄로 시작하고 영문, 숫자, 밑줄, 하이픈만 사용하세요.');
  }
  for (const [field, property] of Object.entries(properties)) {
    const value = String(style[field] || '').trim();
    if (!value) continue;
    const ast = parse(value, { context:'value' });
    if (!lexer.matchProperty(property, ast).matched) throw new Error(`${property} 값이 올바르지 않습니다.`);
  }
  return style;
}
export function restoreStyles(source = {}) {
  const typographyStyles = defaultTypography().map(base => {
    const saved = source.typographyStyles?.find(style => style.tag === base.tag);
    if (!saved) return base;
    const next = { ...base, ...Object.fromEntries(['label', 'shortcut', ...Object.keys(properties)].map(key => [key, String(saved[key] ?? base[key])])) };
    try { return validateStyle(next); } catch { return base; }
  });
  const customStyles = [];
  for (const saved of source.customStyles || []) {
    if (!saved?.id || customStyles.some(style => style.id === saved.id || style.className === saved.className)) continue;
    const next = Object.fromEntries(['id','label','className','shortcut', ...Object.keys(properties)].map(key => [key, String(saved[key] ?? '')]));
    try { customStyles.push(validateStyle(next, true)); } catch { /* ignore invalid saved definitions, never alter XHTML */ }
  }
  restoreStyleShortcuts([...typographyStyles, ...customStyles]);
  return { typographyStyles, customStyles };
}
function rules(styles, prefix = '') {
  return styles.map(style => {
    const selector = `${prefix}${style.tag || `.${style.className}`}`;
    const declarations = Object.entries(properties).filter(([field]) => String(style[field] || '').trim()).map(([field, property]) => `${property}:${style[field]};`).join('');
    return generate(parse(`${selector}{${declarations}}`));
  }).join('\n');
}
function comments(css) {
  const result = [];
  const ast = parse(css, { positions:true, onComment:(value, loc) => result.push({ value:value.trim(), start:loc.start.offset, end:loc.end.offset }) });
  for (const token of result) token.topLevel = !ast.children.some(node => node.loc.start.offset <= token.start && node.loc.end.offset >= token.end);
  return result;
}
function stripLegacyManagedRegions(css) {
  const tokens = comments(css);
  const patches = [];
  for (const name of ['TYPOGRAPHY', 'CUSTOM-STYLES']) {
    const start = tokens.find(token => token.topLevel && token.value === `JH-STUDIO-${name}-START`);
    const end = tokens.find(token => token.topLevel && token.value === `JH-STUDIO-${name}-END` && token.start > start?.end);
    if (!start || !end) continue;
    let after = end.end;
    if (css[after] === '\n') after++;
    patches.push({ start:start.start, end:after, text:'' });
  }
  return applyPatches(css, patches);
}
function applyPatches(css, patches) {
  return patches.sort((a, b) => b.start - a.start).reduce((result, patch) => result.slice(0, patch.start) + patch.text + result.slice(patch.end), css);
}
function declarationValue(declaration) {
  return `${generate(declaration.value)}${declaration.important ? '!important' : ''}`;
}
function declarationEnd(css, offset) {
  let end = offset;
  if (css[end] === ';') end++;
  while (/[ \t\r\n]/.test(css[end] || '')) end++;
  return end;
}
function patchRule(css, rule, style, previousStyle) {
  const desired = Object.entries(properties)
    .map(([field, property]) => [property, String(style?.[field] || '').trim(), String(previousStyle?.[field] || '').trim()]);
  const declarations = rule.block.children.toArray().filter(node => node.type === 'Declaration');
  if (!style && declarations.length && declarations.every(declaration => {
    const field = Object.entries(properties).find(([, property]) => property === declaration.property)?.[0];
    return field && String(previousStyle?.[field] || '').trim() === declarationValue(declaration);
  }) && !css.slice(rule.loc.start.offset, rule.loc.end.offset).includes('/*')) {
    return [{ start:rule.loc.start.offset, end:declarationEnd(css, rule.loc.end.offset), text:'' }];
  }
  const patches = [];
  const additions = [];
  for (const [property, value, previousValue] of desired) {
    const matching = declarations.filter(declaration => declaration.property === property);
    const declaration = matching.at(-1);
    if (value) {
      if (declaration) patches.push({ start:declaration.loc.start.offset, end:declarationEnd(css, declaration.loc.end.offset), text:`${property}:${value};` });
      else additions.push(`${property}:${value};`);
    } else if (previousValue && declaration && declarationValue(declaration) === previousValue) {
      patches.push({ start:declaration.loc.start.offset, end:declarationEnd(css, declaration.loc.end.offset), text:'' });
    }
  }
  if (additions.length) patches.push({ start:rule.block.loc.end.offset - 1, end:rule.block.loc.end.offset - 1, text:additions.join('') });
  return patches;
}
function selectorRules(ast) {
  const rulesBySelector = new Map();
  ast.children.forEach(rule => {
    if (rule.type !== 'Rule') return;
    const selector = generate(rule.prelude);
    if (!rulesBySelector.has(selector)) rulesBySelector.set(selector, rule);
  });
  return rulesBySelector;
}
export function syncStyleCss(css, config, previousConfig = {}) {
  config.typographyStyles.forEach(style => validateStyle(style));
  config.customStyles.forEach(style => validateStyle(style, true));
  const source = stripLegacyManagedRegions(css);
  const ast = parse(source, { context:'stylesheet', positions:true });
  const existing = selectorRules(ast);
  const previous = new Map([...(previousConfig.typographyStyles || []), ...(previousConfig.customStyles || [])].map(style => [style.tag || `.${style.className}`, style]));
  const next = new Map([...config.typographyStyles, ...config.customStyles].map(style => [style.tag || `.${style.className}`, style]));
  const patches = [];
  const additions = [];
  for (const [selector, style] of next) {
    const rule = existing.get(selector);
    if (rule) patches.push(...patchRule(source, rule, style, previous.get(selector)));
    else if (Object.keys(properties).some(field => String(style[field] || '').trim())) additions.push(rules([style]));
  }
  for (const [selector, style] of previous) {
    if (!next.has(selector) && existing.has(selector)) patches.push(...patchRule(source, existing.get(selector), null, style));
  }
  const updated = applyPatches(source, patches);
  return additions.length ? `${updated}${updated && !updated.endsWith('\n') ? '\n' : ''}${additions.join('\n')}\n` : updated;
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
export function editorStyleCss(config) {
  return rules([...config.typographyStyles, ...config.customStyles], '.rich-editor .ProseMirror ');
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

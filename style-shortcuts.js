// Modifier combinations leave ordinary typing and common editing keys alone.
const reserved = new Set(['b','c','d','h','i','j','n','o','p','r','s','t','v','w','x','y','z'].map(key => `Mod-Shift-${key}`));
export const styleShortcuts = ['Mod-Alt-', 'Mod-Shift-', 'Mod-Alt-Shift-'].flatMap(prefix =>
  Array.from('0123456789abcdefghijklmnopqrstuvwxyz', key => `${prefix}${key}`)
).filter(shortcut => !reserved.has(shortcut) && !['s','z'].includes(shortcut.at(-1))
  && !['Mod-Alt-c','Mod-Alt-h','Mod-Alt-i','Mod-Alt-j'].includes(shortcut));
const supported = new Set(styleShortcuts);

export const displayStyleShortcut = shortcut => (shortcut || '').split('-').map(key => key === 'Mod' ? 'Ctrl/Cmd' : key.toUpperCase()).join(' + ');
export const readStyleShortcut = label => label ? label.split(' + ').map(key =>
  key === 'Ctrl/Cmd' ? 'Mod' : key === 'ALT' ? 'Alt' : key === 'SHIFT' ? 'Shift' : key.toLowerCase()
).join('-') : '';

export function validateStyleShortcut(shortcut, styles = [], id) {
  if (!shortcut) return '';
  if (!supported.has(shortcut)) throw new Error('사용할 수 없는 조합입니다. Ctrl/Cmd + Alt + 숫자 조합을 권장합니다.');
  const duplicate = styles.find(style => style.id !== id && style.shortcut === shortcut);
  if (duplicate) throw new Error(`이미 “${duplicate.label}” 스타일에서 사용하는 단축키입니다.`);
  return shortcut;
}

export function shortcutFromEvent(event) {
  if (event.isComposing || event.getModifierState?.('AltGraph')) return null;
  const key = event.code.startsWith('Key') ? event.code.slice(3).toLowerCase()
    : event.code.startsWith('Digit') ? event.code.slice(5) : '';
  if (!key || !(event.ctrlKey || event.metaKey) || (event.ctrlKey && event.metaKey)) {
    throw new Error('Ctrl/Cmd와 Alt 또는 Shift를 포함한 영문·숫자 조합을 누르세요.');
  }
  return validateStyleShortcut(`Mod-${event.altKey ? 'Alt-' : ''}${event.shiftKey ? 'Shift-' : ''}${key}`);
}

export function restoreStyleShortcuts(styles) {
  const seen = new Set();
  for (const style of styles) {
    if (!supported.has(style.shortcut) || seen.has(style.shortcut)) style.shortcut = '';
    else seen.add(style.shortcut);
  }
}

// Tiptap/ProseMirror owns key matching. Each invocation reads the current project
// so editing a binding or switching projects never leaves an old binding active.
export function styleShortcutBindings(project, apply) {
  return Object.fromEntries(styleShortcuts.map(shortcut => [shortcut, () => {
    const style = [...project.typographyStyles, ...project.customStyles].find(item => item.shortcut === shortcut);
    return style ? apply(style) : false;
  }]));
}

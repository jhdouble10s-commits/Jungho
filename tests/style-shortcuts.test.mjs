import test from 'node:test';
import assert from 'node:assert/strict';
import { BookProject } from '../book-project.js';
import { restoreStyles } from '../text-styles.js';
import { shortcutFromEvent, validateStyleShortcut, styleShortcutBindings, styleShortcuts, displayStyleShortcut, readStyleShortcut } from '../style-shortcuts.js';

test('shortcut capture normalizes platform modifiers and rejects reserved/duplicate keys', () => {
  for (const shortcut of [...styleShortcuts, '']) assert.equal(readStyleShortcut(displayStyleShortcut(shortcut)), shortcut);
  assert.equal(shortcutFromEvent({ code:'Digit7', ctrlKey:true, altKey:true }), 'Mod-Alt-7');
  assert.equal(shortcutFromEvent({ code:'KeyQ', metaKey:true, altKey:true, shiftKey:true }), 'Mod-Alt-Shift-q');
  assert.equal(shortcutFromEvent({ isComposing:true }), null);
  for (const event of [{code:'KeyS',ctrlKey:true}, {code:'KeyZ',ctrlKey:true,altKey:true}, {code:'KeyB'}, {code:'Digit1',ctrlKey:true}]) {
    assert.throws(() => shortcutFromEvent(event));
  }
  const styles = [{id:'h1', label:'대제목', shortcut:'Mod-Alt-7'}];
  assert.throws(() => validateStyleShortcut('Mod-Alt-7', styles, 'p'), /대제목/);
  assert.equal(validateStyleShortcut('Mod-Alt-7', styles, 'h1'), 'Mod-Alt-7');
});

test('bindings use current BookProject after remap, clear, delete and project switch', () => {
  const project = new BookProject();
  const applied = [];
  const bindings = styleShortcutBindings(project, style => { applied.push(style.id); return true; });
  assert.equal(bindings['Mod-Alt-7'](), false);
  project.typographyStyles[0].shortcut = 'Mod-Alt-7';
  assert.equal(bindings['Mod-Alt-7'](), true);
  project.typographyStyles[0].shortcut = 'Mod-Alt-8';
  assert.equal(bindings['Mod-Alt-7'](), false);
  assert.equal(bindings['Mod-Alt-8'](), true);
  project.typographyStyles[0].shortcut = '';
  assert.equal(bindings['Mod-Alt-8'](), false);
  project.customStyles = [{id:'quote', shortcut:'Mod-Alt-9'}];
  assert.equal(bindings['Mod-Alt-9'](), true);
  project.customStyles = [];
  assert.equal(bindings['Mod-Alt-9'](), false);
  project.typographyStyles[0].shortcut = 'Mod-Alt-7';
  project.replace([{id:'other', xhtml:'<p>other</p>'}], 'other');
  assert.equal(bindings['Mod-Alt-7'](), false);
  assert.deepEqual(applied, ['h1','h1','quote']);
});

test('project snapshots restore shortcuts without changing chapter content or dropping invalid-key styles', () => {
  const project = new BookProject();
  project.replace([{id:'A', originalPath:'Text/A.xhtml', xhtml:'<p id="p" class="keep">text</p>'}], 'A');
  project.typographyStyles[0].shortcut = 'Mod-Alt-7';
  project.customStyles = restoreStyles({customStyles:[{id:'note',label:'메모',className:'note',shortcut:'Mod-Alt-9'}]}).customStyles;
  const saved = project.snapshot();
  const loaded = new BookProject(); loaded.replace(saved.chapters, saved.selectedChapterId, saved);
  assert.deepEqual(loaded.snapshot(), saved);
  saved.customStyles[0].shortcut = 'Mod-Alt-7';
  let restored = restoreStyles(saved);
  assert.equal(restored.typographyStyles[0].shortcut, 'Mod-Alt-7');
  assert.equal(restored.customStyles[0].shortcut, '');
  saved.customStyles[0].shortcut = 'Mod-s';
  restored = restoreStyles(saved);
  assert.equal(restored.customStyles[0].label, '메모');
  assert.equal(restored.customStyles[0].shortcut, '');
  assert.deepEqual(loaded.snapshot().chapters, saved.chapters);
});

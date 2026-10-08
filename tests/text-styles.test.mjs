import test from 'node:test';
import assert from 'node:assert/strict';
import { BookProject } from '../book-project.js';
import { restoreStyles, stylesFromCss, validateStyle } from '../text-styles.js';

const custom = { id:'highlight', label:'강조문', kind:'class', className:'highlight-text', shortcut:'' };
test('style settings retain labels, targets and shortcuts without appearance fields', () => {
  const config = restoreStyles({ typographyStyles:[{ tag:'h1', label:'대제목', fontSize:'32px' }], customStyles:[
    { ...custom, color:'#d97706' }, { id:'quote', label:'인용문', kind:'tag', tag:'blockquote', shortcut:'' },
  ] });
  assert.deepEqual(config.typographyStyles[0], { id:'h1', kind:'tag', tag:'h1', label:'대제목', shortcut:'' });
  assert.deepEqual(config.customStyles, [custom, { id:'quote', label:'인용문', kind:'tag', tag:'blockquote', shortcut:'' }]);
  assert.equal(restoreStyles({ customStyles:[{ ...custom, label:'포인트문장' }] }).customStyles[0].className, 'highlight-text');
});
test('rename/delete definitions preserve chapter identity and all content; snapshots isolate projects', () => {
  const project = new BookProject();
  project.replace([{ id:'A', originalPath:'Text/A.xhtml', xhtml:'<h1 id="heading">Title</h1><p class="quote-box"><span class="highlight-text">text</span><a href="#n1">1</a><img src="../Image/a.png" /></p>' }], 'A', { customStyles:[custom] });
  const before = structuredClone(project.snapshot().chapters);
  project.customStyles[0].label = '포인트문장';
  assert.equal(project.customStyles[0].className, 'highlight-text');
  const saved = structuredClone(project.snapshot());
  const loaded = new BookProject(); loaded.replace(saved.chapters, saved.selectedChapterId, saved);
  assert.deepEqual(loaded.snapshot(), saved);
  loaded.customStyles = [];
  assert.deepEqual(loaded.snapshot().chapters, before);
  assert.equal(loaded.selectedChapterId, 'A');
  loaded.replace([{id:'B', xhtml:'<p>other</p>'}], 'B');
  assert.deepEqual(loaded.customStyles, []);
  assert.equal(loaded.typographyStyles[0].label, '제목 1');
  assert.equal(project.customStyles.length, 1);
});
test('legacy styles restore safely and unsupported targets are rejected', () => {
  assert.equal(restoreStyles({ customStyles:[{...custom, type:'block'}] }).customStyles[0].type, undefined);
  for (const patch of [{className:'x{}'}, {label:''}, {kind:'tag', tag:'script'}]) {
    assert.throws(() => validateStyle({...custom, ...patch}, true));
  }
  const legacy = '/* JH-STUDIO-TYPOGRAPHY-START */\nh1{font-size:32px}\n/* JH-STUDIO-TYPOGRAPHY-END */\n/* JH-STUDIO-CUSTOM-STYLES-START */\n.note{color:red}\n/* JH-STUDIO-CUSTOM-STYLES-END */';
  assert.equal(stylesFromCss(legacy).typographyStyles[0].tag, 'h1');
});

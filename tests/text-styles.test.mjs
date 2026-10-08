import test from 'node:test';
import assert from 'node:assert/strict';
import { BookProject } from '../book-project.js';
import { restoreStyles, syncStyleCss, stylesFromCss, validateStyle } from '../text-styles.js';

const custom = { id:'highlight', label:'강조문', className:'highlight-text', fontSize:'18px', lineHeight:'1.4', color:'#d97706', fontWeight:'700' };
test('style rules are updated in place without comments and preserve other declarations', () => {
  const config = restoreStyles({ customStyles:[custom] });
  config.typographyStyles[0].label = '대제목 */ 안전';
  config.typographyStyles[0].fontSize = '32px';
  config.typographyStyles[0].lineHeight = '1.4';
  config.typographyStyles[0].color = '#222222';
  config.typographyStyles[0].fontWeight = '700';
  const before = '/* user before */\nh1 { margin: 1em; color: blue; }\n.highlight-text { padding: 2px; }\n';
  const initial = syncStyleCss(before, config);
  const previous = structuredClone(config);
  config.typographyStyles[0].fontSize = '40px';
  const result = syncStyleCss(initial, config, previous);
  assert.ok(result.startsWith('/* user before */'));
  assert.match(result, /h1 \{ margin: 1em; color:#222222;font-size:40px;line-height:1.4;font-weight:700;\}/);
  assert.match(result, /\.highlight-text \{ padding: 2px; font-size:18px;line-height:1.4;color:#d97706;font-weight:700;\}/);
  assert.ok(!result.includes('JH-STUDIO'));
  assert.equal(syncStyleCss(result, config, config), result);
});
test('rename/delete definitions preserve chapter identity and all content; snapshots isolate projects', () => {
  const project = new BookProject();
  project.replace([{ id:'A', originalPath:'Text/A.xhtml', xhtml:'<h1 id="heading">Title</h1><p class="quote-box"><span class="highlight-text">text</span><a href="#n1">1</a><img src="../Image/a.png" /></p>' }], 'A', { customStyles:[custom] });
  const before = structuredClone(project.snapshot().chapters);
  project.customStyles[0].label = '포인트문장';
  assert.equal(project.customStyles[0].className, 'highlight-text');
  const css = syncStyleCss('/* user */', project);
  const saved = structuredClone(project.snapshot());
  const loaded = new BookProject(); loaded.replace(saved.chapters, saved.selectedChapterId, saved);
  assert.deepEqual(loaded.snapshot(), saved);
  const beforeDelete = loaded.snapshot();
  loaded.customStyles = [];
  const deleted = syncStyleCss(css, loaded, beforeDelete);
  assert.ok(!deleted.includes('.highlight-text{'));
  assert.deepEqual(loaded.snapshot().chapters, before);
  assert.equal(loaded.selectedChapterId, 'A');
  loaded.replace([{id:'B', xhtml:'<p>other</p>'}], 'B');
  assert.deepEqual(loaded.customStyles, []);
  assert.equal(loaded.typographyStyles[0].label, '제목 1');
  assert.equal(project.customStyles.length, 1);
});
test('legacy scope and managed comments are removed, and invalid definitions cannot overwrite user CSS', () => {
  assert.equal(restoreStyles({ customStyles:[{...custom, type:'block'}] }).customStyles[0].type, undefined);
  for (const patch of [{className:'x{}'}, {color:'red;display:none'}, {fontSize:'banana'}, {label:''}]) {
    assert.throws(() => validateStyle({...custom, ...patch}, true));
  }
  const legacy = '/* JH-STUDIO-TYPOGRAPHY-START */\nh1{font-size:32px}\n/* JH-STUDIO-TYPOGRAPHY-END */\n/* JH-STUDIO-CUSTOM-STYLES-START */\n.note{color:red}\n/* JH-STUDIO-CUSTOM-STYLES-END */';
  assert.ok(!syncStyleCss(legacy, restoreStyles()).includes('JH-STUDIO'));
});

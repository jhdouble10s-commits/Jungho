import test from 'node:test';
import assert from 'node:assert/strict';
import { xhtmlCompletionContext, xhtmlAttributeCompletions } from '../xhtml-completion.js';

test('OSS attribute snippets include quotes and replace complete namespace names', () => {
  for (const [source, name] of [['<div class', 'class'], ['<a href', 'href'], ['<img src', 'src'],
    ['<p id', 'id'], ['<a epub:type', 'epub:type'], ['<p xml:lang', 'xml:lang']]) {
    const item = xhtmlAttributeCompletions(source, source.length).find(item => item.label === name);
    assert.equal(item.textEdit.newText, `${name}="$1"`);
    assert.equal(item.insertTextFormat, 2);
    assert.equal(item.textEdit.range.start.character, source.indexOf(name));
    assert.equal(item.textEdit.range.end.character, source.length);
    assert.equal(xhtmlCompletionContext(source, source.length).emmet, false);
  }
});

test('scanner handles multiline tags, quoted angle brackets, comments and outside Emmet', () => {
  for (const source of ['<div\n class', '<a title="a > b"\n epub:type']) {
    assert.equal(xhtmlCompletionContext(source, source.length).attributes, true);
    assert.ok(xhtmlAttributeCompletions(source, source.length).length);
  }
  for (const source of ['<div title="div.foo', '<div title="a > div.foo', '<!-- div.foo', '<script>div.foo', '</div']) {
    assert.equal(xhtmlCompletionContext(source, source.length).emmet, false);
    assert.deepEqual(xhtmlAttributeCompletions(source, source.length), []);
  }
  for (const source of ['div.foo', '<div>div.foo', '<img />div.foo']) {
    assert.equal(xhtmlCompletionContext(source, source.length).emmet, true);
    assert.deepEqual(xhtmlAttributeCompletions(source, source.length), []);
  }
});

test('duplicate attributes are excluded before and after the caret; existing values remain', () => {
  for (const source of ['<div class="keep" cl', '<div class="keep" class', '<div cl| class="keep" />']) {
    const offset = source.includes('|') ? source.indexOf('|') : source.length;
    const items = xhtmlAttributeCompletions(source.replace('|', ''), offset);
    assert.equal(items.some(item => item.label === 'class'), false);
  }
  const source = '<a href="chapter.xhtml#note" />';
  const item = xhtmlAttributeCompletions(source, 7).find(item => item.label === 'href');
  assert.equal(item.textEdit.newText, 'href');
});

test('HTML service tag-specific attribute order is retained ahead of globals', () => {
  for (const [tag, attribute] of [['a', 'href'], ['img', 'src'], ['link', 'rel'], ['meta', 'name']]) {
    const source = `<${tag} `;
    const items = xhtmlAttributeCompletions(source, source.length);
    assert.ok(items.findIndex(item => item.label === attribute) < items.findIndex(item => item.label === 'class'));
    assert.ok(items.find(item => item.label === attribute).sortText < items.find(item => item.label === 'class').sortText);
  }
});

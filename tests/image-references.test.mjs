import test from 'node:test';
import assert from 'node:assert/strict';
import { DOMParser } from '@xmldom/xmldom';
import { imageReferences } from '../image-references.js';
globalThis.DOMParser = DOMParser;

test('srcset candidates are parsed with OSS and only the matching URL is renamed',() => {
  const source = '<picture><source srcset="../Image/a.png 1x, ../Image/b.png 2x" /></picture>';
  const result = imageReferences(source,'OPS/Text/ch.xhtml','OPS/Image/a.png',{nextPath:'OPS/Image/c.png'});
  assert.equal(result.hits.length,1);
  assert.equal(result.source,'<picture><source srcset="../Image/c.png 1x, ../Image/b.png 2x" /></picture>');
});

test('image matching resolves chapter-relative paths and ignores comments, text, external URLs and other folders',() => {
  const source = `<p>../Image/a.png</p><!-- <img src="../Image/a.png" /> -->\n<img id="keep" src='../Image/a.png' /><img src="../Other/a.png" /><img src="https://example.org/a.png" />`;
  const result = imageReferences(source,'OPS/Text/ch.xhtml','OPS/Image/a.png',{nextPath:'OPS/Image/새 이름.png'});
  assert.equal(result.hits.length,1);
  assert.equal(result.source,source.replace("src='../Image/a.png'",'src="../Image/%EC%83%88%20%EC%9D%B4%EB%A6%84.png"'));
  assert.equal(imageReferences(result.source,'OPS/Text/ch.xhtml','OPS/Image/새 이름.png').hits.length,1);
});
test('SVG attributes, entity-encoded URLs and CSS references preserve suffixes and surrounding source',() => {
  const source = `<svg><image xlink:href="../Image/a.png?v=1&amp;z=2#part" /></svg><p style="background-image: url('../Image/a.png'); color:red">text</p><style>.x{background:url(../Image/a.png)}</style>`;
  const result = imageReferences(source,'OPS/Text/ch.xhtml','OPS/Image/a.png',{nextPath:'OPS/Image/b.png'});
  assert.equal(result.hits.length,3);
  assert.ok(result.source.includes('b.png?v=1&amp;z=2#part'));
  assert.ok(result.source.includes('color:red'));
  const css = '/* keep */\n.x { background:url("../Image/a.png"); color: red; }';
  assert.equal(imageReferences(css,'OPS/Styles/book.css','OPS/Image/a.png',{css:true,nextPath:'OPS/Image/b.png'}).source,'/* keep */\n.x { background:url(../Image/b.png); color: red; }');
});

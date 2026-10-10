import test from 'node:test';
import assert from 'node:assert/strict';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { formatXhtml, sourceElements, elementAtOffset } from '../xhtml-source.js';
import { equivalentXhtml, projectXhtmlForVisual } from '../xhtml-validation.js';

test('OSS formatter는 block을 분리하고 inline·XHTML 속성·빈 태그 의미를 보존한다', () => {
  const source = '<p id="a">안녕하세요 <strong>세계</strong><br /></p><p><img src="../Images/A.jpg" alt="A &amp; B" /></p>';
  const formatted = formatXhtml(source);
  assert.ok(formatted.includes('\n'));
  assert.ok(equivalentXhtml(source, formatted, DOMParser));
  assert.ok(formatted.includes('<br />'));
  assert.ok(formatted.includes('src="../Images/A.jpg"'));
});
test('formatter 검증은 inline 사이 공백·pre 공백·본문 변경을 허용하지 않는다', () => {
  for (const [a,b] of [
    ['<p><b>A</b> <b>B</b></p>','<p><b>A</b><b>B</b></p>'],
    ['<pre>  </pre>','<pre> </pre>'],
    ['<p>A B</p>','<p>AB</p>'],
  ]) assert.equal(equivalentXhtml(a,b,DOMParser), false);
});
test('XHTML attribute order does not falsely mark an editor round trip as destructive', () => {
  assert.equal(equivalentXhtml('<p id="a" class="keep">A</p>', '<p class="keep" id="a">A</p>', DOMParser), true);
  assert.equal(equivalentXhtml('<p id="a" class="keep">A</p>', '<p id="a">A</p>', DOMParser), false);
});
test('OSS source parser는 동일 문장과 이미지의 위치를 서로 구분한다', () => {
  const source = '<p>동일</p><p>동일<img src="a.jpg" /></p>';
  const paragraphs = sourceElements(source).filter(node => node.tag === 'p');
  assert.deepEqual(paragraphs.map(node => node.path), [[0],[1]]);
  assert.equal(elementAtOffset(source, source.indexOf('동일',10)).start, paragraphs[1].start);
  assert.equal(elementAtOffset(source, source.indexOf('src')).tag, 'img');
});
test('meaningful whitespace and namespaces are never normalised away by equivalence', () => {
  for(const [a,b] of [
    ['<p>\u00a0</p>','<p></p>'],
    ['<div xml:space="preserve"><p>A</p>\n<p>B</p></div>','<div xml:space="preserve"><p>A</p><p>B</p></div>'],
    ['<div style="white-space:pre-wrap"><p>A</p>\n<p>B</p></div>','<div style="white-space:pre-wrap"><p>A</p><p>B</p></div>'],
    ['<p xml:lang="ko">가</p>','<p>가</p>'],
  ]) assert.equal(equivalentXhtml(a,b,DOMParser),false);
  const long=`<p>${'긴 문장 공백 유지 '.repeat(100)}</p>`;
  assert.equal(formatXhtml(long),long);
  const table='<table><colgroup><col span="2" /></colgroup><tbody><tr><td>A</td></tr></tbody></table>';
  assert.ok(equivalentXhtml(table,formatXhtml(table),DOMParser));
});

test('visual projection removes table indentation without changing meaningful whitespace', () => {
  const project=(source,options={})=>projectXhtmlForVisual(source,options,DOMParser,XMLSerializer);
  const table='<table>\n  <tbody>\n    <tr>\n      <td><p>A</p></td>\n    </tr>\n  </tbody>\n</table>';
  const result=project(table);
  assert.equal(result.includes('\n'),false);
  assert.ok(equivalentXhtml(table,result,DOMParser));
  for(const source of ['<p>  </p>','<pre>  A\n B</pre>','<p><code>A  B</code> <b>C</b> </p>','<div xml:space="preserve"><p>A</p>\n<p>B</p></div>','<div style="white-space:pre"><p>A</p>\n<p>B</p></div>']) {
    assert.ok(equivalentXhtml(source,project(source),DOMParser,{preserveWhitespace:true}));
  }
  assert.ok(equivalentXhtml(table,project(table,{preserveWhitespace:true}),DOMParser,{preserveWhitespace:true}));
});

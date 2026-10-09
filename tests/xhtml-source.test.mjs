import test from 'node:test';
import assert from 'node:assert/strict';
import { DOMParser } from '@xmldom/xmldom';
import { formatXhtml, sourceElements, elementAtOffset } from '../xhtml-source.js';
import { equivalentXhtml } from '../xhtml-validation.js';

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

import test from 'node:test';
import assert from 'node:assert/strict';
import { fixXhtmlVoidElements } from '../xhtml-tools.js';

test('XHTML 자동수정은 빈 태그만 닫고 속성 값을 보존한다', () => {
  const source = '<p id="p1" class="body" epub:type="z3998:paragraph" xml:lang="ko">본문<br><img src="../Images/a.jpg" alt="A > B"><hr><meta name="x" content="a > b"><link href="style.css"><input id="field" value="a > b"></p>';
  const result = fixXhtmlVoidElements(source);

  assert.equal(result, '<p id="p1" class="body" epub:type="z3998:paragraph" xml:lang="ko">본문<br /><img src="../Images/a.jpg" alt="A > B" /><hr /><meta name="x" content="a > b" /><link href="style.css" /><input id="field" value="a > b" /></p>');
});

test('이미 올바른 XHTML 빈 태그는 변경하지 않는다', () => {
  const source = '<p><br /><img src="../Images/a.jpg" /></p>';
  assert.equal(fixXhtmlVoidElements(source), source);
});

test('주석·CDATA·script·style 내부의 태그 모양 텍스트는 수정하지 않는다', () => {
  const source = '<!-- <br> --><![CDATA[<img src="x">]]><script>const x = "<br>";</script><style>p:after{content:"<hr>"}</style><p>본문<br></p>';
  assert.equal(fixXhtmlVoidElements(source), source.replace('<p>본문<br></p>', '<p>본문<br /></p>'));
});

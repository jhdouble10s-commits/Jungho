import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applySourceEdits,
  buildProofreadRequest,
  diagnosticToSourceEdit,
  extractProofreadTextNodes,
} from '../proofread-xhtml.js';

test('텍스트 노드만 교정 요청에 포함하고 XHTML 구조와 엔티티를 제외한다', () => {
  const xhtml = '<p id="p1"><a href="note.xhtml#n1" epub:type="noteref">기도를통해</a> <img src="Images/Cover.png" alt="표지" />&amp; 됬다</p>';
  const nodes = extractProofreadTextNodes(xhtml);
  assert.deepEqual(nodes.map((node) => node.text), ['기도를통해', ' 됬다']);
  assert.match(xhtml.slice(nodes[0].start, nodes[0].end), /기도를통해/);
});

test('UTF-8 byte range을 원본 XHTML text node 범위로 안전하게 매핑한다', () => {
  const xhtml = '<p class="body">기도를통해</p><p>됬다</p>';
  const request = buildProofreadRequest(xhtml);
  const firstBytes = new TextEncoder().encode('기도를통해').length;
  const edit = diagnosticToSourceEdit({ range:{ start:0, end:firstBytes }, original:'기도를통해', suggestion:'기도를 통해' }, request.segments, xhtml);
  assert.deepEqual(edit, { start:16, end:21, original:'기도를통해', replacement:'기도를 통해' });
  const after = applySourceEdits(xhtml, [edit]);
  assert.equal(after, '<p class="body">기도를 통해</p><p>됬다</p>');
  assert.match(after, /class="body"/);
});

test('적용은 태그·속성·각주 href를 건드리지 않고 원문 변경 시 거부한다', () => {
  const xhtml = '<p><a id="r1" href="chapter.xhtml#fn1" epub:type="noteref">됬다</a></p>';
  const request = buildProofreadRequest(xhtml);
  const byteLength = new TextEncoder().encode('됬다').length;
  const edit = diagnosticToSourceEdit({ range:{ start:0, end:byteLength }, original:'됬다', suggestion:'됐다' }, request.segments, xhtml);
  const after = applySourceEdits(xhtml, [edit]);
  assert.equal(after, '<p><a id="r1" href="chapter.xhtml#fn1" epub:type="noteref">됐다</a></p>');
  assert.throws(() => applySourceEdits(after, [edit]), /본문이 검사 뒤 변경/);
});

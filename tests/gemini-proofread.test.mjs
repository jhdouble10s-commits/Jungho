import test from 'node:test';
import assert from 'node:assert/strict';
import { diffChars } from 'diff';
import { applySourceEdits, chunkProofreadParagraphs, dedupeAdjacentParagraphs, diffPartsToSourceEdits, extractProofreadParagraphs, isSuspiciousCorrection } from '../gemini-proofread.js';

test('문단 텍스트만 추출하고 XHTML 속성·각주 링크·엔티티를 보존한다', () => {
  const xhtml = '<p id="p"><a href="note.xhtml#fn1" epub:type="noteref">기도를통해</a>&amp; 됬다</p><p>다음 문단</p>';
  const paragraphs = extractProofreadParagraphs(xhtml);
  assert.deepEqual(paragraphs.map((item) => item.text), ['기도를통해 됬다', '다음 문단']);
  assert.equal(chunkProofreadParagraphs(paragraphs, 10).length, 2);
});

test('앱 diff만으로 안전한 text node 변경을 만든다', () => {
  const xhtml = '<p><a id="r1" href="chapter.xhtml#fn1">됬다</a></p>';
  const paragraph = extractProofreadParagraphs(xhtml)[0];
  const edits = diffPartsToSourceEdits(diffChars(paragraph.text, '됐다'), paragraph, xhtml);
  assert.equal(applySourceEdits(xhtml, edits), '<p><a id="r1" href="chapter.xhtml#fn1">됐다</a></p>');
  assert.equal(isSuspiciousCorrection('원문', '원문'.repeat(2)), true);
  assert.equal(dedupeAdjacentParagraphs('<p>같은 문단</p>\n<p>같은 문단</p>'), '<p>같은 문단</p>\n');
});

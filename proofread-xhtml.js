// XHTML 교정은 원문 구조를 바꾸지 않는다. 검사 엔진에는 텍스트 노드만 전달하고,
// 엔진이 돌려준 UTF-8 byte offset을 원래 XHTML 문자열의 위치로 다시 연결한다.
const encodedLength = (text) => new TextEncoder().encode(text).length;

export const utf8ByteToCodeUnit = (text, byteOffset) => {
  const bytes = Math.max(0, Number(byteOffset) || 0);
  let consumed = 0;
  let index = 0;
  for (const character of text) {
    if (consumed >= bytes) break;
    const size = encodedLength(character);
    if (consumed + size > bytes) break;
    consumed += size;
    index += character.length;
  }
  return index;
};

// 엔티티는 보존하되 그 전후의 실제 문자만 별도 구간으로 검사한다.
// 주석, CDATA, script/style 내용도 본문 교정 대상이 아니다.
export const extractProofreadTextNodes = (xhtml) => {
  const nodes = [];
  const source = String(xhtml || '');
  const token = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]*>/g;
  let cursor = 0;
  let blockedTag = null;
  let match;
  const push = (start, end) => {
    const text = source.slice(start, end);
    const entity = /&(?:#\d+|#x[\da-f]+|[a-z][\w.-]*);/gi;
    let partStart = 0;
    let entityMatch;
    const append = (from, to) => {
      const part = text.slice(from, to);
      if (part && /[가-힣]/.test(part)) nodes.push({ start:start + from, end:start + to, text:part });
    };
    while ((entityMatch = entity.exec(text))) {
      append(partStart, entityMatch.index);
      partStart = entity.lastIndex;
    }
    append(partStart, text.length);
  };
  while ((match = token.exec(source))) {
    if (!blockedTag) push(cursor, match.index);
    const value = match[0];
    const open = /^<\s*(script|style)\b/i.exec(value);
    const close = /^<\s*\/\s*(script|style)\b/i.exec(value);
    if (open && !/\/>$/.test(value)) blockedTag = open[1].toLowerCase();
    if (close && close[1].toLowerCase() === blockedTag) blockedTag = null;
    cursor = token.lastIndex;
  }
  if (!blockedTag) push(cursor, source.length);
  return nodes;
};

export const buildProofreadRequest = (xhtml) => {
  const nodes = extractProofreadTextNodes(xhtml);
  let byteOffset = 0;
  const segments = nodes.map((node, index) => {
    if (index) byteOffset += 1; // one newline separator; cross-node diagnostics are ignored
    const startByte = byteOffset;
    byteOffset += encodedLength(node.text);
    return { ...node, startByte, endByte:byteOffset };
  });
  return { text:segments.map((segment) => segment.text).join('\n'), segments };
};

export const escapeTextReplacement = (text) => String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export const diagnosticToSourceEdit = (diagnostic, segments, source) => {
  const range = diagnostic?.range;
  if (!range || !Number.isFinite(range.start) || !Number.isFinite(range.end) || range.end < range.start) return null;
  const segment = segments.find((item) => range.start >= item.startByte && range.end <= item.endByte);
  if (!segment) return null;
  const localStart = utf8ByteToCodeUnit(segment.text, range.start - segment.startByte);
  const localEnd = utf8ByteToCodeUnit(segment.text, range.end - segment.startByte);
  const start = segment.start + localStart;
  const end = segment.start + localEnd;
  const original = String(source).slice(start, end);
  const expected = diagnostic.original == null ? original : String(diagnostic.original);
  if (!original || original !== expected || diagnostic.suggestion == null || original === String(diagnostic.suggestion)) return null;
  return { start, end, original, replacement:escapeTextReplacement(diagnostic.suggestion) };
};

export const applySourceEdits = (xhtml, edits) => {
  const source = String(xhtml || '');
  const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  let nextBoundary = source.length + 1;
  let result = source;
  for (const edit of sorted) {
    if (edit.start < 0 || edit.end < edit.start || edit.end > source.length || edit.end > nextBoundary) {
      throw new Error('겹치거나 유효하지 않은 교정 범위입니다. 다시 검사하세요.');
    }
    if (source.slice(edit.start, edit.end) !== edit.original) {
      throw new Error('본문이 검사 뒤 변경되었습니다. 다시 검사하세요.');
    }
    result = result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
    nextBoundary = edit.start;
  }
  return result;
};

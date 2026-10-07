const entityPattern = /&(?:#\d+|#x[\da-f]+|[a-z][\w.-]*);/gi;
const blockTags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'td', 'th', 'figcaption']);
const escapeText = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// XHTML을 모델에 보내지 않는다. 안전한 본문 text node를 문단별로 묶어 위치를 보존한다.
export const extractProofreadParagraphs = (xhtml) => {
  const source = String(xhtml || '');
  const paragraphs = new Map();
  const token = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]*>/g;
  let cursor = 0;
  let blockedTag = null;
  let activeBlock = null;
  let nextBlock = 0;
  const fallbackBlock = 'paragraph-0';
  const appendText = (start, end) => {
    const raw = source.slice(start, end);
    let partStart = 0;
    let entity;
    const addPart = (from, to) => {
      const text = raw.slice(from, to);
      if (!text || !/[가-힣A-Za-z0-9]/.test(text)) return;
      const id = activeBlock || fallbackBlock;
      if (!paragraphs.has(id)) paragraphs.set(id, { id, text:'', segments:[] });
      const paragraph = paragraphs.get(id);
      const textStart = paragraph.text.length;
      paragraph.segments.push({ start:start + from, end:start + to, text, textStart, textEnd:textStart + text.length });
      paragraph.text += text;
    };
    while ((entity = entityPattern.exec(raw))) { addPart(partStart, entity.index); partStart = entityPattern.lastIndex; }
    addPart(partStart, raw.length);
    entityPattern.lastIndex = 0;
  };
  let match;
  while ((match = token.exec(source))) {
    if (!blockedTag) appendText(cursor, match.index);
    const value = match[0];
    const blockedOpen = /^<\s*(script|style)\b/i.exec(value);
    const blockedClose = /^<\s*\/\s*(script|style)\b/i.exec(value);
    const tag = /^<\s*(\/)?\s*([\w:-]+)/.exec(value);
    if (tag && blockTags.has(tag[2].toLowerCase())) {
      if (tag[1]) activeBlock = null;
      else if (!/\/>$/.test(value)) activeBlock = `paragraph-${++nextBlock}`;
    }
    if (blockedOpen && !/\/>$/.test(value)) blockedTag = blockedOpen[1].toLowerCase();
    if (blockedClose && blockedClose[1].toLowerCase() === blockedTag) blockedTag = null;
    cursor = token.lastIndex;
  }
  if (!blockedTag) appendText(cursor, source.length);
  return Array.from(paragraphs.values()).filter((paragraph) => paragraph.text.trim());
};

// 문단을 쪼개지 않고 묶는다. API 한도를 넘는 아주 긴 문단만 단독 요청으로 처리한다.
export const chunkProofreadParagraphs = (paragraphs, maximumCharacters = 12000) => {
  const chunks = [];
  let current = [];
  let length = 0;
  for (const paragraph of paragraphs) {
    if (current.length && length + paragraph.text.length > maximumCharacters) { chunks.push(current); current = []; length = 0; }
    current.push(paragraph); length += paragraph.text.length;
  }
  if (current.length) chunks.push(current);
  return chunks;
};

// jsdiff 변경을 원래 text node 하나 안에서만 XHTML edit으로 변환한다. 경계 넘는 변경은 버린다.
export const diffPartsToSourceEdits = (parts, paragraph, xhtml) => {
  const edits = [];
  let textOffset = 0;
  let pending = null;
  const flush = () => {
    if (!pending || pending.original === pending.replacement) { pending = null; return; }
    const segment = paragraph.segments.find((item) => pending.start >= item.textStart && pending.end <= item.textEnd);
    if (segment) {
      const start = segment.start + pending.start - segment.textStart;
      const end = segment.start + pending.end - segment.textStart;
      if (String(xhtml).slice(start, end) === pending.original) edits.push({ start, end, original:pending.original, replacement:escapeText(pending.replacement) });
    }
    pending = null;
  };
  for (const part of parts) {
    const value = String(part.value || '');
    if (!part.added && !part.removed) { flush(); textOffset += value.length; continue; }
    pending ||= { start:textOffset, end:textOffset, original:'', replacement:'' };
    if (part.removed) { pending.original += value; pending.end += value.length; textOffset += value.length; }
    if (part.added) pending.replacement += value;
  }
  flush();
  return edits;
};

// 모델이 원문을 통째로 뒤에 붙이는 실패 응답을 적용 전 차단한다.
export const isSuspiciousCorrection = (original, corrected) => {
  const before = String(original || '');
  const after = String(corrected || '');
  return !after || (after.length > before.length * 1.5 && after.includes(before));
};

// 이전 이중 동기화로 저장됐을 수 있는, 바로 이어진 완전히 같은 문단만 보수적으로 정리한다.
export const dedupeAdjacentParagraphs = (xhtml) => {
  let result = String(xhtml || '');
  let previous;
  const duplicate = /(<p\b[^>]*>[\s\S]*?<\/p>)(\s*)\1/g;
  do { previous = result; result = result.replace(duplicate, '$1$2'); } while (result !== previous);
  return result;
};

export const applySourceEdits = (xhtml, edits) => {
  const source = String(xhtml || '');
  const ordered = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  let boundary = source.length + 1;
  let result = source;
  for (const edit of ordered) {
    if (edit.start < 0 || edit.end < edit.start || edit.end > source.length || edit.end > boundary) throw new Error('겹치거나 잘못된 교정 범위입니다. 다시 검사하세요.');
    if (source.slice(edit.start, edit.end) !== edit.original) throw new Error('본문이 검사 후 변경되었습니다. 다시 검사하세요.');
    result = result.slice(0, edit.start) + edit.replacement + result.slice(edit.end);
    boundary = edit.start;
  }
  return result;
};

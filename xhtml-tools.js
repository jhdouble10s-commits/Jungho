// Small, source-preserving XHTML helpers. These intentionally do not parse or
// reformat the document: EPUB source remains canonical and only the missing
// slash on XHTML void elements is repaired.
const XHTML_VOID_ELEMENT = /<(br|hr|img|meta|link|input)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;

export const fixXhtmlVoidElements = (source) => String(source || '').replace(
  XHTML_VOID_ELEMENT,
  (whole, tag, attributes) => /\/\s*$/.test(attributes)
    ? whole
    : `<${tag}${attributes.replace(/\s+$/, '')} />`,
);

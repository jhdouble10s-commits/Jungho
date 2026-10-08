// Small, source-preserving XHTML helpers. These never reformat the document: EPUB source remains canonical and only the missing
// slash on XHTML void elements is repaired.
import { sourceElements } from './xhtml-source.js';
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

export const fixXhtmlVoidElements = (source) => {
  let result = String(source || '');
  // The installed VS Code HTML parser identifies real tags and source ranges.
  // Insert only a missing slash; never reserialize the table or its attributes.
  const tags = sourceElements(result).filter(node => voidTags.has(node.tag?.toLowerCase()) && node.startTagEnd);
  for (const node of tags.sort((a,b) => b.start - a.start)) {
    const end = node.startTagEnd - 1;
    if (result[end] !== '>' || /\/\s*$/.test(result.slice(node.start, end))) continue;
    const space = /\s/.test(result[end - 1]) ? '' : ' ';
    result = result.slice(0, end) + space + '/' + result.slice(end);
  }
  return result;
};

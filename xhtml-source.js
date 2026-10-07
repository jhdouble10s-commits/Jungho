import { getLanguageService } from 'vscode-html-languageservice';
import { TextDocument } from 'vscode-languageserver-textdocument';
const service = getLanguageService();
export function formatXhtml(source) {
  const document = TextDocument.create('file:///chapter.xhtml', 'html', 1, source);
  return TextDocument.applyEdits(document, service.format(document, undefined, {
    tabSize:2, insertSpaces:true, wrapLineLength:0, wrapAttributes:'preserve',
    preserveNewLines:true, endWithNewline:false,
    unformatted:'a,span,strong,em,b,i,u,s,sup,sub,code,pre,textarea',
  }));
}
export function sourceElements(source) {
  const html = service.parseHTMLDocument({ getText:() => source });
  const nodes = [];
  const visit = (children, path = []) => children.forEach((node, index) => {
    nodes.push({ ...node, path:[...path, index] });
    visit(node.children, [...path, index]);
  });
  visit(html.roots);
  return nodes;
}
export function elementAtOffset(source, offset) {
  return sourceElements(source).filter(node => node.start <= offset && offset <= node.end).at(-1) || null;
}
export function elementAtPath(root, path) {
  let element = root;
  for (const index of path) {
    element = Array.from(element.children).filter(child => !child.matches('style[data-preview-css]'))[index];
    if (!element) return null;
  }
  return element;
}
export function sourceAttribute(node, name) {
  const value = node.attributes?.[name];
  if (value === undefined || value === null) return '';
  return value[0] === '"' || value[0] === "'" ? value.slice(1, -1) : value;
}

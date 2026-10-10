const prefix = '<root xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:xlink="http://www.w3.org/1999/xlink">\n';
export function parseXhtml(source, Parser = globalThis.DOMParser) {
  return new Parser().parseFromString(`${prefix}${source}\n</root>`, 'application/xml');
}
export function validateXhtml(source, Parser = globalThis.DOMParser) {
  const document = parseXhtml(source, Parser);
  return Array.from(document.getElementsByTagName('parsererror')).map(error => {
    const message = error.textContent.trim();
    return { line:Math.max(1, (Number(message.match(/(?:line|행)\s*(\d+)/i)?.[1]) || 2) - 1), column:Number(message.match(/(?:column|열)\s*(\d+)/i)?.[1]) || 1, message };
  });
}
// A formatter may only add inter-element indentation; it must preserve names,
// attributes, entities' values, and all non-whitespace text nodes exactly.
const blocks = new Set(['p','div','section','article','aside','header','footer','nav','main','h1','h2','h3','h4','h5','h6','hr','ul','ol','li','blockquote','table','thead','tbody','tfoot','tr','td','th','colgroup','col']);
function structuralIndentation(node,preserveWhitespace) {
  if (preserveWhitespace || !/^[\t\r\n ]*$/.test(node.data)) return false;
  const parent=node.parentNode,children=Array.from(parent?.childNodes || []);
  for(let ancestor=parent;ancestor?.nodeType===1;ancestor=ancestor.parentNode) {
    if (['pre','code','textarea'].includes(ancestor.localName) || ancestor.getAttribute('xml:space')==='preserve' || /white-space\s*:/i.test(ancestor.getAttribute('style') || '')) return false;
  }
  return children.some(child=>child.nodeType===1 && blocks.has(child.localName))
    && children.every(child=>child.nodeType===8 || child.nodeType===3 && /^[\t\r\n ]*$/.test(child.data) || child.nodeType===1 && blocks.has(child.localName));
}

// Temporary projection only: never store this value as canonical XHTML.
// ProseMirror's full-whitespace parser otherwise turns table indentation into
// cells/paragraphs. The same strict classifier is used by the loss detector.
export function projectXhtmlForVisual(source, {preserveWhitespace=false}={}, Parser=globalThis.DOMParser, Serializer=globalThis.XMLSerializer) {
  if (!source || validateXhtml(source,Parser).length) return source;
  const root=parseXhtml(source,Parser).documentElement;
  if(root.firstChild?.nodeType===3) root.firstChild.data=root.firstChild.data.slice(1);
  if(root.lastChild?.nodeType===3) root.lastChild.data=root.lastChild.data.slice(0,-1);
  const visit=node=>{
    for(const child of Array.from(node.childNodes)) {
      if(child.nodeType===3 && structuralIndentation(child,preserveWhitespace)) node.removeChild(child);
      else if(child.nodeType===1) visit(child);
    }
  };
  visit(root);
  const serializer=new Serializer();
  return Array.from(root.childNodes,node=>serializer.serializeToString(node)).join('');
}
export function equivalentXhtml(before, after, Parser = globalThis.DOMParser, {preserveWhitespace = false} = {}) {
  if (validateXhtml(before, Parser).length || validateXhtml(after, Parser).length) return false;
  const signature = node => {
    if (node.nodeType === 3) {
      // Spaces between inline tags and all preformatted text are content.
      // Ignore only indentation in element-only block containers.
      return structuralIndentation(node,preserveWhitespace) ? null : ['text', node.data];
    }
    if (node.nodeType === 8) return ['comment', node.data];
    if (node.nodeType !== 1) return null;
    return [node.namespaceURI,node.localName, Array.from(node.attributes).filter(attribute => attribute.namespaceURI !== 'http://www.w3.org/2000/xmlns/').map(attribute => [`${attribute.namespaceURI || ''}:${attribute.localName}`, attribute.value])
      .sort(([left], [right]) => left.localeCompare(right)), Array.from(node.childNodes, signature).filter(Boolean)];
  };
  return JSON.stringify(signature(parseXhtml(before, Parser).documentElement)) === JSON.stringify(signature(parseXhtml(after, Parser).documentElement));
}

export function xhtmlPreservationIssue(source, output, options = {}) {
  const errors = validateXhtml(source);
  if (errors.length) return `XHTML 문법 오류: ${errors[0].message}`;
  if (equivalentXhtml(source,output,globalThis.DOMParser,options)) return null;
  const before = parseXhtml(source).documentElement;
  const after = parseXhtml(output).documentElement;
  const elements = node => Array.from(node.getElementsByTagName('*'));
  const left = elements(before), right = elements(after);
  for (let index=0;index<left.length;index++) {
    const a=left[index],b=right[index];
    if (a.localName !== b?.localName || a.namespaceURI !== b?.namespaceURI) return `<${a.nodeName}> 요소 또는 네임스페이스를 일반편집이 보존하지 못해 읽기 전용으로 열었습니다.`;
    for (const attribute of a.attributes) {
      if (attribute.namespaceURI === 'http://www.w3.org/2000/xmlns/') continue;
      if (b.getAttributeNS(attribute.namespaceURI,attribute.localName) !== attribute.value) return `<${a.nodeName}>의 ${attribute.name} 속성을 일반편집이 보존하지 못해 읽기 전용으로 열었습니다.`;
    }
  }
  if (before.textContent !== after.textContent) return '일반편집 재파싱으로 본문 또는 공백이 달라집니다. 원문을 보존하려고 읽기 전용으로 열었습니다.';
  return '일반편집이 요소·속성·네임스페이스 구조를 그대로 보존할 수 없어 읽기 전용으로 열었습니다.';
}

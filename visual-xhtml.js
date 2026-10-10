import {validateXhtml} from './xhtml-validation.js';

// HTML is the visual editor's interchange format only. Build an XML tree so
// escaping, namespaces and empty elements follow XML rules at one boundary.
export function serializeVisualXhtml(html, documentImpl = document) {
  const template = documentImpl.createElement('template'); template.innerHTML = html;
  // TextStyle and epubSpan intentionally parse the same EPUB span when it
  // carries both editable typography and preservation-only attributes. Merge
  // the lossless projection back to the original single-span boundary before
  // converting to XHTML; this is not a blanket HTML cleanup.
  const mergeTextStyleSpans = parent => {
    for (const child of Array.from(parent.children)) mergeTextStyleSpans(child);
    const projected = parent.getAttribute?.('data-sitescout-epub-span-projection') === 'true';
    if (parent.localName !== 'span' || parent.childNodes.length !== 1 || !projected) {
      if (projected) parent.removeAttribute('data-sitescout-epub-span-projection');
      return;
    }
    const child = parent.firstElementChild;
    if (!child || child.localName !== 'span' || parent.firstChild !== child
      || Array.from(child.attributes).some(attribute => attribute.name !== 'style')) {
      parent.removeAttribute('data-sitescout-epub-span-projection');
      return;
    }
    const parentStyle = parent.getAttribute('style') || '';
    const childStyle = child.getAttribute('style') || '';
    if (parentStyle || childStyle) {
      const merged = documentImpl.createElement('span').style;
      merged.cssText = parentStyle;
      for (const property of childStyle.split(';')) {
        const separator = property.indexOf(':');
        if (separator < 0) continue;
        merged.setProperty(property.slice(0, separator).trim(), property.slice(separator + 1).trim());
      }
      if (merged.cssText) parent.setAttribute('style', merged.cssText);
      else parent.removeAttribute('style');
    }
    parent.replaceChildren(...child.childNodes);
    parent.removeAttribute('data-sitescout-epub-span-projection');
  };
  Array.from(template.content.children).forEach(mergeTextStyleSpans);
  const xml = documentImpl.implementation.createDocument('http://www.w3.org/1999/xhtml','root');
  const copy = node => {
    if (node.nodeType === 3) return xml.createTextNode(node.data);
    if (node.nodeType === 8) return xml.createComment(node.data);
    if (node.nodeType !== 1) throw new Error('일반편집 출력에 지원하지 않는 노드가 있습니다.');
    const element = xml.createElementNS(node.namespaceURI || 'http://www.w3.org/1999/xhtml',node.localName);
    for (const attribute of node.attributes) {
      const ns = attribute.namespaceURI || (attribute.name.startsWith('xml:') ? 'http://www.w3.org/XML/1998/namespace' : attribute.name.startsWith('epub:') ? 'http://www.idpf.org/2007/ops' : null);
      element.setAttributeNS(ns,attribute.name,attribute.value);
    }
    for (const child of node.childNodes) element.appendChild(copy(child));
    return element;
  };
  for (const child of template.content.childNodes) xml.documentElement.appendChild(copy(child));
  const serialized = new XMLSerializer().serializeToString(xml.documentElement);
  const source = serialized.slice(serialized.indexOf('>')+1,serialized.lastIndexOf('</root>'));
  const errors = validateXhtml(source);
  if (errors.length) throw new Error(`일반편집 XHTML 변환 오류: ${errors[0].message}`);
  return source;
}

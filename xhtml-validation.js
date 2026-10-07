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
export function equivalentXhtml(before, after, Parser = globalThis.DOMParser) {
  if (validateXhtml(before, Parser).length || validateXhtml(after, Parser).length) return false;
  const blocks = new Set(['p','div','section','article','aside','header','footer','nav','main','h1','h2','h3','h4','h5','h6','hr','ul','ol','li','blockquote','table','thead','tbody','tfoot','tr','td','th']);
  const signature = node => {
    if (node.nodeType === 3) {
      const parent = node.parentNode;
      const children = Array.from(parent?.childNodes || []);
      // Spaces between inline tags and all preformatted text are content.
      // Ignore only indentation in element-only block containers.
      const indentation = !node.data.trim() && !['pre','code','textarea'].includes(parent?.localName)
        && children.every(child => child.nodeType === 8 || (child.nodeType === 3 && !child.data.trim()) || (child.nodeType === 1 && blocks.has(child.localName)));
      return indentation ? null : ['text', node.data];
    }
    if (node.nodeType === 8) return ['comment', node.data];
    if (node.nodeType !== 1) return null;
    return [node.nodeName, Array.from(node.attributes, attribute => [attribute.name, attribute.value]), Array.from(node.childNodes, signature).filter(Boolean)];
  };
  return JSON.stringify(signature(parseXhtml(before, Parser).documentElement)) === JSON.stringify(signature(parseXhtml(after, Parser).documentElement));
}

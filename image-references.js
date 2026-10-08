import * as htmlService from 'vscode-html-languageservice';
import { parse, walk, generate } from './vendor/csstree.esm.js';
import { parseSrcset, stringifySrcset } from 'srcset';
const { getLanguageService, TokenType } = htmlService.default || htmlService;
const service = getLanguageService();
const decodeXml = value => new DOMParser().parseFromString(`<r>${value.replaceAll('<','&lt;')}</r>`,'application/xml').documentElement.textContent;
const escapeAttribute = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&apos;').replaceAll('<','&lt;');
const decodePath = value => { try { return decodeURIComponent(value); } catch { return value; } };
export const imageAssetPath = (name,asset) => asset.originalPath || `EPUB/Image/${name}`;
export function resolveImagePath(value,base) {
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return null;
  const url = new URL(value,new URL(base,'https://epub.invalid/'));
  return decodePath(url.pathname.slice(1));
}
function replacementUrl(value,nextPath,base) {
  const url = new URL(value,new URL(base,'https://epub.invalid/'));
  const from = base.split('/').slice(0,-1), to = nextPath.split('/');
  while (from.length && to.length && from[0] === to[0]) { from.shift(); to.shift(); }
  return '../'.repeat(from.length) + to.map(encodeURIComponent).join('/') + url.search + url.hash;
}
function applyEdits(source,edits) {
  for (const edit of edits.sort((a,b) => b.start-a.start)) source = source.slice(0,edit.start)+edit.value+source.slice(edit.end);
  return source;
}
function cssReferences(source,base,target,nextPath,context='stylesheet') {
  const edits = [], hits = [];
  const ast = parse(source,{positions:true,context,onParseError:error => { throw error; }});
  walk(ast,node => {
    if (node.type !== 'Url' || resolveImagePath(node.value,base) !== target) return;
    hits.push(node.loc.start.offset);
    if (nextPath) edits.push({start:node.loc.start.offset,end:node.loc.end.offset,value:generate({...node,value:replacementUrl(node.value,nextPath,base)})});
  });
  return {source:applyEdits(source,edits),hits};
}
// OSS token offsets let us patch only reference values, preserving XHTML bytes.
export function imageReferences(source,base,target,{nextPath,css=false} = {}) {
  if (css) return cssReferences(source,base,target,nextPath);
  const scanner = service.createScanner(source), edits = [], hits = [];
  let token, attribute = '', tag = '';
  while ((token = scanner.scan()) !== TokenType.EOS) {
    if (token === TokenType.StartTag) tag = scanner.getTokenText().toLowerCase();
    if (token === TokenType.AttributeName) attribute = scanner.getTokenText().toLowerCase();
    if (token === TokenType.AttributeValue) {
      const raw = scanner.getTokenText(), quoted = raw[0] === '"' || raw[0] === "'";
      const value = decodeXml(quoted ? raw.slice(1,-1) : raw);
      const start = scanner.getTokenOffset(), end = scanner.getTokenEnd();
      if (attribute === 'srcset') {
        const candidates = parseSrcset(value);
        let changed = false;
        for (const candidate of candidates) if (resolveImagePath(candidate.url,base) === target) {
          hits.push(start); changed = true;
          if (nextPath) candidate.url = replacementUrl(candidate.url,nextPath,base);
        }
        if (changed && nextPath) edits.push({start,end,value:`"${escapeAttribute(stringifySrcset(candidates))}"`});
      } else if (attribute === 'style') {
        const result = cssReferences(value,base,target,nextPath,'declarationList');
        if (result.hits.length) {
          hits.push(...result.hits.map(() => start));
          if (nextPath) edits.push({start,end,value:`"${escapeAttribute(result.source)}"`});
        }
      } else if (['src','href','xlink:href','poster'].includes(attribute) || attribute === 'data' && tag === 'object') {
        // Legacy upload links are relative to the app, not the chapter file.
        const effectiveBase = !base.startsWith('EPUB/') || !value.startsWith('images/') ? base : 'EPUB/';
        const path = effectiveBase === 'EPUB/' ? `EPUB/Image/${decodePath(value.slice(7).split(/[?#]/)[0])}` : resolveImagePath(value,base);
        if (path === target) {
          hits.push(start);
          if (nextPath) edits.push({start,end,value:`"${escapeAttribute(replacementUrl(value,nextPath,base))}"`});
        }
      }
    } else if (token === TokenType.Styles) {
      const result = cssReferences(scanner.getTokenText(),base,target,nextPath);
      hits.push(...result.hits.map(offset => scanner.getTokenOffset()+offset));
      if (nextPath && result.hits.length) edits.push({start:scanner.getTokenOffset(),end:scanner.getTokenEnd(),value:result.source});
    }
  }
  return {source:applyEdits(source,edits),hits};
}

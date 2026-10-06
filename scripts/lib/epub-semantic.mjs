import { createHash } from 'node:crypto';
import { DOMParser } from '@xmldom/xmldom';
import JSZip from 'jszip';

const text = (zip, name) => zip.file(name)?.async('text');
const children = (node, name) => Array.from(node?.childNodes || []).filter((child) => child.nodeType === 1 && (!name || child.localName === name));
const descendants = (node, name, found = []) => {
  children(node).forEach((child) => { if (!name || child.localName === name) found.push(child); descendants(child, name, found); });
  return found;
};
const nodeText = (node) => String(node?.textContent || '').replace(/\s+/g, ' ').trim();
const parseXml = (value, label) => {
  const document = new DOMParser().parseFromString(value, 'application/xml');
  if (descendants(document, 'parsererror').length) throw new Error(`잘못된 XML: ${label}`);
  return document;
};
export const resolvePath = (base, href = '') => {
  if (!href || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(href)) return null;
  try { return decodeURIComponent(new URL(href.split('#')[0], `https://epub.local/${base}`).pathname.slice(1)); }
  catch { return null; }
};
const sha256 = async (zip, name) => createHash('sha256').update(await zip.file(name).async('nodebuffer')).digest('hex');

const tocFromNcx = (document, base) => {
  const visit = (point) => {
    const content = descendants(point, 'content')[0];
    const label = nodeText(descendants(point, 'text')[0]);
    return {
      label,
      href:resolvePath(base, content?.getAttribute('src') || ''),
      children:children(point, 'navPoint').map(visit),
    };
  };
  return descendants(document, 'navMap')[0] ? children(descendants(document, 'navMap')[0], 'navPoint').map(visit) : [];
};
const tocFromNav = (document, base) => {
  const visitList = (list) => children(list, 'li').map((item) => {
    const anchor = descendants(item, 'a')[0];
    const nested = children(item, 'ol')[0];
    return { label:nodeText(anchor), href:resolvePath(base, anchor?.getAttribute('href') || ''), children:nested ? visitList(nested) : [] };
  });
  const nav = descendants(document, 'nav').find((item) => /(?:^|\s)toc(?:\s|$)/.test(item.getAttribute('epub:type') || item.getAttribute('type') || ''));
  return nav ? visitList(children(nav, 'ol')[0]) : [];
};
const flattenToc = (items, parentHref = null, result = []) => {
  items.forEach((item) => { result.push({ label:item.label, href:item.href, parentHref }); flattenToc(item.children, item.href, result); });
  return result;
};

export const loadSemanticEpub = async (input) => {
  const zip = await JSZip.loadAsync(input);
  const files = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
  const container = parseXml(await text(zip, 'META-INF/container.xml'), 'container.xml');
  const rootfile = descendants(container, 'rootfile')[0]?.getAttribute('full-path');
  if (!rootfile || !zip.file(rootfile)) throw new Error('OPF를 찾을 수 없습니다.');
  const opf = parseXml(await text(zip, rootfile), rootfile);
  const base = rootfile.slice(0, rootfile.lastIndexOf('/') + 1);
  const manifest = new Map(descendants(opf, 'item').map((item) => {
    const href = resolvePath(base, item.getAttribute('href') || '');
    return [item.getAttribute('id'), { id:item.getAttribute('id'), href, mediaType:item.getAttribute('media-type') || '', properties:item.getAttribute('properties') || '' }];
  }));
  const spine = children(descendants(opf, 'spine')[0], 'itemref').map((item) => ({
    idref:item.getAttribute('idref'), linear:item.getAttribute('linear') || 'yes', href:manifest.get(item.getAttribute('idref'))?.href || null,
  }));
  const nav = Array.from(manifest.values()).find((item) => item.properties.split(/\s+/).includes('nav'));
  const ncx = Array.from(manifest.values()).find((item) => item.mediaType === 'application/x-dtbncx+xml');
  const toc = nav?.href && zip.file(nav.href) ? tocFromNav(parseXml(await text(zip, nav.href), nav.href), nav.href.slice(0, nav.href.lastIndexOf('/') + 1))
    : ncx?.href && zip.file(ncx.href) ? tocFromNcx(parseXml(await text(zip, ncx.href), ncx.href), ncx.href.slice(0, ncx.href.lastIndexOf('/') + 1)) : [];
  const resources = Array.from(manifest.values());
  const images = await Promise.all(resources.filter((item) => item.mediaType.startsWith('image/') && item.href && zip.file(item.href)).map(async (item) => ({ path:item.href, hash:await sha256(zip, item.href) })));
  const stylesheets = await Promise.all(resources.filter((item) => item.mediaType === 'text/css' && item.href && zip.file(item.href)).map(async (item) => ({ path:item.href, hash:await sha256(zip, item.href) })));
  const cover = resources.filter((item) => item.properties.split(/\s+/).includes('cover-image')).map((item) => item.href);
  const xhtml = resources.filter((item) => /(?:xhtml|html)/.test(item.mediaType) && item.href && zip.file(item.href));
  const hrefs = [];
  const idsByPath = new Map();
  for (const item of xhtml) {
    const document = parseXml(await text(zip, item.href), item.href);
    idsByPath.set(item.href, new Set(descendants(document).map((node) => node.getAttribute('id')).filter(Boolean)));
    descendants(document, 'a').forEach((anchor) => {
      const href = anchor.getAttribute('href') || '';
      hrefs.push({
        from:item.href, href, target:resolvePath(item.href.slice(0, item.href.lastIndexOf('/') + 1), href),
        fragment:href.includes('#') ? href.slice(href.indexOf('#') + 1) : '',
        noteref:/(?:^|\s)noteref(?:\s|$)/.test(anchor.getAttribute('epub:type') || ''),
      });
    });
  }
  const brokenResources = resources.filter((item) => item.href && !zip.file(item.href)).map((item) => item.href);
  const brokenHrefs = hrefs.filter((link) => link.target && (!zip.file(link.target) || (link.fragment && !idsByPath.get(link.target)?.has(link.fragment)))).map((link) => `${link.from} -> ${link.href}`);
  const footnotes = hrefs.filter((link) => link.noteref || /(?:^|\/)footnote\.xhtml$/i.test(link.target || ''));
  const flatToc = flattenToc(toc);
  const tocPaths = new Set(flatToc.map((item) => item.href).filter(Boolean));
  return {
    files, manifest:resources, spine, toc, flatToc,
    chapterCount:spine.filter((item) => /(?:xhtml|html)/.test(manifest.get(item.idref)?.mediaType || '')).length,
    includeInToc:spine.map((item) => ({ href:item.href, include:tocPaths.has(item.href) })),
    images, stylesheets, cover, hrefs, footnotes, brokenResources, brokenHrefs,
  };
};

export const assertSemanticEquivalent = (source, candidate) => {
  const comparable = (value) => JSON.stringify(value);
  const pairs = [
    ['chapter/spine count', source.chapterCount, candidate.chapterCount],
    ['spine order', source.spine.map(({ href, linear }) => ({ href, linear })), candidate.spine.map(({ href, linear }) => ({ href, linear }))],
    ['TOC label/hierarchy', source.flatToc, candidate.flatToc],
    ['includeInToc', source.includeInToc, candidate.includeInToc],
    ['images path/hash', source.images, candidate.images],
    ['CSS resource', source.stylesheets, candidate.stylesheets],
    ['cover', source.cover, candidate.cover],
    ['internal href', source.hrefs, candidate.hrefs],
    ['footnote href/destination', source.footnotes, candidate.footnotes],
  ];
  for (const [label, before, after] of pairs) {
    if (comparable(before) !== comparable(after)) throw new Error(`semantic 불일치: ${label}`);
  }
  if (candidate.brokenResources.length || candidate.brokenHrefs.length) throw new Error(`깨진 리소스 링크: ${[...candidate.brokenResources, ...candidate.brokenHrefs].join(', ')}`);
};

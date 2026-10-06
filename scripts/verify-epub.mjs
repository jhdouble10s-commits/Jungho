import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { assertSemanticEquivalent, loadSemanticEpub } from './lib/epub-semantic.mjs';

const epubPath = process.argv[2] || '기도먼저.epub';
const exportedPath = process.argv[3];
const original = await readFile(epubPath);
const source = await JSZip.loadAsync(original);
const required = ['mimetype', 'META-INF/container.xml', 'OEBPS/content.opf', 'OEBPS/toc.ncx'];
for (const name of required) {
  if (!source.file(name)) throw new Error(`필수 EPUB 항목 누락: ${name}`);
}
if (await source.file('mimetype').async('text') !== 'application/epub+zip') {
  throw new Error('mimetype 값이 올바르지 않습니다.');
}

const copied = new JSZip();
const names = Object.keys(source.files).filter((name) => !source.files[name].dir);
for (const name of names) {
  copied.file(name, await source.file(name).async('uint8array'), { compression:name === 'mimetype' ? 'STORE' : 'DEFLATE' });
}
const roundTrip = await copied.generateAsync({ type:'nodebuffer', compression:'DEFLATE', streamFiles:false });
const restored = await JSZip.loadAsync(roundTrip);
for (const name of names) {
  const before = createHash('sha256').update(await source.file(name).async('nodebuffer')).digest('hex');
  const after = createHash('sha256').update(await restored.file(name).async('nodebuffer')).digest('hex');
  if (before !== after) throw new Error(`round-trip 데이터 불일치: ${name}`);
}
const localHeader = roundTrip.subarray(0, 30);
const firstNameLength = localHeader.readUInt16LE(26);
const firstName = roundTrip.subarray(30, 30 + firstNameLength).toString('utf8');
const method = localHeader.readUInt16LE(8);
if (firstName !== 'mimetype' || method !== 0) throw new Error('mimetype가 첫 번째 무압축 ZIP 항목이 아닙니다.');
const sourceSemantic = await loadSemanticEpub(original);
const restoredSemantic = await loadSemanticEpub(roundTrip);
assertSemanticEquivalent(sourceSemantic, restoredSemantic);
console.log(`JSZip round-trip OK: ${names.length} files, mimetype first/STORED, all SHA-256 equal`);
console.log(`Semantic round-trip OK: ${sourceSemantic.chapterCount} spine chapters, ${sourceSemantic.images.length} images, ${sourceSemantic.flatToc.length} TOC entries`);
if (exportedPath) {
  const exported = await readFile(exportedPath);
  const exportedSemantic = await loadSemanticEpub(exported);
  assertSemanticEquivalent(sourceSemantic, exportedSemantic);
  console.log(`Export semantic equivalence OK: ${exportedPath}`);
}

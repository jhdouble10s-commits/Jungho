import { access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const epubPath = process.argv[2];
const jarPath = process.env.EPUBCHECK_JAR || 'tools/epubcheck/epubcheck.jar';
if (!epubPath) throw new Error('사용법: npm run verify:epubcheck -- path/to/book.epub');
const java = spawnSync('java', ['-version'], { encoding:'utf8' });
if (java.error || java.status !== 0) {
  throw new Error('EPUBCheck는 Java 17+와 공식 epubcheck.jar가 필요합니다. docs/epubcheck.md를 참고하세요.');
}
try { await access(jarPath); }
catch { throw new Error(`공식 EPUBCheck JAR를 찾을 수 없습니다: ${jarPath}`); }
const result = spawnSync('java', ['-jar', jarPath, epubPath], { stdio:'inherit' });
process.exitCode = result.status ?? 1;

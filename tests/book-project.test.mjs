import test from 'node:test';
import assert from 'node:assert/strict';
import { BookProject } from '../book-project.js';
test('selected ID의 XHTML만 변경하며 snapshot/reload와 삭제 후 독립성을 유지한다', () => {
  const project = new BookProject();
  project.replace(['A','B','C'].map(id => ({ id, originalPath:`Text/${id}.xhtml`, xhtml:`<p>${id}</p>` })), 'B');
  project.update(project.selectedChapterId, { xhtml:'<p>NEW</p>' });
  const saved = structuredClone(project.snapshot());
  project.replace(saved.chapters, saved.selectedChapterId);
  assert.deepEqual(project.chapters.map(ch => ch.xhtml), ['<p>A</p>','<p>NEW</p>','<p>C</p>']);
  project.remove('A');
  assert.equal(project.selectedChapter.id, 'B');
  assert.equal(project.selectedChapter.originalPath, 'Text/B.xhtml');
  assert.equal(project.selectedChapter.body, '<p>NEW</p>');
  project.selectedChapter.body = '<p>B2</p>';
  assert.equal(project.selectedChapter.xhtml, '<p>B2</p>');
});

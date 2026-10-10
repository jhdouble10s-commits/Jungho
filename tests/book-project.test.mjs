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
test('project identity survives rename/load, instance changes on replacement and chapter revisions are independent',()=>{
  const project=new BookProject(),id=project.projectId,instance=project.instanceId;
  project.replace([{id:'a',xhtml:'<p>A</p>'},{id:'b',xhtml:'<p>B</p>'}],'a',{projectId:id,serverRevision:3});
  assert.equal(project.projectId,id);assert.notEqual(project.instanceId,instance);assert.equal(project.serverRevision,3);
  project.update('b',{xhtml:'<p>B2</p>'});assert.equal(project.chapters[0].sourceRevision||0,0);assert.equal(project.chapters[1].sourceRevision,1);
  project.update('b',{title:'renamed'});assert.equal(project.chapters[1].sourceRevision,1);
  project.replace([],null);assert.notEqual(project.projectId,id);assert.equal(project.serverRevision,0);
});

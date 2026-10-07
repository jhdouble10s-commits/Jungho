// Application state only. Persistence receives plain snapshots, never editor caches.
export class BookProject {
  selectedChapterId = null;
  chapters = [];
  dirty = false;
  revision = 0;
  get selectedChapter() { return this.chapters.find(chapter => chapter.id === this.selectedChapterId) || null; }
  replace(chapters, selectedId) {
    this.chapters = chapters.map(source => this.createChapter(source));
    this.selectedChapterId = this.chapters.some(chapter => chapter.id === selectedId) ? selectedId : this.chapters[0]?.id || null;
    this.revision++;
    this.dirty = false;
  }
  createChapter(source) {
    const chapter = { ...source, id:source.id || `chapter-${crypto.randomUUID()}`, xhtml:source.xhtml ?? source.body ?? '', type:source.type || 'chapter' };
    delete chapter.body;
    // Legacy export adapter: a single value, not a second cache.
    Object.defineProperty(chapter, 'body', { get() { return this.xhtml; }, set(value) { this.xhtml = value; }, enumerable:false });
    return chapter;
  }
  add(source) { const chapter = this.createChapter(source); this.chapters.push(chapter); this.dirty = true; this.revision++; return chapter; }
  update(id, patch) {
    const chapter = this.chapters.find(item => item.id === id);
    if (!chapter) return false;
    const { id:ignored, body, ...fields } = patch;
    Object.assign(chapter, fields);
    if (body !== undefined) chapter.xhtml = body;
    this.dirty = true;
    this.revision++;
    return true;
  }
  remove(id) {
    const position = this.chapters.findIndex(chapter => chapter.id === id);
    if (position < 0) return;
    this.chapters.splice(position, 1);
    if (this.selectedChapterId === id) this.selectedChapterId = this.chapters[Math.min(position, this.chapters.length - 1)]?.id || null;
    this.dirty = true;
    this.revision++;
  }
  snapshot() { return { selectedChapterId:this.selectedChapterId, chapters:this.chapters.map(chapter => ({ ...chapter })) }; }
}

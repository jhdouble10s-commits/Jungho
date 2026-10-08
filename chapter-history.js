// One native Monaco history per canonical chapter. Both editing views use it;
// loading a view never creates an edit. Models are session caches, not saved data.
export function createChapterHistory(monaco, project) {
  const entries = new Map();
  function modelFor(chapter) {
    for (const [id, entry] of entries) {
      if (!project.chapters.includes(entry.chapter)) { entry.model.dispose(); entries.delete(id); }
    }
    if (!chapter || !project.chapters.includes(chapter)) return null;
    if (!entries.has(chapter.id)) entries.set(chapter.id, {
      chapter, model:monaco.editor.createModel(chapter.xhtml, 'html'),
    });
    return entries.get(chapter.id).model;
  }
  function record(chapter, source, separate = false) {
    const model = modelFor(chapter);
    if (!model || model.getValue() === source) return model;
    const before = model.getValue();
    let start = 0, end = before.length, nextEnd = source.length;
    while (start < end && start < nextEnd && before[start] === source[start]) start++;
    while (end > start && nextEnd > start && before[end - 1] === source[nextEnd - 1]) { end--; nextEnd--; }
    const from = model.getPositionAt(start), to = model.getPositionAt(end);
    if (separate) model.pushStackElement();
    model.pushEditOperations([], [{ range:new monaco.Range(from.lineNumber, from.column, to.lineNumber, to.column), text:source.slice(start, nextEnd) }], () => null);
    if (separate) model.pushStackElement();
    return model;
  }
  return { modelFor, record };
}

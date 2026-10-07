// Hierarchy selection is kept independent from DOM and editor state so it can
// be tested without changing a chapter's identity or XHTML.
export const nearestPreviousTopLevelId = (orderedIds, parentById, selectedId) => {
  const position = orderedIds.indexOf(selectedId);
  if (position < 1) return null;
  return orderedIds.slice(0, position).reverse().find((id) => !parentById.has(id)) || null;
};

// Pure filter helpers for the trophy list: read the controls, then
// apply them to a trophy array against the earned set. No DOM writes
// here — app.js owns rendering, so these two functions stay trivially
// testable on their own.

export function readFilters(doc = document) {
  const byId = (id) => doc.getElementById(id);
  return {
    grade: byId('gradeFilter').value,
    kind: byId('kindFilter').value,
    search: byId('searchBox').value.toLowerCase().trim(),
    hideEarned: byId('hideEarned').checked,
    missableOnly: byId('missableOnly').checked,
  };
}

export function trophySearchText(t) {
  return `${t.name} ${t.description} ${t.guide}`.toLowerCase();
}

export function applyFilters(trophies, filters, earned) {
  return trophies.filter((t) => {
    if (filters.grade && t.grade !== filters.grade) return false;
    if (filters.kind) {
      if (filters.kind === 'missable') {
        if (!t.missable) return false;
      } else if (filters.kind === 'online') {
        // No trophy is online, so this kind matches nothing by design.
        if (t.kind !== 'online') return false;
      } else if (t.kind !== filters.kind) {
        return false;
      }
    }
    if (filters.hideEarned && earned.has(t.id)) return false;
    if (filters.missableOnly && !t.missable) return false;
    if (filters.search && !trophySearchText(t).includes(filters.search)) return false;
    return true;
  });
}

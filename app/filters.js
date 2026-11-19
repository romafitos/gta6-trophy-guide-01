// Pure filter helpers for the GTA VI trophy guide.
// readFilters snapshots the toolbar controls; applyFilters narrows a trophy
// list against the earned set. No DOM writes happen here, so the same logic
// can be unit-tested without a browser.

export function readFilters(doc) {
  const grade = doc.getElementById('grade').value;
  const kind = doc.getElementById('kind').value;
  const search = doc.getElementById('search').value.toLowerCase().trim();
  const hideEarned = doc.getElementById('hide-earned').checked;
  const missableOnly = doc.getElementById('missable-only').checked;
  return { grade, kind, search, hideEarned, missableOnly };
}

export function matchesSearch(t, search) {
  if (!search) return true;
  const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
  return hay.includes(search);
}

export function applyFilters(trophies, earned, filters) {
  return trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.kind === 'missable') {
      if (!t.missable) return false;
    } else if (filters.kind === 'online') {
      if (!t.online) return false;
    } else if (filters.kind !== 'all' && t.kind !== filters.kind) {
      return false;
    }
    if (filters.hideEarned && earned.has(t.id)) return false;
    if (filters.missableOnly && !t.missable) return false;
    if (!matchesSearch(t, filters.search)) return false;
    return true;
  });
}

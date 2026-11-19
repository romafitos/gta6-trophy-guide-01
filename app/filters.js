// Pure filter helpers for the trophy list. No DOM here: the main script
// reads the controls and hands the values in, so these two functions
// can be tested on their own without a browser.

// Read the current filter control values out of a controls object.
// The search text is lower-cased and trimmed once, here, so every
// comparison downstream is a plain substring check.
export function readFilters(controls) {
  return {
    grade: controls.grade || '',
    kind: controls.kind || '',
    search: (controls.search || '').toLowerCase().trim(),
    hideEarned: Boolean(controls.hideEarned),
    missableOnly: Boolean(controls.missableOnly),
  };
}

// Does one trophy match one kind filter value? The "missable" kind is
// the missable flag, not a stored kind; the "online" kind matches
// nothing, because no trophy in the data is online; every other kind
// is an exact match against the trophy's stored kind.
export function kindMatches(trophy, kind) {
  if (!kind) return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return trophy.kind === 'online';
  return trophy.kind === kind;
}

// Apply a filter set to a trophy list against the earned set. All five
// conditions compose: a trophy shows only when every one of them holds.
// Text search runs across name, description and guide together, so a
// search for "meditation" finds both the meditation trophy itself and
// the 100% trophy whose guide counts meditation spots.
export function applyFilters(trophies, filters, earned) {
  return trophies.filter((trophy) => {
    if (filters.grade && trophy.grade !== filters.grade) return false;
    if (!kindMatches(trophy, filters.kind)) return false;
    if (filters.hideEarned && earned.has(trophy.id)) return false;
    if (filters.missableOnly && trophy.missable !== true) return false;
    if (filters.search) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(filters.search)) return false;
    }
    return true;
  });
}

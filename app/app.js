// GTA VI trophy guide — main script. Fetches the trophy data, renders
// the checklist / roadmap / guide-index views, tracks earned trophies
// in localStorage, and handles filters, spoiler mode, export and import.
// No network requests beyond the app's own data file; no external
// resources of any kind.

import { readFilters, applyFilters } from './filters.js';
import { STAGES, renderStage } from './roadmap.js';

const DATA_URL = 'data/trophies.json';
const EARNED_KEY = 'gta6-trophies-earned';
const SPOILER_KEY = 'gta6-trophies-spoiler';
const GAME_NAME = 'Grand Theft Auto VI';
const PLATINUM_ID = 1;

const $ = (id) => document.getElementById(id);
const listEl = $('trophy-list');
const detailEl = $('detail-panel');
const emptyEl = $('empty-state');
const countLineEl = $('count-line');
const ioStatusEl = $('io-status');

let trophies = [];
let earned = new Set();
let spoilerFree = false;
let selectedId = 15;
let currentView = 'checklist';

function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function loadSpoiler() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerFree ? '1' : '0');
}

function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return kind === 'miscellaneous' ? 'Other' : kind.charAt(0).toUpperCase() + kind.slice(1);
}

// Spoiler-free mode masks unearned story trophies: name and description
// become generic labels; grades stay visible. Ticking a masked trophy
// reveals it, because earned trophies are never masked.
function isMasked(trophy) {
  return spoilerFree && trophy.kind === 'story' && !earned.has(trophy.id);
}

function displayName(trophy) {
  return isMasked(trophy) ? 'Hidden story trophy' : trophy.name;
}

function displayDescription(trophy) {
  return isMasked(trophy) ? 'Complete the story to reveal this trophy.' : trophy.description;
}

function badge(text, cls) {
  const span = document.createElement('span');
  span.className = 'badge ' + cls;
  span.textContent = text;
  return span;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  $('progress-line').textContent = `${done} of ${total} earned`;
  const bar = $('progress-bar');
  bar.setAttribute('aria-valuenow', String(done));
  bar.setAttribute('aria-valuemax', String(total));
  // The fill is a plain percentage of the 55 trophies; the Platinum
  // counts like any other trophy until the last one is earned.
  $('progress-fill').style.width = total ? `${(done / total) * 100}%` : '0%';
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const ofGrade = trophies.filter((t) => t.grade === grade);
    const got = ofGrade.filter((t) => earned.has(t.id)).length;
    return `${gradeLabel(grade)} ${got}/${ofGrade.length}`;
  });
  $('grade-counts').textContent = counts.join(' · ');
  const platinum = trophyById(PLATINUM_ID);
  $('platinum-line').textContent =
    done === total && total > 0
      ? `Platinum earned — ${platinum ? platinum.name : 'Vice Got a Price!'} You are a Leonida Legend!`
      : 'Platinum: Vice Got a Price! — earn the other 54 trophies.';
}

function currentFilters() {
  return readFilters({
    grade: $('grade-filter').value,
    kind: $('kind-filter').value,
    search: $('search').value,
    hideEarned: $('hide-earned').checked,
    missableOnly: $('missable-only').checked,
  });
}

function renderChecklist() {
  const shown = applyFilters(trophies, currentFilters(), earned);
  countLineEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies · 0 online — every trophy is single-player.`;
  listEl.textContent = '';
  emptyEl.hidden = shown.length !== 0;
  for (const trophy of shown) {
    const row = document.createElement('li');
    row.className = 'trophy-row' + (earned.has(trophy.id) ? ' earned' : '') + (trophy.id === selectedId ? ' selected' : '');
    row.dataset.trophyId = String(trophy.id);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.id);
    box.setAttribute('aria-label', `Earned: ${displayName(trophy)}`);
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEarned(trophy.id);
    });
    row.appendChild(box);
    const main = document.createElement('div');
    main.className = 'row-main';
    const name = document.createElement('div');
    name.className = 'row-name';
    name.textContent = displayName(trophy);
    main.appendChild(name);
    const desc = document.createElement('div');
    desc.className = 'row-desc';
    desc.textContent = displayDescription(trophy);
    main.appendChild(desc);
    row.appendChild(main);
    const badges = document.createElement('div');
    badges.className = 'row-badges';
    badges.appendChild(badge(gradeLabel(trophy.grade), `grade-${trophy.grade}`));
    if (trophy.hidden) badges.appendChild(badge('Hidden', 'hidden-badge'));
    if (trophy.missable) badges.appendChild(badge('Missable?', 'missable-badge'));
    if (trophy.tracked != null) badges.appendChild(badge(`×${trophy.tracked}`, 'count-badge'));
    badges.appendChild(badge(kindLabel(trophy.kind), 'kind-badge'));
    row.appendChild(badges);
    row.addEventListener('click', () => selectTrophy(trophy.id));
    listEl.appendChild(row);
  }
}

function renderDetail() {
  const trophy = trophyById(selectedId);
  detailEl.textContent = '';
  if (!trophy) {
    const hint = document.createElement('p');
    hint.className = 'detail-hint';
    hint.textContent = 'Select a trophy to see its guide.';
    detailEl.appendChild(hint);
    return;
  }
  if (isMasked(trophy)) {
    const title = document.createElement('h2');
    title.textContent = 'Hidden story trophy';
    detailEl.appendChild(title);
    const note = document.createElement('p');
    note.className = 'safe-box';
    note.textContent = 'Spoiler-free mode hides this trophy until you earn it. Tick its checkbox in the checklist to reveal the guide.';
    detailEl.appendChild(note);
    return;
  }
  const title = document.createElement('h2');
  title.textContent = trophy.name;
  detailEl.appendChild(title);
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = trophy.description;
  detailEl.appendChild(desc);
  const badges = document.createElement('div');
  badges.className = 'detail-badges';
  badges.appendChild(badge(gradeLabel(trophy.grade), `grade-${trophy.grade}`));
  if (trophy.hidden) badges.appendChild(badge('Hidden on PlayStation', 'hidden-badge'));
  if (trophy.missable) badges.appendChild(badge('Possibly missable', 'missable-badge'));
  badges.appendChild(badge(kindLabel(trophy.kind), 'kind-badge'));
  detailEl.appendChild(badges);
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  const parts = [];
  if (trophy.chapter != null) parts.push(`Chapter ${trophy.chapter}`);
  if (trophy.tracked != null) parts.push(`Tracked: ${trophy.tracked}`);
  parts.push(`Roadmap stage ${trophy.stage} of 5`);
  parts.push(earned.has(trophy.id) ? 'Earned' : 'Not yet earned');
  meta.textContent = parts.join(' · ');
  detailEl.appendChild(meta);
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  const guideLabel = document.createElement('strong');
  guideLabel.textContent = 'Guide: ';
  guide.appendChild(guideLabel);
  guide.appendChild(document.createTextNode(trophy.guide));
  detailEl.appendChild(guide);
  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn-box';
    warn.textContent = trophy.missableNote || 'Possibly missable — do it early to be safe.';
    detailEl.appendChild(warn);
  } else {
    const safe = document.createElement('p');
    safe.className = 'safe-box';
    safe.textContent = 'Not missable — doable in free roam after the story.';
    detailEl.appendChild(safe);
  }
  const label = document.createElement('p');
  label.className = 'sources-label';
  label.textContent = 'Sources:';
  detailEl.appendChild(label);
  const sources = document.createElement('ul');
  sources.className = 'source-list';
  for (const source of trophy.sources) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener';
    item.appendChild(link);
    sources.appendChild(item);
  }
  detailEl.appendChild(sources);
}

function renderRoadmap() {
  const host = $('roadmap-stages');
  host.textContent = '';
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.number).sort((a, b) => a.id - b.id);
    host.appendChild(renderStage(stage, members, earned, (id) => jumpToTrophy(id)));
  }
}

function renderIndex() {
  const host = $('index-list');
  host.textContent = '';
  for (const trophy of trophies) {
    const row = document.createElement('article');
    row.className = 'index-row' + (earned.has(trophy.id) ? ' earned' : '');
    row.dataset.trophyId = String(trophy.id);
    const nameCol = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'index-name';
    name.textContent = displayName(trophy);
    nameCol.appendChild(name);
    const meta = document.createElement('div');
    meta.className = 'index-meta';
    const metaParts = [gradeLabel(trophy.grade)];
    if (trophy.hidden) metaParts.push('Hidden');
    if (trophy.missable) metaParts.push('Possibly missable');
    if (trophy.tracked != null) metaParts.push(`Tracked: ${trophy.tracked}`);
    metaParts.push(`Stage ${trophy.stage}`);
    meta.textContent = metaParts.join(' · ');
    nameCol.appendChild(meta);
    row.appendChild(nameCol);
    const guide = document.createElement('div');
    guide.className = 'index-guide';
    guide.textContent = isMasked(trophy) ? 'Complete the story to reveal this trophy.' : trophy.guide;
    row.appendChild(guide);
    const sources = document.createElement('div');
    sources.className = 'index-sources';
    if (isMasked(trophy)) {
      sources.textContent = '—';
    } else {
      for (const source of trophy.sources) {
        const link = document.createElement('a');
        link.href = source.url;
        link.textContent = source.name;
        link.target = '_blank';
        link.rel = 'noopener';
        sources.appendChild(link);
      }
    }
    row.appendChild(sources);
    row.addEventListener('click', () => jumpToTrophy(trophy.id));
    host.appendChild(row);
  }
}

function renderAll() {
  renderProgress();
  renderChecklist();
  renderDetail();
  renderRoadmap();
  renderIndex();
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveEarned();
  renderAll();
}

function selectTrophy(id) {
  selectedId = id;
  renderChecklist();
  renderDetail();
}

function jumpToTrophy(id) {
  selectedId = id;
  showView('checklist');
  renderAll();
  const row = listEl.querySelector(`[data-trophy-id="${id}"]`);
  if (row) row.scrollIntoView({ block: 'nearest' });
}

function showView(view) {
  currentView = view;
  for (const tab of document.querySelectorAll('.view-tab')) {
    const active = tab.dataset.view === view;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  }
  $('view-checklist').hidden = view !== 'checklist';
  $('view-checklist').classList.toggle('active', view === 'checklist');
  $('view-roadmap').hidden = view !== 'roadmap';
  $('view-roadmap').classList.toggle('active', view === 'roadmap');
  $('view-index').hidden = view !== 'index';
  $('view-index').classList.toggle('active', view === 'index');
  try {
    history.replaceState(null, '', `#${view}`);
  } catch {
    // Hash routing is a convenience; the tabs work without it.
  }
}

function exportProgress() {
  const payload = {
    game: GAME_NAME,
    earned: [...earned].sort((a, b) => a - b),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophies-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  ioStatusEl.textContent = `Exported ${earned.size} earned trophies.`;
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || parsed.game !== GAME_NAME || !Array.isArray(parsed.earned)) {
        throw new Error('bad shape');
      }
      const validIds = new Set(trophies.map((t) => t.id));
      const next = new Set(parsed.earned.filter((n) => Number.isInteger(n) && validIds.has(n)));
      earned = next;
      saveEarned();
      renderAll();
      ioStatusEl.textContent = `Imported ${earned.size} earned trophies.`;
    } catch {
      ioStatusEl.textContent = 'That file must hold the expected game-and-earned shape.';
    }
  };
  reader.readAsText(file);
}

function bindControls() {
  for (const id of ['grade-filter', 'kind-filter', 'search', 'hide-earned', 'missable-only']) {
    $(id).addEventListener('input', renderChecklist);
    $(id).addEventListener('change', renderChecklist);
  }
  $('spoiler-free').addEventListener('change', () => {
    spoilerFree = $('spoiler-free').checked;
    saveSpoiler();
    renderAll();
  });
  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }
  $('export-btn').addEventListener('click', exportProgress);
  $('import-file').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
}

async function init() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  trophies = [...data.trophies].sort((a, b) => a.id - b.id);
  earned = loadEarned();
  spoilerFree = loadSpoiler();
  $('spoiler-free').checked = spoilerFree;
  bindControls();
  const hash = (location.hash || '').replace('#', '');
  if (hash === 'roadmap' || hash === 'index') showView(hash);
  renderAll();
}

init();

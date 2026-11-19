// GTA 6 trophy guide — main script. Loads app/data/trophies.json,
// renders the checklist, the five-stage roadmap and the guide index,
// and keeps earned progress in localStorage. No network requests
// besides the one same-folder fetch of the trophy data file.

import { readFilters, applyFilters } from './filters.js';
import { renderRoadmap } from './roadmap.js';

const DATA_URL = 'data/trophies.json';
const STORE_EARNED = 'gta6-trophies-earned';
const STORE_SPOILER = 'gta6-trophies-spoiler';
const GAME = 'Grand Theft Auto VI';

const MASKED_NAME = 'Hidden story trophy';
const MASKED_DESC = 'Complete the story to reveal this trophy.';

let trophies = [];
let earned = new Set();
let selectedId = 15; // the stunts trophy opens first
let currentView = 'checklist';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

function loadStored() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_EARNED) ?? '[]');
    if (Array.isArray(saved)) earned = new Set(saved.filter((n) => Number.isInteger(n)));
  } catch { earned = new Set(); }
  try {
    $('spoilerFree').checked = localStorage.getItem(STORE_SPOILER) === '1';
  } catch { /* storage unavailable: spoiler stays off */ }
}

function saveStored() {
  try {
    localStorage.setItem(STORE_EARNED, JSON.stringify([...earned].sort((a, b) => a - b)));
    localStorage.setItem(STORE_SPOILER, $('spoilerFree').checked ? '1' : '0');
  } catch { /* private mode etc: progress just does not persist */ }
}

function isMasked(t) {
  return $('spoilerFree').checked && t.kind === 'story' && !earned.has(t.id);
}

function kindLabel(t) {
  return t.kind === 'miscellaneous' ? 'Other' : t.kind;
}

function gradeBadge(grade) {
  return el('span', `badge ${grade}`, grade);
}

function renderProgress() {
  const perGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    totals[t.grade] += 1;
    if (earned.has(t.id)) perGrade[t.grade] += 1;
  }
  $('progressLine').textContent = `${earned.size} of ${trophies.length} earned`;
  $('gradeCounts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${perGrade[g]}/${totals[g]} ${g}`)
    .join(' · ');
  $('progressFill').style.width = `${trophies.length ? (earned.size / trophies.length) * 100 : 0}%`;
  $('platinumLine').textContent = earned.size === trophies.length && trophies.length > 0
    ? 'Platinum earned — Vice Got a Price! You are a Leonida Legend.'
    : 'Platinum: Vice Got a Price! — earn the other 54 trophies.';
}

function renderChecklist() {
  const shown = applyFilters(trophies, readFilters(), earned);
  $('countLine').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies — 0 online, every trophy single-player.`;
  const list = $('list');
  list.innerHTML = '';
  if (shown.length === 0) {
    list.appendChild(el('div', 'empty-state', 'No trophies match these filters. Try clearing a filter.'));
  }
  for (const t of shown) {
    const masked = isMasked(t);
    const row = el('div', 'trophy-row' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : ''));
    row.setAttribute('role', 'listitem');
    row.dataset.trophyId = String(t.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${masked ? MASKED_NAME : t.name}`);
    box.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleEarned(t.id, box.checked);
    });
    row.appendChild(box);

    const main = el('div', 'row-main');
    main.appendChild(el('div', 'row-name', masked ? MASKED_NAME : t.name));
    main.appendChild(el('div', 'row-desc', masked ? MASKED_DESC : t.description));
    row.appendChild(main);

    const badges = el('div', 'row-badges');
    badges.appendChild(gradeBadge(t.grade));
    if (t.hidden) badges.appendChild(el('span', 'badge hidden', 'Hidden'));
    if (t.missable) badges.appendChild(el('span', 'badge missable', 'Missable?'));
    if (t.tracked !== null && t.tracked !== undefined) badges.appendChild(el('span', 'badge count', `×${t.tracked}`));
    badges.appendChild(el('span', 'badge kind', kindLabel(t)));
    row.appendChild(badges);

    row.addEventListener('click', () => selectTrophy(t.id));
    list.appendChild(row);
  }
  renderDetail();
}

function renderDetail() {
  const panel = $('detail');
  panel.innerHTML = '';
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    panel.appendChild(el('p', 'hint', 'Select a trophy to see its guide.'));
    return;
  }
  if (isMasked(t)) {
    panel.appendChild(el('h2', null, MASKED_NAME));
    const note = el('p', 'safe-box', 'Spoiler-free mode hides this story trophy until you earn it. Tick its checkbox in the checklist to reveal the guide.');
    panel.appendChild(note);
    return;
  }
  panel.appendChild(el('h2', null, t.name));
  panel.appendChild(el('p', 'desc', t.description));

  const badges = el('div', 'badges');
  badges.appendChild(gradeBadge(t.grade));
  if (t.hidden) badges.appendChild(el('span', 'badge hidden', 'Hidden on PlayStation'));
  if (t.missable) badges.appendChild(el('span', 'badge missable', 'Possibly missable'));
  badges.appendChild(el('span', 'badge kind', kindLabel(t)));
  panel.appendChild(badges);

  const meta = [];
  if (t.chapter) meta.push(`Chapter ${t.chapter}`);
  if (t.tracked !== null && t.tracked !== undefined) meta.push(`Tracked: ${t.tracked}`);
  meta.push(`Roadmap stage ${t.stage} of 5`);
  meta.push(earned.has(t.id) ? 'Earned' : 'Not yet earned');
  panel.appendChild(el('p', 'meta', meta.join(' · ')));

  panel.appendChild(el('p', 'guide', t.guide));
  if (t.missable) {
    panel.appendChild(el('p', 'warn-box', `Possibly missable: ${t.missableNote}`));
  } else {
    panel.appendChild(el('p', 'safe-box', 'Not missable — doable in free roam after the story.'));
  }

  const srcLabel = el('p', 'meta', 'Sources:');
  panel.appendChild(srcLabel);
  const srcList = el('ul', 'sources');
  for (const s of t.sources) {
    const li = document.createElement('li');
    li.appendChild(el('span', 'src-label', s.name + ':'));
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    li.appendChild(a);
    srcList.appendChild(li);
  }
  panel.appendChild(srcList);
}

function renderIndex() {
  const box = $('indexList');
  box.innerHTML = '';
  for (const t of trophies) {
    const masked = isMasked(t);
    const row = el('div', 'index-row' + (earned.has(t.id) ? ' earned' : ''));
    row.dataset.trophyId = String(t.id);

    const left = el('div');
    left.appendChild(el('div', 'index-name', masked ? MASKED_NAME : t.name));
    const meta = [];
    meta.push(t.grade);
    if (t.hidden) meta.push('hidden');
    if (t.missable) meta.push('possibly missable');
    if (t.tracked !== null && t.tracked !== undefined) meta.push(`×${t.tracked}`);
    meta.push(`stage ${t.stage}`);
    left.appendChild(el('div', 'index-meta', meta.join(' · ')));
    row.appendChild(left);

    row.appendChild(el('div', 'index-guide', masked ? MASKED_DESC : t.guide));

    const srcs = el('div', 'index-sources');
    if (masked) {
      srcs.textContent = '—';
    } else {
      for (const s of t.sources) {
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        a.target = '_blank';
        a.rel = 'noopener';
        srcs.appendChild(a);
      }
    }
    row.appendChild(srcs);

    row.addEventListener('click', () => jumpToTrophy(t.id));
    box.appendChild(row);
  }
}

function toggleEarned(id, on) {
  if (on) earned.add(id); else earned.delete(id);
  saveStored();
  renderProgress();
  renderChecklist();
  if (currentView === 'roadmap') renderRoadmap($('stageGrid'), trophies, earned, jumpToTrophy);
  if (currentView === 'index') renderIndex();
}

function selectTrophy(id) {
  selectedId = id;
  renderChecklist();
}

function jumpToTrophy(id) {
  selectedId = id;
  setView('checklist');
  const row = document.querySelector(`.trophy-row[data-trophy-id="${id}"]`);
  if (row) row.scrollIntoView({ block: 'nearest' });
}

function setView(view) {
  currentView = view;
  for (const tab of document.querySelectorAll('.tab')) {
    const active = tab.dataset.view === view;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  }
  $('view-checklist').hidden = view !== 'checklist';
  $('view-roadmap').hidden = view !== 'roadmap';
  $('view-index').hidden = view !== 'index';
  if (view === 'roadmap') renderRoadmap($('stageGrid'), trophies, earned, jumpToTrophy);
  if (view === 'index') renderIndex();
  if (view === 'checklist') renderChecklist();
  if (location.hash !== `#${view}` && view !== 'checklist') history.replaceState(null, '', `#${view}`);
  if (view === 'checklist') history.replaceState(null, '', location.pathname + location.search);
}

function exportProgress() {
  const payload = {
    game: GAME,
    earned: [...earned].sort((a, b) => a - b),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  $('ioStatus').textContent = `Exported ${earned.size} earned trophies.`;
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!data || data.game !== GAME || !Array.isArray(data.earned)) {
        throw new Error('bad shape');
      }
      const valid = new Set(trophies.map((t) => t.id));
      const kept = data.earned.filter((n) => Number.isInteger(n) && valid.has(n));
      earned = new Set(kept);
      saveStored();
      renderProgress();
      renderChecklist();
      if (currentView === 'roadmap') renderRoadmap($('stageGrid'), trophies, earned, jumpToTrophy);
      if (currentView === 'index') renderIndex();
      $('ioStatus').textContent = `Imported ${earned.size} earned trophies.`;
    } catch {
      $('ioStatus').textContent = 'Import failed: file must hold the expected game-and-earned shape.';
    }
  };
  reader.readAsText(file);
}

function bindControls() {
  for (const id of ['gradeFilter', 'kindFilter', 'searchBox', 'hideEarned', 'missableOnly', 'spoilerFree']) {
    $(id).addEventListener('input', () => { saveStored(); renderChecklist(); if (currentView === 'index') renderIndex(); });
    $(id).addEventListener('change', () => { saveStored(); renderChecklist(); if (currentView === 'index') renderIndex(); });
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => setView(tab.dataset.view));
  }
  $('exportBtn').addEventListener('click', exportProgress);
  $('importFile').addEventListener('change', (ev) => {
    const file = ev.target.files?.[0];
    if (file) importProgress(file);
    ev.target.value = '';
  });
  // Deep links: #roadmap and #index open those views directly, and a
  // hash change while the page is open switches views the same way.
  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#', '');
    if (hash === 'roadmap' || hash === 'index' || hash === 'checklist') setView(hash);
  });
}

async function init() {
  loadStored();
  const res = await fetch(DATA_URL);
  const data = await res.json();
  trophies = (Array.isArray(data) ? data : data.trophies).slice().sort((a, b) => a.id - b.id);
  bindControls();
  const hash = location.hash.replace('#', '');
  if (hash === 'roadmap' || hash === 'index') {
    renderProgress();
    renderChecklist();
    setView(hash);
  } else {
    renderProgress();
    renderChecklist();
  }
}

init();

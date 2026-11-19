import { readFilters, applyFilters } from './filters.js';
import { renderRoadmap } from './roadmap.js';

const EARNED_KEY = 'gta6-trophies-earned-v1';
const SPOILER_KEY = 'gta6-trophies-spoiler-v1';
const PLATINUM_ID = 1;
const MASKED_NAME = 'Hidden story trophy';
const MASKED_DESC = 'Complete the story to reveal this trophy.';

let trophies = [];
let earned = new Set();
let spoiler = false;
let selectedId = 15;

const $ = (id) => document.getElementById(id);

function loadStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) || '[]');
    if (Array.isArray(raw)) earned = new Set(raw.filter((n) => Number.isInteger(n)));
  } catch { earned = new Set(); }
  spoiler = localStorage.getItem(SPOILER_KEY) === '1';
}

function saveStored() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function isMasked(t) {
  return spoiler && t.kind === 'story' && !earned.has(t.id);
}

function kindLabel(t) {
  return t.kind === 'misc' ? 'Other' : t.kind;
}

function gradeTotals() {
  const out = {};
  for (const t of trophies) out[t.grade] = (out[t.grade] || 0) + 1;
  return out;
}

function renderProgress() {
  const total = trophies.length;
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade] += 1;
  const totals = gradeTotals();
  $('progress-line').textContent = `${earned.size} of ${total} earned`;
  $('grade-counts').textContent =
    `Platinum ${counts.platinum}/${totals.platinum || 0} · Gold ${counts.gold}/${totals.gold || 0} · ` +
    `Silver ${counts.silver}/${totals.silver || 0} · Bronze ${counts.bronze}/${totals.bronze || 0}`;
  $('bar-fill').style.width = total ? `${(earned.size / total) * 100}%` : '0%';
  const plat = trophies.find((t) => t.id === PLATINUM_ID);
  $('platinum-line').textContent = earned.size === total && total > 0
    ? 'Platinum earned — Leonida Legend!'
    : 'Platinum: Vice Got a Price! — earn the other 54.';
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = 'badge ' + cls;
  s.textContent = text;
  return s;
}

function renderRows() {
  const filters = readFilters(document);
  const shown = applyFilters(trophies, earned, filters);
  const list = $('rows');
  list.innerHTML = '';
  $('count-line').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies · 0 online — every trophy is single-player.`;
  $('empty').hidden = shown.length !== 0;
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'row' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    li.dataset.id = String(t.id);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleEarned(t.id, box.checked);
    });
    const body = document.createElement('div');
    body.className = 'body';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = isMasked(t) ? MASKED_NAME : t.name;
    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = isMasked(t) ? MASKED_DESC : t.description;
    body.append(name, desc);
    const badges = document.createElement('div');
    badges.className = 'badges';
    badges.append(badge(t.grade, t.grade));
    if (t.hidden) badges.append(badge('Hidden', 'hidden-badge'));
    if (t.missable) badges.append(badge('Possibly missable', 'missable'));
    if (t.count != null) badges.append(badge(`×${t.count.toLocaleString('en-US')}`, 'count'));
    badges.append(badge(kindLabel(t), 'kind'));
    li.append(box, body, badges);
    li.addEventListener('click', () => selectTrophy(t.id, false));
    list.appendChild(li);
  }
}

function renderDetail() {
  const panel = $('detail');
  panel.innerHTML = '';
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = 'Select a trophy to see its guide.';
    panel.appendChild(p);
    return;
  }
  if (isMasked(t)) {
    const h = document.createElement('h2');
    h.textContent = MASKED_NAME;
    const note = document.createElement('p');
    note.className = 'safe';
    note.textContent = 'Spoiler-free mode hides this story trophy until it is earned. Tick its checkbox to reveal it.';
    panel.append(h, note);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = t.description;
  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(badge(t.grade, t.grade));
  if (t.hidden) badges.append(badge('Hidden on PlayStation', 'hidden-badge'));
  if (t.missable) badges.append(badge('Possibly missable', 'missable'));
  badges.append(badge(kindLabel(t), 'kind'));
  const meta = document.createElement('p');
  meta.className = 'meta';
  const parts = [];
  if (t.chapter != null) parts.push(`Chapter ${t.chapter}`);
  if (t.count != null) parts.push(`Target: ${t.count.toLocaleString('en-US')}`);
  parts.push(`Roadmap stage ${t.stage} of 5`);
  parts.push(earned.has(t.id) ? 'Earned' : 'Not earned yet');
  meta.textContent = parts.join(' · ');
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  panel.append(h, desc, badges, meta, guide);
  if (t.missable && t.missableNote) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = t.missableNote;
    panel.appendChild(warn);
  } else {
    const safe = document.createElement('p');
    safe.className = 'safe';
    safe.textContent = 'Not missable — doable in free roam after the story.';
    panel.appendChild(safe);
  }
  const label = document.createElement('p');
  label.className = 'sources';
  const lab = document.createElement('span');
  lab.className = 'label';
  lab.textContent = 'Sources';
  label.appendChild(lab);
  const list = document.createElement('ul');
  list.className = 'sources';
  for (const s of t.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.rel = 'noopener';
    li.appendChild(a);
    list.appendChild(li);
  }
  panel.append(label, list);
}

function renderIndex() {
  const box = $('index-rows');
  box.innerHTML = '';
  for (const t of trophies) {
    const row = document.createElement('div');
    row.className = 'index-row' + (earned.has(t.id) ? ' earned' : '');
    row.dataset.id = String(t.id);
    const left = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'iname';
    name.textContent = isMasked(t) ? MASKED_NAME : t.name;
    const meta = document.createElement('div');
    meta.className = 'imeta';
    const parts = [t.grade];
    if (t.hidden) parts.push('hidden');
    if (t.missable) parts.push('possibly missable');
    if (t.count != null) parts.push(`×${t.count.toLocaleString('en-US')}`);
    parts.push(`stage ${t.stage}`);
    meta.textContent = parts.join(' · ');
    left.append(name, meta);
    const guide = document.createElement('p');
    guide.className = 'iguide';
    guide.textContent = isMasked(t) ? MASKED_DESC : t.guide;
    const srcs = document.createElement('div');
    srcs.className = 'isources';
    if (!isMasked(t)) {
      for (const s of t.sources) {
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        a.rel = 'noopener';
        srcs.appendChild(a);
      }
    }
    row.append(left, guide, srcs);
    row.addEventListener('click', () => selectTrophy(t.id, true));
    box.appendChild(row);
  }
}

function renderRoadmapView() {
  renderRoadmap($('stages'), trophies, earned, (id) => selectTrophy(id, true));
}

function renderAll() {
  renderProgress();
  renderRows();
  renderDetail();
  renderIndex();
  renderRoadmapView();
}

function toggleEarned(id, on) {
  if (on) earned.add(id); else earned.delete(id);
  saveStored();
  renderAll();
}

function selectTrophy(id, jumpToList) {
  selectedId = id;
  renderRows();
  renderDetail();
  if (jumpToList) {
    showView('checklist');
    const row = document.querySelector(`.row[data-id="${id}"]`);
    if (row) row.scrollIntoView({ block: 'center' });
  }
}

function showView(view) {
  for (const v of ['checklist', 'roadmap', 'index']) {
    $(`view-${v}`).hidden = v !== view;
    $(`tab-${v}`).setAttribute('aria-selected', v === view ? 'true' : 'false');
  }
  if (view === 'roadmap') renderRoadmapView();
  if (view === 'index') renderIndex();
  if (location.hash !== `#${view}`) history.replaceState(null, '', view === 'checklist' ? '#/' : `#${view}`);
}

function viewFromHash() {
  const h = location.hash.replace(/^#\/?/, '');
  return h === 'roadmap' || h === 'index' ? h : 'checklist';
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    earned: [...earned].sort((a, b) => a - b),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophies-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  $('status').textContent = `Exported ${earned.size} earned trophies.`;
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || data.game !== 'Grand Theft Auto VI' || !Array.isArray(data.earned)) {
      throw new Error('shape');
    }
    const valid = new Set(trophies.map((t) => t.id));
    const next = new Set(data.earned.filter((n) => Number.isInteger(n) && valid.has(n)));
    earned = next;
    saveStored();
    renderAll();
    $('status').textContent = `Imported ${earned.size} earned trophies.`;
  } catch {
    $('status').textContent = 'Import failed: the file must hold the expected game-and-earned shape.';
  }
}

async function init() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  trophies = data.trophies.slice().sort((a, b) => a.id - b.id);
  loadStored();
  $('spoiler').checked = spoiler;

  for (const id of ['grade', 'kind', 'search', 'hide-earned', 'missable-only']) {
    $(id).addEventListener('input', renderRows);
    $(id).addEventListener('change', renderRows);
  }
  $('spoiler').addEventListener('change', () => {
    spoiler = $('spoiler').checked;
    saveStored();
    renderAll();
  });
  for (const tab of document.querySelectorAll('.tabs button')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }
  window.addEventListener('hashchange', () => showView(viewFromHash()));
  $('export').addEventListener('click', exportProgress);
  $('import').addEventListener('change', (ev) => {
    if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
    ev.target.value = '';
  });

  renderAll();
  showView(viewFromHash());
}

init();

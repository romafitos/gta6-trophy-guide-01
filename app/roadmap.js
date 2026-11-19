// The five-stage platinum roadmap for the GTA VI trophy guide.
// Stages hold their titles and blurbs; renderRoadmap builds one card per
// stage into a container, with clickable trophy chips. The caller supplies
// the trophy list, the earned set, and a callback for chip clicks.

export const STAGES = [
  {
    n: 1,
    title: 'Stage 1 — The Story',
    blurb: 'Play the story in chapter order. Chapter trophies pop at the start of the next chapter, after its first mission or missions.',
    wide: false,
  },
  {
    n: 2,
    title: 'Stage 2 — Strangers & Side Strands',
    blurb: 'Stranger and side-character strands. All of them stay open after the story ends.',
    wide: false,
  },
  {
    n: 3,
    title: 'Stage 3 — Collectibles & Activities',
    blurb: 'Collectibles and activities alongside the story. Warning: the one possibly-missable trophy lives here — do the Chapter 1 balcony meditation early.',
    wide: true,
  },
  {
    n: 4,
    title: 'Stage 4 — Cleanup & 100%',
    blurb: 'Mop up the long grinds and finish the 100% completion checklist.',
    wide: false,
  },
  {
    n: 5,
    title: 'Stage 5 — Platinum',
    blurb: 'The Platinum itself. No online or downloadable-content trophies are needed.',
    wide: false,
  },
];

export function renderRoadmap(container, trophies, earned, onPick) {
  container.innerHTML = '';
  const doc = container.ownerDocument;
  for (const stage of STAGES) {
    const card = doc.createElement('article');
    card.className = 'stage' + (stage.wide ? ' wide' : '');
    card.dataset.stage = String(stage.n);
    const members = trophies.filter((t) => t.stage === stage.n);
    const done = members.filter((t) => earned.has(t.id)).length;
    const head = doc.createElement('h3');
    head.textContent = stage.title + ' ';
    const count = doc.createElement('span');
    count.className = 'count';
    count.textContent = `(${done}/${members.length})`;
    head.appendChild(count);
    const blurb = doc.createElement('p');
    blurb.textContent = stage.blurb;
    const chips = doc.createElement('div');
    chips.className = 'chips';
    for (const t of members) {
      const chip = doc.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (earned.has(t.id) ? ' earned' : '');
      chip.dataset.id = String(t.id);
      chip.title = `${t.name} — ${t.grade}${t.missable ? ' (possibly missable)' : ''}`;
      const grade = doc.createElement('span');
      grade.className = 'g-' + t.grade;
      grade.textContent = t.grade;
      chip.append(t.name + ' ', grade);
      if (t.missable) {
        const flag = doc.createElement('span');
        flag.className = 'flag';
        flag.textContent = ' ⚠ missable';
        chip.appendChild(flag);
      }
      chip.addEventListener('click', () => onPick(t.id));
      chips.appendChild(chip);
    }
    card.append(head, blurb, chips);
    container.appendChild(card);
  }
}

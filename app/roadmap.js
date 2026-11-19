// The five-stage platinum roadmap: stage order, titles and short
// blurbs, plus a renderer that builds one card per stage. Each card
// shows its earned count and its trophies as clickable chips; clicking
// a chip hands back to the checklist and opens that trophy's guide.
// Stage contents: 1 story in chapter order (12), 2 stranger and
// side-character strands (7), 3 collectibles and activities (33),
// 4 cleanup and 100% completion (2), 5 the Platinum itself (1).

export const STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — The story',
    blurb: 'Play the story in chapter order. Chapter trophies pop at the start of the next chapter, after its first mission or two.',
    wide: false,
  },
  {
    stage: 2,
    title: 'Stage 2 — Strangers & side characters',
    blurb: 'Seven stranger and side-character strands. All open after the story, so none of them can be missed.',
    wide: false,
  },
  {
    stage: 3,
    title: 'Stage 3 — Collectibles & activities',
    blurb: 'Do these alongside the story. The one possibly-missable trophy lives here: do the Chapter 1 balcony meditation early, just in case.',
    wide: true,
  },
  {
    stage: 4,
    title: 'Stage 4 — Cleanup & 100%',
    blurb: 'Mop up the long grinds and the 100% checklist once the story is done.',
    wide: false,
  },
  {
    stage: 5,
    title: 'Stage 5 — Platinum',
    blurb: 'Earn the other 54. No online or downloadable-content trophies are needed.',
    wide: false,
  },
];

const GRADE_LABEL = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

// How many trophies each stage holds: 12 / 7 / 33 / 2 / 1.
export function stageCounts(trophies) {
  return STAGES.map((stage) => trophies.filter((t) => t.stage === stage.stage).length);
}

export function renderRoadmap(container, trophies, earned, onChipClick) {
  container.innerHTML = '';
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => earned.has(t.id)).length;

    const card = document.createElement('div');
    card.className = 'stage-card' + (stage.wide ? ' wide' : '');
    card.dataset.stage = String(stage.stage);

    const heading = document.createElement('h3');
    heading.textContent = stage.title + ' ';
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = `(${done}/${members.length})`;
    heading.appendChild(count);
    card.appendChild(heading);

    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    card.appendChild(blurb);

    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const t of members) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (earned.has(t.id) ? ' earned' : '');
      chip.dataset.trophyId = String(t.id);
      const grade = document.createElement('span');
      grade.className = 'g-' + t.grade;
      grade.textContent = GRADE_LABEL[t.grade];
      chip.appendChild(grade);
      chip.appendChild(document.createTextNode(' ' + t.name + (t.missable ? ' ⚠' : '')));
      chip.addEventListener('click', () => onChipClick(t.id));
      chips.appendChild(chip);
    }
    card.appendChild(chips);
    container.appendChild(card);
  }
}

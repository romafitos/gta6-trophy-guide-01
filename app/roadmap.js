// The five platinum-roadmap stages, in order, with their short blurbs.
// Stage membership lives in the trophy data itself (each trophy carries
// its stage number); this module only holds the stage titles and the
// one-line orientation for each, plus the renderer that turns a stage
// and its trophies into a card.

// Stage 1 is the story in chapter order (12 trophies). Chapter trophies
// pop at the start of the next chapter, after its first mission or
// missions — not on the last cutscene of the chapter they name. The
// final mission's chapter is unresolved between the guides, so stage 1
// claims no chapter for it; the footer says so too.
// Stage 2 is the stranger and side-character strands (7 trophies), all
// open after the story. Stage 3 is collectibles and activities done
// alongside the story (33 trophies) and holds the one possibly-missable
// trophy, so its blurb carries the early-meditation warning. Stage 4 is
// cleanup and 100% completion (2 trophies). Stage 5 is the Platinum
// itself (1 trophy): no online or downloadable-content trophies needed.
export const STAGES = [
  {
    number: 1,
    title: 'Stage 1 — The story',
    blurb: 'Play the five chapters in order; chapter trophies pop at the start of the next chapter.',
  },
  {
    number: 2,
    title: 'Stage 2 — Strangers & side characters',
    blurb: 'Finish the stranger strands and side-character finales, all open after the story.',
  },
  {
    number: 3,
    title: 'Stage 3 — Collectibles & activities',
    blurb: 'Work through these alongside the story. Do the Chapter 1 balcony meditation early — it may be missable.',
  },
  {
    number: 4,
    title: 'Stage 4 — Cleanup & 100%',
    blurb: 'Mop up the last purchases and registrations, then the 100% checklist.',
  },
  {
    number: 5,
    title: 'Stage 5 — Platinum',
    blurb: 'Vice Got a Price! pops with the 54th other trophy. No online trophies needed.',
  },
];

// Build one stage card: title with its earned count, blurb, and the
// stage's trophies as clickable chips. Each chip shows the trophy name,
// its grade in the grade colour, and a missable flag where it applies;
// earned chips are struck through and dimmed. Clicking a chip calls
// onSelect with the trophy id; the main script jumps back to the
// checklist and opens that trophy's guide. Stage 3 spans the full
// width of the two-column grid so all five stages fit in one shot.
export function renderStage(stage, stageTrophies, earned, onSelect) {
  const card = document.createElement('article');
  card.className = 'stage-card' + (stage.number === 3 ? ' wide' : '');
  const done = stageTrophies.filter((t) => earned.has(t.id)).length;
  const heading = document.createElement('h3');
  heading.textContent = stage.title + ' ';
  const count = document.createElement('span');
  count.className = 'stage-count';
  count.textContent = `(${done}/${stageTrophies.length})`;
  heading.appendChild(count);
  card.appendChild(heading);
  const blurb = document.createElement('p');
  blurb.className = 'stage-blurb';
  blurb.textContent = stage.blurb;
  card.appendChild(blurb);
  const chips = document.createElement('div');
  chips.className = 'stage-chips';
  for (const trophy of stageTrophies) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (earned.has(trophy.id) ? ' earned' : '');
    chip.textContent = trophy.name + ' ';
    const grade = document.createElement('span');
    grade.className = `chip-grade-${trophy.grade}`;
    grade.textContent = trophy.grade;
    chip.appendChild(grade);
    if (trophy.missable) {
      const flag = document.createElement('span');
      flag.className = 'chip-missable';
      flag.textContent = ' · missable?';
      chip.appendChild(flag);
    }
    chip.addEventListener('click', () => onSelect(trophy.id));
    chips.appendChild(chip);
  }
  card.appendChild(chips);
  return card;
}

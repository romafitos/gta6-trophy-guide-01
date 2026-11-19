# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/romafitos/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/romafitos/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An interactive, fully offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 Platinum, 2 Gold, 6 Silver and 46 Bronze, of which 28 are hidden on PlayStation and none are online. Every trophy gets a guide written in the builder's own words, with its three sources named beside it.

## What it does

- **Checklist tracker** — tick trophies off as you earn them; progress, per-grade counts and a progress bar update live, and everything is saved in your browser's local storage.
- **Cited guides for all 55** — each guide names PowerPyx, GTABase and OutputLag as its sources, with links. Five trophies have no confirmed unlock method published yet, and their guides say so honestly instead of inventing steps.
- **Five-stage Platinum roadmap** — story, stranger strands, collectibles and activities, cleanup and 100%, then the Platinum, with the one possibly-missable trophy flagged everywhere it appears.
- **Missable flags** — exactly one trophy (Positive Mental Attitude, the Chapter 1 balcony meditation) is flagged as possibly missable, with its warning shown in the guide panel.
- **Guide Index** — all 55 guides on one page, in checklist order, each with its three sources.
- **Filters** — by grade, by kind (story, missable, collectibles, activities, online, other), by text search, hide-earned and missable-only, all composing together.
- **Spoiler-free mode** — hides the name, description and guide of unearned story trophies until they are earned; grades stay visible.
- **Export and import** — download your earned list as JSON and restore it later; the round-trip is exact.
- **Fully offline** — no network requests, no web fonts, no images. The only thing the app fetches is its own trophy data file. First load is about 25 KB of JavaScript and CSS.

## How the data was built

Official trophy names, descriptions and grades come from the competition kit's official list, byte for byte. The guides are the builder's own words, written from three sources opened on 19 November 2026 (PowerPyx's trophy guide and roadmap, GTABase's achievements and trophies list, OutputLag's trophy list). Chapter-trophy pop timing follows the sources: chapter trophies pop at the start of the next chapter, after its first mission or missions. The final mission's chapter is unresolved between the guides, so none is claimed. The exploration trophy claims no area count, because no opened source states one.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. `node serve.ts --port 9000` serves it on another port.

The entry point is `main.ts` (Node 22, standard library only): it copies `app/` and `screenshots/` into the output directory and writes `dossier.json` there. Outside the grader, `MAKEFUN_OUTPUT_DIR` names the output directory:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Bounty

Entered on [make.fun](https://make.fun/?ref=qeky27wz&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) — build the best GTA 6 trophy guide, $250 in USDC, top 50 paid. Bounty page: https://make.fun/bounty/gta6-trophy-guide-01

---

<sub>Entered on [make.fun](https://make.fun/?ref=qeky27wz&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

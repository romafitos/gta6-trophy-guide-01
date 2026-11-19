# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/romafitos/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/romafitos/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline, single-page trophy guide and tracker for Grand Theft Auto VI on PlayStation 5: all 55 trophies (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden on PlayStation, 0 online), each with a guide written in my own words and three named sources — PowerPyx, GTABase and OutputLag, all opened on 19 November 2026.

## What it does

- **Checklist tracker** — tick trophies off, watch the progress bar and per-grade counts move, and pick up where you left off: progress is saved in the browser's local storage. Export it to JSON and import it back on another machine.
- **Cited guides for all 55** — every trophy carries a 2–5 sentence guide plus links to the three sources it was written from. Five trophies have no confirmed unlock method published yet, and their guides say so honestly instead of inventing steps.
- **Five-stage Platinum roadmap** — story in chapter order, stranger and side-character strands, collectibles and activities alongside the story, cleanup and 100% completion, then the Platinum. Click any trophy chip to jump to its guide.
- **Missable flags** — the one possibly-missable trophy (Positive Mental Attitude, the Chapter 1 balcony meditation) is flagged in the list, on the roadmap and in its guide; everything else is confirmed doable in free roam after the story.
- **Guide Index** — all 55 guides on one page, in checklist order, each with its three sources.
- **Filters** — by grade, by kind (story, missable, collectibles, activities, online, other), by text search across names, descriptions and guides, hide-earned, and missable-only.
- **Spoiler-free mode** — hides the name, description and guide of unearned story trophies until they are earned; grades stay visible, and PlayStation-hidden trophies always carry a hidden badge.
- **Fully offline** — no build step, no web fonts, no images, no network requests of any kind. The only thing the page fetches is its own trophy data file, served from the same folder.

## How the data was built

Official names, descriptions and grades come from the bounty kit's trophy list, byte for byte. Guides are paraphrased from the three opened sources above, never copied. Chapter trophies pop at the start of the next chapter, per the sources. The final mission's chapter is unresolved between the guides, so none is claimed. The guide for the exploration trophy claims no area count, because no opened source states one — it tells you to unfog the whole map.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Node 22, standard library only, no dependencies to install. `main.ts` builds the entry dossier from `app/` and `screenshots/`.

## Screenshots

Four 1280×800 renders of the guide itself live in `screenshots/` (see `shots.json`): the checklist cover, the five-stage roadmap, the story filter with spoiler-free mode on, and the full guide index.

## Bounty

Built for the make.fun bounty [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01) — $250 in USDC, top 50 paid.

---

<sub>Entered on [make.fun](https://make.fun/?ref=qeky27wz&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

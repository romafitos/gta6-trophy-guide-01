# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/romafitos/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/romafitos/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Trophy Guide** — an offline, open-source tracker and guide for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the make.fun "Build the best GTA 6 trophy guide" bounty ($250 USDC, Top-50 paid). The list is the official one: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden on PlayStation; 0 online. Every trophy has a guide written in the builder's own words, with its sources cited beside it (PowerPyx, GTABase, OutputLag).

## Features

- Checklist tracker with localStorage progress, per-grade counts and a Platinum progress bar
- Export and import of earned progress as JSON, with a round-trip that restores exactly what was saved
- Cited guides for all 55 trophies — 3 named sources each; the 5 trophies with no confirmed unlock method yet say so honestly instead of inventing steps
- Five-stage Platinum roadmap (12 / 7 / 33 / 2 / 1 trophies per stage) in chapter order, with the one possibly-missable trophy flagged everywhere
- Missable flags, kind and grade filters, text search, hide-earned and missable-only toggles
- Guide Index view with all 55 guides on one page
- Spoiler-free mode: unearned story trophies stay masked until earned; grades stay visible
- Fully offline — system fonts only, no images, no external requests

## How the data was built

Official names, descriptions and grades come from the kit's official trophy list, byte for byte. Guides are written in the builder's own words from three sources opened on 19 November 2026 (PowerPyx trophy guide & roadmap, GTABase achievements & trophies list, OutputLag trophy list). Chapter trophies pop at the start of the next chapter, per the sources. The final mission's chapter is unresolved between the guides, so none is claimed. Five trophies (44, 45, 49, 50, 51) have no confirmed unlock method published yet; their guides say so and mark believed methods as unconfirmed belief.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome.

## Screenshots

Four screenshots at 1280×800 live in `screenshots/`: the checklist cover, the Platinum roadmap, the story filter with spoiler-free mode, and the Guide Index.

## Bounty

https://make.fun/bounty/gta6-trophy-guide-01

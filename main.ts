// GTA 6 trophy guide entry point (Node 22+, standard library only).
//
// The guide itself is plain static files in app/ (index.html, CSS, ES
// modules, trophies.json) plus four screenshots in screenshots/. This
// program hands the entry in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json
// there with the vendored make.fun frontend library. Run it twice and
// the output is byte-identical, because every step below is a plain
// copy plus a deterministic dossier build.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The guide folder must exist beside this file, or there is nothing to hand in.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing; refusing to build an empty entry');
}

// Copy the guide and its screenshots into the output directory.
mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Build the dossier with the scorer's own caps: at most 163,840 bytes
// of text, at most 4 screenshots of at most 262,144 bytes each, at
// most 993 app files totalling at most 48 MiB. An empty dossier means
// the build produced nothing worth handing in, so fail loudly.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
if (!dossier || dossier.length === 0) {
  throw new Error('dossier came out empty; refusing to hand in an empty entry');
}
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`wrote ${join(outDir, 'dossier.json')} (${statSync(join(outDir, 'dossier.json')).size} bytes)`);

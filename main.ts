// GTA VI trophy guide — entry point (Node 22, standard library only).
// The guide itself is plain static files in app/ (HTML, CSS, ES modules,
// one JSON data file); the screenshots in screenshots/ show it running.
// This program hands the entry in: it copies app/ and screenshots/ next
// to this file into the output directory and writes dossier.json there
// with the vendored make.fun library, which is what the judge reads.
// Outside the grader, MAKEFUN_OUTPUT_DIR names the output directory;
// inside the grader the fixed /output path is used. Run it with:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice and the output is byte-identical.

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's caps for this competition: the text budget shapes the
// dossier bytes; the screenshot and app caps refuse an entry the scorer
// would refuse (more than 4 screenshots, one over 256 KiB, more than
// 993 files under app/, or app/ over 48 MiB in total). The dossier the
// library builds is a pure function of the copied files, so running
// this program twice over the same tree writes byte-identical output.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

if (!dossier || dossier.length === 0) {
  throw new Error('dossier came out empty — refusing to hand in an empty entry');
}
const dossierPath = join(outDir, 'dossier.json');
writeFileSync(dossierPath, dossier);
const written = readFileSync(dossierPath, 'utf8');
if (written.length === 0) throw new Error('dossier.json written empty');
console.log(`dossier written: ${dossierPath} (${written.length} bytes)`);

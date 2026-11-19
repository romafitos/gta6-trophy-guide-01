// Entry point for the GTA VI trophy guide (Node 22, standard library only).
// It stages the guide folder and the screenshots beside this file into the
// output directory, then writes the dossier the judge reads, using the
// vendored make.fun library. The output directory is MAKEFUN_OUTPUT_DIR
// outside the grader, or /output inside it. Run twice and the output is
// byte-identical; an empty dossier fails loudly instead of handing in
// nothing.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const GUIDE_DIR = join(here, 'app');
const SHOTS_DIR = join(here, 'screenshots');

mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, 'app'), { recursive: true });
cpSync(GUIDE_DIR, join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(SHOTS_DIR)) cpSync(SHOTS_DIR, join(outDir, 'screenshots'), { recursive: true });

// Caps from the starter's gate: text at most 163,840 bytes, at most 4
// screenshots of at most 262,144 bytes each, at most 993 app files
// totalling at most 48 MiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

if (!dossier || dossier.length === 0) {
  throw new Error('refusing to hand in an empty dossier');
}

const dossierPath = join(outDir, 'dossier.json');
writeFileSync(dossierPath, dossier);
const written = readFileSync(dossierPath);
if (written.length === 0) throw new Error('dossier.json came out empty');
const parsed = JSON.parse(written.toString('utf8'));
if (parsed.schema !== 'makefun/dossier/v1') throw new Error('dossier.json has an unexpected schema');
console.log(`dossier.json written: ${written.length} bytes`);

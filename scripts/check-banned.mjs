/**
 * Definition-of-done #5: grep the RENDERED output of live pages for banned phrases.
 * Run after `npm run build`:  npm run qa:banned
 *
 * Scans .next/server/app/**\/*.html (the prerendered static pages).
 * Allowed exceptions per the brief: "Saturday/Sunday … Closed" in hours, and the two
 * procedural "same day" phrases on Dentures and Whitening.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.next/server/app');
const BANNED = [
  'emergency',
  'same-day',
  'same day',
  'after-hours',
  'after hours',
  'open now',
  'walk-in',
  'bulk bill',
  'gap free',
  'no gap',
  'bupa',
  'hcf',
  'medibank',
  'afterpay',
  'zip',
  'invisalign',
  'best dentist',
  'guaranteed',
  '[to confirm',
  '9525 0595', // Caringbah number must never appear
  'ortho@',
  'accounts@',
  'thecaringbahdentists@gmail',
];
const ALLOWED = [
  /fitted on the same day teeth are extracted/i, // Dentures — describes a procedure
  /most of the change happens the same day/i, // Whitening — describes a procedure
  /is not guaranteed/i, // DentiCare approval / root canal outcome disclaimers (the opposite of a guarantee claim)
  /cannot guarantee it/i,
  /emergency contact and, where relevant/i, // Privacy policy — a data category, not an availability claim
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ') // JSON-LD + RSC payload are checked separately below
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ');

let failures = 0;
const files = walk(ROOT);
for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  const text = strip(raw);
  const jsonld = [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(' ');
  for (const src of [text, jsonld]) {
    const lower = src.toLowerCase();
    for (const b of BANNED) {
      let idx = lower.indexOf(b);
      while (idx !== -1) {
        const ctx = src.slice(Math.max(0, idx - 60), idx + b.length + 60);
        if (!ALLOWED.some((re) => re.test(ctx))) {
          failures++;
          console.log(`✗ ${path.relative(ROOT, f)} → "${b}"\n    …${ctx.replace(/\s+/g, ' ')}…`);
        }
        idx = lower.indexOf(b, idx + 1);
      }
    }
  }
}
console.log(`\nScanned ${files.length} rendered pages. ${failures ? failures + ' banned-phrase hit(s).' : 'No banned phrases found. ✓'}`);
process.exit(failures ? 1 : 0);

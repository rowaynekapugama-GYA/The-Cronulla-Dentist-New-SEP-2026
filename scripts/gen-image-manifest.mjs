/**
 * Writes lib/image-manifest.json — every file under public/images/ mapped to a
 * short hash of its contents.
 *
 * lib/img.ts turns that hash into `?v=…` on each image URL so that replacing a
 * photo at an unchanged filename still moves the URL, and Vercel's image cache
 * (which is keyed on the URL, not the bytes) is forced to re-fetch. See the
 * comment in lib/img.ts for the full explanation.
 *
 * Runs automatically via the `prebuild` / `prebuild:static` npm hooks, so the
 * manifest can never drift from the files on disk. It is a build artefact but
 * IS committed, so a Vercel build that skips the hook still has a valid one.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'public', 'images');
const out = path.join(process.cwd(), 'lib', 'image-manifest.json');

const manifest = {};
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(jpe?g|png|webp|avif|svg|gif)$/i.test(entry.name)) {
      const rel = '/images/' + path.relative(root, full).split(path.sep).join('/');
      manifest[rel] = createHash('sha1').update(fs.readFileSync(full)).digest('hex').slice(0, 8);
    }
  }
})(root);

// Sorted so the file has a stable diff when only one image changes.
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(out, JSON.stringify(sorted, null, 2) + '\n');
console.log(`✓ lib/image-manifest.json — ${Object.keys(sorted).length} images hashed`);

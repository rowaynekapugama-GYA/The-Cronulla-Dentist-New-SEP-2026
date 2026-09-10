import fs from 'node:fs';
import path from 'node:path';

/**
 * The three health-fund / payment marks shown on the home page.
 *
 * Each card renders the supplied logo file when one is present in
 * `public/images/providers/`, and falls back to the styled wordmark when it is
 * not — so the layout is correct either way and dropping the files in needs no
 * code change. Accepted extensions, in order of preference: svg, png, webp, jpg.
 *
 * Only use official logo files supplied by (or licensed from) DentiCare, nib
 * and HICAPS — see IMAGES-NEEDED.md §6.
 */
export interface ProviderCard {
  name: string;
  tagline: string;
  /** Resolved public path, or undefined when no file has been supplied yet. */
  logo?: string;
  alt: string;
}

const CARDS: { name: string; tagline: string; file: string }[] = [
  { name: 'DentiCare', tagline: 'Payment plans', file: 'denticare' },
  { name: 'nib', tagline: 'Preferred provider', file: 'nib' },
  { name: 'HICAPS', tagline: 'Claim on the spot', file: 'hicaps' },
];

const EXTS = ['svg', 'png', 'webp', 'jpg'];

function findLogo(base: string): string | undefined {
  for (const ext of EXTS) {
    const rel = `/images/providers/${base}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), 'public', rel))) return rel;
  }
  return undefined;
}

export function providerCards(): ProviderCard[] {
  return CARDS.map((c) => ({
    name: c.name,
    tagline: c.tagline,
    logo: findLogo(c.file),
    alt: `${c.name} — ${c.tagline}`,
  }));
}

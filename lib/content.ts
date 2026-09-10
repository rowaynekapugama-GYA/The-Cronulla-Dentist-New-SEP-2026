import fs from 'node:fs';
import path from 'node:path';
import type { Page, ServicePage, PageMeta } from '@/content/types';
import { SITE_CONFIG, featureOn } from '@/site.config';

const PAGES_DIR = path.join(process.cwd(), 'content', 'pages');

let cache: Page[] | null = null;

/** All 29 pages from /content/pages (built once per build). */
export function allPages(): Page[] {
  if (cache) return cache;
  cache = fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(PAGES_DIR, f), 'utf8')) as Page);
  return cache;
}

export function getPage<T extends Page = Page>(slug: string): T {
  const p = allPages().find((p) => p.meta.slug === slug);
  if (!p) throw new Error(`Content page not found: ${slug}`);
  return p as T;
}

/** A page is live when it has no gate, or its gate flag is ON. */
export function isLive(meta: PageMeta): boolean {
  return !meta.gate || featureOn(meta.gate);
}

/** Every live page (used by sitemap + nav). */
export function livePages(): Page[] {
  return allPages().filter((p) => isLive(p.meta));
}

export function servicePages(): ServicePage[] {
  return allPages().filter((p): p is ServicePage => p.kind === 'service');
}

/** Service pages that should appear in nav / hub (live, not utility pages). */
export function navServicePages(): ServicePage[] {
  const utility = new Set(['finances', 'payment-plans']);
  return servicePages().filter((p) => isLive(p.meta) && !utility.has(p.meta.slug));
}

/** Meta title/description with gated variants applied. */
export function resolvedMeta(meta: PageMeta): { title: string; description: string } {
  const gatedZip = meta.slug === 'payment-plans' && !featureOn('zipAfterpay');
  const gatedEmergency = meta.slug === 'services' && !featureOn('emergency');
  const gatedNames = meta.slug === 'about' && !SITE_CONFIG.teamNamesConfirmed;
  const useGated = gatedZip || gatedEmergency;
  let description = useGated && meta.metaDescriptionGated ? meta.metaDescriptionGated : meta.metaDescription;
  if (gatedNames) {
    // Full names stay out of metadata until registrations are confirmed (brief §1).
    description = `Meet the team at ${SITE_CONFIG.name}, ${SITE_CONFIG.address.street}. Gentle, unhurried care for the Sutherland Shire.`;
  }
  return {
    title: useGated && meta.metaTitleGated ? meta.metaTitleGated : meta.metaTitle,
    description,
  };
}

export function canonical(route: string): string {
  return `${SITE_CONFIG.domain}${route}`;
}

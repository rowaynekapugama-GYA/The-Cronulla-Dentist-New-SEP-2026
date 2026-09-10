import type { Metadata } from 'next';
import type { PageMeta } from '@/content/types';
import { resolvedMeta, canonical } from '@/lib/content';
import { SITE_CONFIG } from '@/site.config';

/** Share card generated from the client's logo — see scripts/make-brand-assets.py. */
export const OG_IMAGE = {
  url: '/images/og-default.jpg',
  width: 1200,
  height: 630,
  alt: `${SITE_CONFIG.name}, ${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.suburb}`,
};

/**
 * Exact meta title/description from website-copy.md + canonical + OG.
 * Note: Next.js replaces the whole `openGraph` object rather than merging it
 * with the layout's, so the image has to be repeated here on every page.
 */
export function pageMetadata(meta: PageMeta, extra: Partial<Metadata> = {}): Metadata {
  const { title, description } = resolvedMeta(meta);
  return {
    title,
    description,
    alternates: { canonical: canonical(meta.route) },
    openGraph: {
      title,
      description,
      url: canonical(meta.route),
      siteName: SITE_CONFIG.name,
      locale: 'en_AU',
      type: 'website',
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
    ...(meta.noindex ? { robots: { index: false, follow: true } } : {}),
    ...extra,
  };
}

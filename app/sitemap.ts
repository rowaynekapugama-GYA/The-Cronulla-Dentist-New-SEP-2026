import type { MetadataRoute } from 'next';
import { livePages, canonical } from '@/lib/content';
import { isOpen } from '@/site.config';

/** Live pages only — gated pages are excluded while their flag is OFF. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = livePages()
    .filter((p) => !p.meta.noindex)
    .map((p) => ({
      url: canonical(p.meta.route),
      lastModified: now,
      changeFrequency: (p.meta.route === '/' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: p.meta.route === '/' ? 1 : p.kind === 'service' ? 0.8 : 0.6,
    }));
  if (!isOpen()) pages.push({ url: canonical('/register/'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 });
  return pages;
}

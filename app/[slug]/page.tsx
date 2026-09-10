import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { allPages, isLive } from '@/lib/content';
import { pageMetadata } from '@/lib/meta';
import { ServiceTemplate } from '@/components/ServiceTemplate';
import { ProseTemplate } from '@/components/ProseTemplate';
import type { ProsePage, ServicePage } from '@/content/types';

export const dynamicParams = false;

const HANDLED = new Set(['service', 'prose']);

/** Static params for every LIVE service/prose page. Gated pages (flag OFF) are not generated → 404. */
export function generateStaticParams() {
  return allPages()
    .filter((p) => HANDLED.has(p.kind) && isLive(p.meta))
    .map((p) => ({ slug: p.meta.slug }));
}

function find(slug: string) {
  const p = allPages().find((p) => p.meta.slug === slug && HANDLED.has(p.kind));
  if (!p || !isLive(p.meta)) return null;
  return p as ServicePage | ProsePage;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = find(params.slug);
  if (!p) return {};
  return pageMetadata(p.meta);
}

export default function Page({ params }: { params: { slug: string } }) {
  const p = find(params.slug);
  if (!p) notFound();
  return p.kind === 'service' ? <ServiceTemplate page={p} /> : <ProseTemplate page={p} />;
}

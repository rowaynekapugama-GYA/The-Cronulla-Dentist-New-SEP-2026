import Image from '@/components/Img';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/meta';
import type { ServicesHubPage, Card } from '@/content/types';
import { featureOn } from '@/site.config';
import { allServiceLinks } from '@/lib/nav';
import { Inline } from '@/components/Inline';
import { CtaButtons, CtaBand } from '@/components/Cta';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';
import { I, type IconName } from '@/components/Icons';

const page = getPage<ServicesHubPage>('services');
export const metadata: Metadata = pageMetadata(page.meta);

const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services/' },
];

function resolve(c: Card): Card | null {
  if (!c.gate || featureOn(c.gate)) return c;
  return c.fallback ?? null;
}

const CAT_ICONS: Record<string, IconName> = {
  'General Dentistry': 'tooth',
  'Children’s Dentistry': 'child',
  'Cosmetic Dentistry': 'star',
  'Restorative Dentistry': 'implant',
};

export default function Services() {
  // Copy's service list → link each item to its live page where one exists.
  const live = allServiceLinks();
  const linkFor = (label: string) => {
    const norm = (s: string) => s.toLowerCase().replace(/[’']/g, '').replace(/&/g, 'and').replace(/dental |white |teeth /g, '').trim();
    return live.find((l) => norm(l.label) === norm(label) || norm(l.label).includes(norm(label)) || norm(label).includes(norm(l.label)))?.href;
  };
  const blurbs = page.blurbs.map(resolve).filter((c): c is Card => Boolean(c));
  const featured = page.featured.map(resolve).filter((c): c is Card => Boolean(c));

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {/* BLOCK 1: H1 + service list */}
      <header className="hero-band">
        <div className="wrap">
          <Breadcrumb items={crumbs} />
          <h1 className="h-display">{spanLast(page.h1)}</h1>
          <p className="hook" style={{ marginTop: '1rem' }}>
            <Inline text={page.intro} />
          </p>
          <ul className="check-list">
            {page.serviceList.map((s) => {
              const href = linkFor(s);
              return (
                <li key={s}>
                  <I name="tick" />
                  {href ? <Link href={href}>{s}</Link> : <span>{s}</span>}
                </li>
              );
            })}
          </ul>
          <p className="hook" style={{ marginBottom: '1.6rem' }}>
            <Inline text={page.closingLine} />
          </p>
          <CtaButtons />
        </div>
      </header>

      {/* BLOCK 2: three featured image tiles */}
      <section className="section section-white" style={{ paddingTop: '3rem' }} aria-label="Featured services">
        <div className="grid grid-3">
          {featured.map((f) => (
            <Link key={f.title} href={f.href || '/services/'} className="photo photo-tile reveal">
              <Image src={`/images/tiles/${(f.href || '').replace(/\//g, '')}.jpg`} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
              <div className="photo-caption">
                <span className="photo-caption-label">{f.title}</span>
                <span className="photo-caption-sub">Read more</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BLOCK 3: short blurbs */}
      <section className="section section-sand" aria-label="Treatments">
        <div className="grid grid-3">
          {blurbs.map((b) => (
            <Link key={b.title} href={b.href || '/services/'} className="card reveal">
              <h2>{b.title}</h2>
              <p>
                <Inline text={b.text} />
              </p>
              <span className="text-link">
                Read more <I name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* BLOCK 4: four category cards */}
      <section className="section section-white" aria-label="Service categories">
        <div className="grid grid-4">
          {page.categoryCards.map((c) => (
            <Link key={c.title} href={c.href || '/services/'} className="card reveal">
              <div className="card-icon">
                <I name={CAT_ICONS[c.title] || 'tooth'} />
              </div>
              <h2>{c.title}</h2>
              <p>
                <Inline text={c.text} />
              </p>
              <span className="text-link">
                Read more <I name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* BLOCK 5: closing */}
      <section className="section section-sand" aria-labelledby="closing">
        <div className="wrap-narrow">
          <span className="kicker">Under one roof</span>
          <h2 className="h-display" id="closing">
            {spanLast(page.closing.h2)}
          </h2>
          <div className="prose" style={{ marginTop: '1.2rem' }}>
            {page.closing.paragraphs.map((t, i) => (
              <p key={i}>
                <Inline text={t} />
              </p>
            ))}
            <p className="hook">
              <Inline text={page.closing.closingLine} />
            </p>
          </div>
          <div style={{ marginTop: '1.6rem' }}>
            <CtaButtons />
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

function spanLast(h: string) {
  const w = h.split(' ');
  return (
    <>
      {w.slice(0, -1).join(' ')} <span>{w[w.length - 1]}</span>
    </>
  );
}

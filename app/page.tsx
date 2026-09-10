import Image from '@/components/Img';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/meta';
import type { HomePage, Card } from '@/content/types';
import { SITE_CONFIG, featureOn, isOpen, fullAddress, openingWhen } from '@/site.config';
import { heroBadge, primaryCta } from '@/lib/cta';
import { Inline } from '@/components/Inline';
import HeroSlider from '@/components/HeroSlider';
import Countdown from '@/components/Countdown';
import EoiForm from '@/components/EoiForm';
import { CtaButtons, CtaBand } from '@/components/Cta';
import { I, type IconName } from '@/components/Icons';
import ProviderCards from '@/components/ProviderCards';
import { providerCards } from '@/lib/providers';
import { img } from '@/lib/img';

const page = getPage<HomePage>('home');

export const metadata: Metadata = pageMetadata(page.meta);

/** Resolve a gated card to itself, its fallback, or nothing. */
function resolveCard(c: Card): Card | null {
  if (!c.gate || featureOn(c.gate)) return c;
  return c.fallback ?? null;
}

const PILLAR_ICONS: IconName[] = ['pause', 'eye', 'question', 'clock'];
const CATEGORY_ICONS: Record<string, IconName> = {
  'General Dentistry': 'tooth',
  'Children’s Dentistry': 'child',
  'Emergency Dentistry': 'shield',
  'Restorative Dentistry': 'implant',
  'Cosmetic Dentistry': 'star',
};
const ICON_BLOCK_ICONS: IconName[] = ['smile', 'child', 'heart', 'shield', 'moon', 'implant'];

export default function Home() {
  const slides = page.slides.filter((s) => !s.gate || featureOn(s.gate)).map((s) => ({ ...s, sub: <Inline text={s.sub} /> }));
  const cta = primaryCta();
  const open = isOpen();

  return (
    <>
      {/* BLOCK 1: hero slider (+ countdown & opening pill in pre-opening mode) */}
      <header className="home-hero" id="top">
        <div className="hero-left">
          <span className="pill">
            <span className="pill-dot" />
            {heroBadge()}
          </span>
          <HeroSlider slides={slides}>
            <div className="hero-photo">
              <Image src="/images/cronulla-beach.jpg" alt="Cronulla Beach" width={2400} height={1350} priority />
              <span className="hero-photo-tag">{fullAddress()}</span>
            </div>
            {!open && <Countdown iso={SITE_CONFIG.openingDateTime} />}
            {open && (
              <div style={{ marginBottom: '2rem' }}>
                <CtaButtons />
              </div>
            )}
            <div className="hero-marks">
              <div className="hero-mark">
                <I name="clock" />
                <span>{SITE_CONFIG.hooks.lateMonday}</span>
              </div>
              <div className="hero-mark">
                <I name="sun" />
                <span>{SITE_CONFIG.hooks.earlyFriday}</span>
              </div>
              <div className="hero-mark">
                <I name="check" />
                <span>Right on Cronulla Street</span>
              </div>
            </div>
          </HeroSlider>
        </div>
        <div className="glass-card" id="eoi">
          {open ? (
            <div>
              <span className="card-tag">Now open</span>
              <h2>Book an appointment</h2>
              <p>
                {SITE_CONFIG.hooks.lateMonday}. {SITE_CONFIG.hooks.earlyFriday}. Nervous patients are always welcome. We take time to explain your options clearly.
              </p>
              <CtaButtons />
            </div>
          ) : (
            <EoiForm compact openingLabel={openingWhen().replace(' 2026', '')} />
          )}
        </div>
      </header>

      {/* BLOCK 2: payment provider strip (text-styled, no fake logos) */}
      <ProviderCards />

      {/* BLOCK 3 + 4: H1, positioning, four pillars */}
      <section className="section section-white" aria-labelledby="h1">
        <div className="section-head">
          <h1 className="h-display" id="h1" style={{ fontSize: 'clamp(2rem,3.6vw,3rem)', marginBottom: '0.8rem' }}>
            The <span>Cronulla</span> Dentists
          </h1>
          <h2 className="kicker" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
            {page.h2}
          </h2>
          <p className="lede" style={{ margin: '0 auto' }}>{page.h3}</p>
        </div>
        <div className="grid grid-4">
          {page.pillars.map((c, i) => (
            <div key={c.title} className="card lift reveal">
              <div className="card-icon">
                <I name={PILLAR_ICONS[i]} />
              </div>
              <h3>{c.title}</h3>
              <p>
                <Inline text={c.text} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOCK 5: CTA band */}
      <CtaBand text={page.ctaBand} />

      {/* BLOCK 6: team image */}
      <section className="section section-white" style={{ paddingBottom: 0 }} aria-label="Our team">
        <div className="wrap">
          <div className="photo photo-wide reveal">
            <Image src="/images/team.jpg" alt="The team behind The Cronulla Dentists" fill sizes="(max-width: 1160px) 100vw, 1160px" style={{ objectFit: 'cover' }} />
            <div className="photo-caption">
              <span className="photo-caption-label">{SITE_CONFIG.name} by {SITE_CONFIG.sister.name}</span>
              <span className="photo-caption-sub">{SITE_CONFIG.sister.heritage}</span>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCK 7: welcome */}
      <section className="section section-white" aria-labelledby="welcome">
        <div className="split">
          <div>
            <span className="kicker">{titleCase(page.welcome.h2)}</span>
            <h2 className="h-display" id="welcome">
              In the Middle of <span>Cronulla Street</span>
            </h2>
            <div className="prose" style={{ marginTop: '1.2rem' }}>
              {page.welcome.paragraphs.map((t, i) => (
                <p key={i}>
                  <Inline text={t} />
                </p>
              ))}
            </div>
            <CtaButtons />
          </div>
          <div className="photo reveal">
            <Image src="/images/welcome.jpg" alt="A young patient in the chair with her parent beside her, talking with the dentist before a check-up" fill sizes="(max-width: 980px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* BLOCK 8: four service category cards */}
      <section className="section section-sand" aria-labelledby="categories">
        <div className="section-head">
          <span className="kicker">What we do</span>
          <h2 id="categories">
            Care for <span>every stage</span>
          </h2>
        </div>
        <div className="grid grid-4">
          {page.categoryCards.map(resolveCard).filter((c): c is Card => Boolean(c)).map((c) => (
            <Link key={c.title} href={c.href || '/services/'} className="card reveal">
              <div className="card-icon">
                <I name={CATEGORY_ICONS[c.title] || 'tooth'} />
              </div>
              <h3>{c.title}</h3>
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

      {/* BLOCK 9: six image tiles */}
      <section className="section section-white" aria-labelledby="treatments">
        <div className="section-head">
          <span className="kicker">A full range of services</span>
          <h2 id="treatments">{spanLast(page.treatments.h2)}</h2>
          <p>{page.treatments.h3}</p>
        </div>
        <div className="grid grid-3">
          {page.treatments.tiles.map((t) => (
            <Link key={t.title} href={t.href || '/services/'} className="photo photo-tile reveal">
              <Image src={`/images/tiles/${slug(t.href)}.jpg`} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
              <div className="photo-caption">
                <span className="photo-caption-label">{t.title}</span>
                <span className="photo-caption-sub" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
                  <Inline text={t.text} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BLOCK 10: six icon blocks */}
      <section className="section band-dark" aria-labelledby="good-to-know">
        <div className="section-head">
          <span className="kicker">Good to know</span>
          <h2 id="good-to-know">
            Before you <span>book</span>
          </h2>
        </div>
        <div className="grid grid-3">
          {page.iconBlocks.map((c, i) => (
            <div key={c.title} className="glass-tile reveal">
              <I name={ICON_BLOCK_ICONS[i]} />
              <h3>{c.title}</h3>
              <p>
                <Inline text={c.text} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOCK 11: payment plans band */}
      <section className="section section-pale" aria-labelledby="payment">
        <div className="section-head">
          <span className="kicker">Finances</span>
          <h2 id="payment">
            No Surprises on the <span>Invoice</span>
          </h2>
          {page.paymentBand.lines.map((l, i) => (
            <p key={i} style={{ marginBottom: '0.8rem' }}>
              <Inline text={l} />
            </p>
          ))}
          <div className="providers provider-strip" style={{ border: 0, paddingBottom: 0 }}>
            {(() => {
              const dc = providerCards().find((c) => c.name === 'DentiCare');
              return dc?.logo ? (
                <span className="provider-strip-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(dc.logo)} alt={dc.alt} loading="lazy" decoding="async" />
                </span>
              ) : (
                <span className="provider">
                  DentiCare<small>Payment plans</small>
                </span>
              );
            })()}
          </div>
          <div className="btn-row" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <Link href="/finances/" className="btn-ghost">
              Finances &amp; payment plans
            </Link>
          </div>
        </div>
      </section>

      {/* BLOCK 12: a note from the practice */}
      <section className="section section-white" aria-labelledby="note">
        <div className="split">
          <div className="photo reveal">
            <Image src="/images/team.jpg" alt="The team at The Cronulla Dentists" fill sizes="(max-width: 980px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <span className="kicker">{page.note.h3}</span>
            <h2 className="h-display" id="note">
              Why We Opened in <span>Cronulla</span>
            </h2>
            <div className="prose" style={{ marginTop: '1.2rem' }}>
              {page.note.paragraphs.map((t, i) => (
                <p key={i}>
                  <Inline text={t} />
                </p>
              ))}
              <p>
                <strong>{page.note.signoff}</strong>
              </p>
            </div>
            <CtaButtons />
          </div>
        </div>
      </section>

      {/* BLOCK 13: partner strip — same logos as the cards above, at strip scale. */}
      <div className="providers provider-strip" aria-label="Partners">
        {providerCards().map((p) =>
          p.logo ? (
            <span key={p.name} className="provider-strip-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(p.logo)} alt={p.alt} loading="lazy" decoding="async" />
            </span>
          ) : (
            <span key={p.name} className="provider">
              {p.name}
              <small>{p.tagline}</small>
            </span>
          ),
        )}
        <a className="provider" href={SITE_CONFIG.sister.url + SITE_CONFIG.sister.utm} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
          {SITE_CONFIG.sister.name}
          <small>Sister practice</small>
        </a>
      </div>
      <p className="sr-only">
        <Link href={cta.href}>{cta.label}</Link>
      </p>
    </>
  );
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => (w.length > 2 || w === 'we' ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase());
}
function spanLast(h: string) {
  const w = h.split(' ');
  return (
    <>
      {w.slice(0, -1).join(' ')} <span>{w[w.length - 1]}</span>
    </>
  );
}
function slug(href = '') {
  return href.replace(/\//g, '');
}

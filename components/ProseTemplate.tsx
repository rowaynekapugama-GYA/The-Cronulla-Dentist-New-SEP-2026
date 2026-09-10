import Image from '@/components/Img';
import Link from 'next/link';
import type { ProsePage, Section } from '@/content/types';
import { SITE_CONFIG, fullAddress, isOpen } from '@/site.config';
import { Inline, Nodes, Sections, slugify } from '@/components/Inline';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, personSchemas } from '@/lib/schema';
import { CtaButtons, CtaBand } from '@/components/Cta';
import { I } from '@/components/Icons';
import { MapEmbed } from '@/components/MapEmbed';

export function ProseTemplate({ page }: { page: ProsePage }) {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: page.meta.title, href: page.meta.route },
  ];
  if (page.meta.slug === 'about') return <AboutPage page={page} crumbs={crumbs} />;
  if (page.meta.slug === 'parking-information') return <ParkingPage page={page} crumbs={crumbs} />;
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <header className="hero-band">
        <div className="wrap">
          <Breadcrumb items={crumbs} />
          <h1 className="h-display">{page.h1}</h1>
          {page.meta.slug === 'privacy-policy' && SITE_CONFIG.privacyLastUpdated && (
            <p className="lede">
              <strong>Last updated:</strong> {SITE_CONFIG.privacyLastUpdated}
            </p>
          )}
        </div>
      </header>
      <section className="section section-white" style={{ paddingTop: '2rem' }}>
        <div className="wrap-narrow prose">
          {page.intro?.map((t, i) => (
            <p key={i}>
              <Inline text={t} />
            </p>
          ))}
          <Sections sections={page.sections} level={2} />
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* ABOUT: practice story + Meet the Team + family/"Our practices"       */
/* ------------------------------------------------------------------ */
function AboutPage({ page, crumbs }: { page: ProsePage; crumbs: { name: string; href: string }[] }) {
  const team = page.sections.find((s) => s.heading === 'Meet the team');
  const before = page.sections.slice(0, page.sections.findIndex((s) => s === team));
  const after = page.sections.slice(page.sections.findIndex((s) => s === team) + 1);
  const lead = before[0];
  const rest = before.slice(1);

  return (
    <>
      <JsonLd data={[breadcrumbSchema(crumbs), ...personSchemas()]} />
      <header className="hero-band">
        <div className="wrap">
          <Breadcrumb items={crumbs} />
          <h1 className="h-display">{page.h1}</h1>
        </div>
      </header>

      <section className="section section-white" style={{ paddingTop: '2rem' }}>
        <div className="split">
          <div>
            <span className="kicker">{SITE_CONFIG.name} by {SITE_CONFIG.sister.name}</span>
            <h2 className="h-display">{spanLast(lead.heading)}</h2>
            <div className="prose" style={{ marginTop: '1.2rem' }}>
              <Nodes nodes={lead.nodes} />
            </div>
            <CtaButtons />
          </div>
          <div className="photo reveal">
            <Image src="/images/team.jpg" alt="The Caringbah Dentists team" fill sizes="(max-width: 980px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
            <div className="photo-caption">
              <span className="photo-caption-label">The team you already know</span>
              <span className="photo-caption-sub">{isOpen() ? 'Now open on Cronulla Street' : `Opening ${SITE_CONFIG.openingDateLabel}`}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-sand">
        <div className="wrap-narrow prose">
          <Sections sections={rest} />
        </div>
      </section>

      {/* Meet the team */}
      {team && <TeamSection section={team} />}

      <section className="section section-sand">
        <div className="wrap-narrow prose">
          <Sections sections={after} />
          <div style={{ marginTop: '2rem' }}>
            <CtaButtons />
          </div>
        </div>
      </section>

      {/* Family / Our practices — approved landing-page copy */}
      <section className="section band-dark" id="family" aria-labelledby="family-heading">
        <div className="section-head">
          <span className="kicker">One family, two practices</span>
          <h2 id="family-heading">
            A dental family the Shire <span>already knows</span>
          </h2>
          <p>
            For more than 50 years, our team has looked after families across Caringbah and the wider Sutherland Shire. We live here too, and we kept hearing the same thing from
            Cronulla locals. They wanted us closer to home.
          </p>
        </div>
        <div className="stat-row" style={{ justifyContent: 'center', marginTop: 0, marginBottom: '2.6rem' }}>
          <div>
            <div className="stat-num" style={{ color: '#fff' }}>
              50+
            </div>
            <div className="stat-label" style={{ color: 'var(--cyan-light)' }}>
              Years in the Shire
            </div>
          </div>
          <div>
            <div className="stat-num" style={{ color: '#fff' }}>
              2
            </div>
            <div className="stat-label" style={{ color: 'var(--cyan-light)' }}>
              Practices, one family
            </div>
          </div>
        </div>
        <div className="practices">
          <span className="practice" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }}>
            <div className="card-icon">
              <I name="pin" />
            </div>
            <div>
              <span className="tag">Cronulla</span>
              <h3 style={{ color: '#fff' }}>{SITE_CONFIG.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.68)' }}>{fullAddress()}</p>
            </div>
          </span>
          <a className="practice" href={SITE_CONFIG.sister.url + SITE_CONFIG.sister.utm} target="_blank" rel="noopener" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }}>
            <div className="card-icon">
              <I name="pin" />
            </div>
            <div>
              <span className="tag">Caringbah · {SITE_CONFIG.sister.heritage}</span>
              <h3 style={{ color: '#fff' }}>{SITE_CONFIG.sister.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.68)' }}>Visit thecaringbahdentists.com.au</p>
            </div>
          </a>
        </div>
      </section>
    </>
  );
}

function TeamSection({ section }: { section: Section }) {
  // Copy shape: **Name** paragraph followed by bio paragraphs.
  const members: { name: string; bio: string[] }[] = [];
  for (const n of section.nodes) {
    if (n.type !== 'p') continue;
    const m = n.text.match(/^\*\*(.+)\*\*$/);
    if (m) members.push({ name: m[1], bio: [] });
    else members[members.length - 1]?.bio.push(n.text);
  }
  return (
    <section className="section section-white" id={slugify(section.heading)} aria-labelledby="team-heading">
      <div className="section-head">
        <span className="kicker">The people you will see</span>
        <h2 id="team-heading">
          Meet the <span>team</span>
        </h2>
      </div>
      <div className="team-grid">
        {members.map((m) => {
          const cfg = SITE_CONFIG.team.find((t) => m.name.includes(t.shortName));
          return (
            <article key={m.name} className="team-card reveal">
              <div className="photo">
                <Image src={cfg?.image || '/images/placeholder-team.jpg'} alt={m.name} fill sizes="(max-width: 900px) 200px, 200px" style={{ objectFit: 'cover' }} />
              </div>
              <div>
                <h3>{m.name}</h3>
                <div className="role">{cfg?.title || 'Dentist'}</div>
                <div className="prose">
                  {m.bio.map((b, i) => (
                    <p key={i}>
                      <Inline text={b} />
                    </p>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PARKING                                                              */
/* ------------------------------------------------------------------ */
const TRAVEL_ICON: Record<string, 'train' | 'wave' | 'pin' | 'people' | 'card' | 'clock'> = {
  'By train': 'train',
  'By ferry': 'wave',
  'By bus': 'people',
  'By car': 'pin',
  Accessibility: 'people',
  Parking: 'card',
};

function ParkingPage({ page, crumbs }: { page: ProsePage; crumbs: { name: string; href: string }[] }) {
  const cards = page.sections.filter((s) => s.heading in TRAVEL_ICON);
  const rest = page.sections.filter((s) => !(s.heading in TRAVEL_ICON));
  const parkingNotes = SITE_CONFIG.parkingNotes;
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <header className="hero-band">
        <div className="wrap">
          <Breadcrumb items={crumbs} />
          <h1 className="h-display">{page.h1}</h1>
          {page.intro?.map((t, i) => (
            <p key={i} className="lede">
              <Inline text={t} />
            </p>
          ))}
        </div>
      </header>
      <section className="section section-white" style={{ paddingTop: '2rem' }}>
        <div className="split" style={{ alignItems: 'start' }}>
          <div className="grid grid-2" style={{ margin: 0 }}>
            {parkingNotes.length > 0 && (
              <div className="card">
                <div className="card-icon">
                  <I name="card" />
                </div>
                <h2>Parking</h2>
                <div className="prose">
                  <ul>
                    {parkingNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {cards.map((s) => (
              <div key={s.heading} className="card reveal">
                <div className="card-icon">
                  <I name={TRAVEL_ICON[s.heading]} />
                </div>
                <h2>{s.heading}</h2>
                <div className="prose">
                  <Nodes nodes={s.nodes} />
                </div>
              </div>
            ))}
          </div>
          <MapEmbed />
        </div>
      </section>
      <section className="section section-sand">
        <div className="wrap-narrow prose">
          <Sections sections={rest} level={2} />
          <p style={{ marginTop: '1.5rem' }}>
            <Link href="/contact/" className="text-link">
              Contact details and opening hours <I name="arrow" />
            </Link>
          </p>
        </div>
      </section>
      <CtaBand address />
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

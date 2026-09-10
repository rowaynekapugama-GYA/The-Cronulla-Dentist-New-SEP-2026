import Link from 'next/link';
import type { Metadata } from 'next';
import { getPage } from '@/lib/content';
import { pageMetadata } from '@/lib/meta';
import type { ContactPage } from '@/content/types';
import { SITE_CONFIG, fullAddress, telHref, isOpen, openingWhen } from '@/site.config';
import { Nodes, Sections, sectionVisible } from '@/components/Inline';
import { Hours } from '@/components/Hours';
import { MapEmbed } from '@/components/MapEmbed';
import { CtaButtons, CtaBand } from '@/components/Cta';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';
import ContactForm from '@/components/ContactForm';
import { I } from '@/components/Icons';

const page = getPage<ContactPage>('contact');
export const metadata: Metadata = pageMetadata(page.meta);

const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'Contact', href: '/contact/' },
];

export default function Contact() {
  const sec = (h: string) => page.sections.find((s) => s.heading === h);
  const getting = sec('Getting here');
  const rest = page.sections.filter((s) => !['Where we are', 'Opening hours', 'Getting here', 'Send us a message'].includes(s.heading)).filter(sectionVisible);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <header className="hero-band">
        <div className="wrap">
          <Breadcrumb items={crumbs} />
          <h1 className="h-display">
            Contact <span>The Cronulla Dentists</span>
          </h1>
          <p className="lede">
            {SITE_CONFIG.hooks.lateMonday}. {SITE_CONFIG.hooks.earlyFriday}.
          </p>
        </div>
      </header>

      {/* Where we are + hours (config-driven, crawlable) + map */}
      <section className="section section-white" style={{ paddingTop: '2rem' }} aria-labelledby="where">
        <div className="split" style={{ alignItems: 'start' }}>
          <div>
            <span className="kicker">Where we are</span>
            <h2 className="h-display" id="where">
              13 Cronulla Street, <span>Cronulla</span>
            </h2>
            <address className="prose" style={{ fontStyle: 'normal', marginTop: '1.2rem' }} itemScope itemType="https://schema.org/Dentist">
              <p>
                <strong itemProp="name">{SITE_CONFIG.name}</strong>
                <br />
                <span itemProp="address">{fullAddress()}</span>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a href={telHref()} itemProp="telephone">
                  {SITE_CONFIG.phone}
                </a>
                <br />
                <strong>Email:</strong>{' '}
                <a href={`mailto:${SITE_CONFIG.email}`} itemProp="email">
                  {SITE_CONFIG.email}
                </a>
              </p>
            </address>
            <h3 className="h-display" style={{ marginTop: '2rem', marginBottom: '0.8rem' }}>
              Opening hours
            </h3>
            <Hours hooks />
            <div className="prose" style={{ marginTop: '1rem' }}>
              <Nodes nodes={(sec('Opening hours')?.nodes || []).filter((n) => n.type !== 'table')} />
            </div>
            <div style={{ marginTop: '1.8rem' }}>
              <CtaButtons />
            </div>
          </div>
          <div>
            <MapEmbed />
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-icon">
                <I name="pin" />
              </div>
              <h3>Getting here</h3>
              <div className="prose">
                <Nodes nodes={getting?.nodes || []} />
                <p>
                  <Link href="/parking-information/" className="text-link">
                    Parking &amp; getting here <I name="arrow" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Remaining copy sections */}
      <section className="section section-sand" aria-label="Booking and practical information">
        <div className="wrap-narrow prose">
          <Sections sections={rest} />
        </div>
      </section>

      {/* Send us a message */}
      <section className="section section-white" id="message" aria-labelledby="message-heading">
        <div className="split" style={{ alignItems: 'start' }}>
          <div>
            <span className="kicker">Send us a message</span>
            <h2 className="h-display" id="message-heading">
              We will get <span>back to you</span>
            </h2>
            <p className="lede" style={{ marginTop: '1rem' }}>
              {isOpen()
                ? 'Use the form for general enquiries. For appointments, booking online or calling is quicker.'
                : `We open ${openingWhen()}. Use the form for general enquiries, or register your interest to be first in line for appointments.`}
            </p>
          </div>
          <div className="glass-card">
            <ContactForm />
          </div>
        </div>
      </section>
      <CtaBand address />
    </>
  );
}

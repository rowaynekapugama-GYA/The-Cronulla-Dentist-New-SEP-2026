import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Image from '@/components/Img';
import { SITE_CONFIG, isOpen, fullAddress, openingWhen } from '@/site.config';
import { canonical } from '@/lib/content';
import { OG_IMAGE } from '@/lib/meta';
import EoiForm from '@/components/EoiForm';
import Countdown from '@/components/Countdown';
import { I } from '@/components/Icons';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: `Register Your Interest | The Cronulla Dentists | Opening ${SITE_CONFIG.openingDateLabel}`,
  description: `A brand new dental practice opening at ${fullAddress()} ${openingWhen()}. Register your interest for priority booking and founding patient offers.`,
  alternates: { canonical: canonical('/register/') },
  openGraph: {
    title: `Register Your Interest | ${SITE_CONFIG.name}`,
    description: `Opening at ${fullAddress()} ${openingWhen()}. Register for priority booking.`,
    url: canonical('/register/'),
    siteName: SITE_CONFIG.name,
    locale: 'en_AU',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE.url] },
};

const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'Register your interest', href: '/register/' },
];

export default function Register() {
  // Once open, the EOI page retires: send people to the booking path.
  if (isOpen()) redirect(SITE_CONFIG.bookingUrl || '/contact/');

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <header className="home-hero" id="eoi">
        <div className="hero-left">
          <Breadcrumb items={crumbs} />
          <span className="pill">
            <span className="pill-dot" />
            Opening {SITE_CONFIG.openingDateLabel}
          </span>
          <h1 className="h-display" style={{ marginBottom: '1.4rem' }}>
            A new dentist in <span>Cronulla</span>. Same family you already trust.
          </h1>
          <p className="lede" style={{ marginBottom: '2.2rem' }}>
            {SITE_CONFIG.name} by <strong>{SITE_CONFIG.sister.name}</strong>, bringing the same gentle, respectful dentistry the Shire has trusted for over 50 years to {SITE_CONFIG.address.street}.
          </p>
          <div className="hero-photo">
            <Image src="/images/cronulla-beach.jpg" alt="Cronulla Beach" width={2400} height={1350} priority />
            <span className="hero-photo-tag">{fullAddress()}</span>
          </div>
          <Countdown iso={SITE_CONFIG.openingDateTime} />
          <div className="hero-marks">
            <div className="hero-mark">
              <I name="heart" />
              <span>Gentle care</span>
            </div>
            <div className="hero-mark">
              <I name="people" />
              <span>All ages welcome</span>
            </div>
            <div className="hero-mark">
              <I name="check" />
              <span>Right on Cronulla Street</span>
            </div>
          </div>
        </div>
        <div className="glass-card">
          <EoiForm openingLabel={openingWhen().replace(' 2026', '')} />
        </div>
      </header>

      <section className="section band-dark" id="why" aria-labelledby="why-heading">
        <div className="section-head">
          <span className="kicker">Founding patients</span>
          <h2 id="why-heading">
            Why register <span>before we open?</span>
          </h2>
          <p>Our first appointment books will fill quickly. Registering now puts your family at the front of the queue.</p>
        </div>
        <div className="grid grid-3" style={{ maxWidth: 1060 }}>
          <div className="glass-tile reveal">
            <I name="calendar" />
            <h3>Priority booking</h3>
            <p>First pick of appointment times before the general public, including after-school and early-morning slots.</p>
          </div>
          <div className="glass-tile reveal">
            <I name="star" />
            <h3>Opening offers</h3>
            <p>Exclusive founding-patient specials on new patient check-ups, cleans and whitening.</p>
          </div>
          <div className="glass-tile reveal">
            <I name="chat" />
            <h3>Opening day news</h3>
            <p>Follow the build, meet the team before you sit in the chair, and know the moment our books open.</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a href="#eoi" className="btn-light">
            Register Your Interest
          </a>
        </div>
      </section>

      <section className="cta-band">
        <h2>
          Opening <span>{SITE_CONFIG.openingDateLabel}</span>
        </h2>
        <p className="strip-address">{fullAddress()}</p>
        <p>Existing Caringbah patients are welcome at both practices. New to us? There is no better time to start.</p>
        <a href="#eoi" className="btn-solid">
          Secure Your Place
        </a>
      </section>
    </>
  );
}

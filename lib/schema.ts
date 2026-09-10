import { SITE_CONFIG, fullAddress } from '@/site.config';
import type { ServicePage, Section } from '@/content/types';
import { plain } from '@/components/Inline';
import { canonical } from '@/lib/content';
import { featureOn } from '@/site.config';

const DAY = { Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday', Thursday: 'Thursday', Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday' };

export const ORG_ID = `${SITE_CONFIG.domain}/#dentist`;

/**
 * The 15 client-named services plus dental anxiety care, for availableService
 * (SEO Doc 03, Schema 1). Kept as plain names so the list matches the services
 * hub copy rather than drifting from it.
 */
const AVAILABLE_SERVICES = [
  'General Dentistry',
  "Children's Dentistry",
  'Cosmetic Dentistry',
  'Dental Veneers',
  'Teeth Whitening',
  'Dental Implants',
  'Crowns and Bridges',
  'Dentures',
  'Restorative Dentistry',
  'Root Canal Therapy',
  'Tooth Coloured Fillings',
  'Wisdom Teeth Removal',
  'Hygiene Treatments',
  'Gum Disease Treatment',
  'Mouth and Night Guards',
  'Anti-Snoring and Sleep Apnoea Appliances',
  'Dental Anxiety Care',
];

/** Sitewide Dentist + LocalBusiness schema (SEO Doc 03, Schema 1). */
export function dentistSchema() {
  const sameAs = Object.values(SITE_CONFIG.sameAs).filter(Boolean);
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Dentist', 'LocalBusiness'],
    '@id': ORG_ID,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.domain + '/',
    description:
      'The Cronulla Dentists — a new dental practice at 13 Cronulla Street. Gentle, unhurried care for Cronulla, Woolooware, Burraneer, Greenhills Beach and the wider Sutherland Shire.',
    telephone: SITE_CONFIG.phoneE164,
    email: SITE_CONFIG.email,
    image: `${SITE_CONFIG.domain}/images/og-default.jpg`,
    logo: `${SITE_CONFIG.domain}${SITE_CONFIG.logo.src}`,
    priceRange: '$$',
    medicalSpecialty: 'Dentistry',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.address.street,
      addressLocality: SITE_CONFIG.address.suburb,
      addressRegion: SITE_CONFIG.address.state,
      postalCode: SITE_CONFIG.address.postcode,
      addressCountry: SITE_CONFIG.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE_CONFIG.geo.lat, longitude: SITE_CONFIG.geo.lng },
    openingHoursSpecification: SITE_CONFIG.hours
      .filter((h) => h.open)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${DAY[h.day as keyof typeof DAY]}`,
        opens: h.open,
        closes: h.close,
      })),
    // Sister-practice entity discipline (Doc 03 §6): reference, never nest.
    parentOrganization: { '@type': 'Organization', name: SITE_CONFIG.sister.name, url: SITE_CONFIG.sister.url },
    areaServed: [
      ...['Cronulla', 'Woolooware', 'Burraneer', 'Greenhills Beach', 'Caringbah South', 'Taren Point', 'Kurnell', 'Bundeena'].map((name) => ({ '@type': 'City', name })),
      { '@type': 'AdministrativeArea', name: 'Sutherland Shire' },
    ],
    availableService: AVAILABLE_SERVICES.map((name) => ({ '@type': 'MedicalProcedure', name })),
    paymentAccepted: ['Cash', 'EFTPOS', 'Credit Card', 'HICAPS', 'DentiCare Payment Plans'],
    currenciesAccepted: 'AUD',
  };
  if (SITE_CONFIG.gbpShareUrl) schema.hasMap = SITE_CONFIG.gbpShareUrl;
  if (sameAs.length) schema.sameAs = sameAs;
  if (SITE_CONFIG.mode === 'pre-opening') schema.openingDate = SITE_CONFIG.openingDate;
  if (SITE_CONFIG.teamNamesConfirmed) {
    schema.employee = SITE_CONFIG.team.map((t) => ({ '@id': `${SITE_CONFIG.domain}/about/#${slugId(t.fullName)}` }));
  }
  return schema;
}

function slugId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Person schema for both practitioners, emitted on /about/ (SEO Doc 03,
 * Schema 2). Fields come from the approved bio copy via site.config — no
 * placeholders: AHPRA registration numbers are added to `identifier` only when
 * the client supplies them (Doc 03 pitfall 6 bans "[TO CONFIRM]" in production).
 */
export function personSchemas() {
  if (!SITE_CONFIG.teamNamesConfirmed) return [];
  return SITE_CONFIG.team.map((t) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_CONFIG.domain}/about/#${slugId(t.fullName)}`,
    name: t.fullName,
    givenName: t.givenName,
    familyName: t.familyName,
    honorificPrefix: 'Dr',
    jobTitle: t.title,
    worksFor: { '@id': ORG_ID },
    url: `${SITE_CONFIG.domain}/about/#meet-the-team`,
    image: `${SITE_CONFIG.domain}${t.image}`,
    alumniOf: { '@type': 'EducationalOrganization', name: t.alumniOf },
    hasCredential: t.credentials.map((name) => ({ '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name })),
    knowsAbout: t.knowsAbout,
  }));
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: canonical(it.href),
    })),
  };
}

/** Slugs whose procedures are surgical rather than noninvasive (Doc 03, Schema 3). */
const SURGICAL = new Set(['dental-implants-cronulla', 'wisdom-teeth-removal-cronulla']);
/** Search-matching alternate names, from the tracked-keywords doc. */
const ALT_NAMES: Record<string, string[]> = {
  'dental-implants-cronulla': ['Tooth Implants', 'Single Tooth Implants'],
  'tooth-coloured-fillings-cronulla': ['White Fillings', 'Composite Fillings'],
  'mouth-night-guards-cronulla': ['Sports Mouthguards', 'Night Guards'],
  'anti-snoring-sleep-apnoea-cronulla': ['Mandibular Advancement Splints', 'Anti-Snoring Devices'],
  'hygiene-treatments-cronulla': ['Teeth Cleaning', 'Scale and Clean'],
};

export function serviceSchema(page: ServicePage) {
  const isProcedure = !['finances', 'payment-plans', 'dental-anxiety-cronulla'].includes(page.meta.slug);
  return {
    '@context': 'https://schema.org',
    '@type': isProcedure ? 'MedicalProcedure' : 'Service',
    name: page.h2,
    ...(ALT_NAMES[page.meta.slug] ? { alternateName: ALT_NAMES[page.meta.slug] } : {}),
    description: plain(page.hook),
    url: canonical(page.meta.route),
    ...(isProcedure
      ? {
          procedureType: SURGICAL.has(page.meta.slug) ? 'https://schema.org/SurgicalProcedure' : 'https://schema.org/NoninvasiveProcedure',
          bodyLocation: SURGICAL.has(page.meta.slug) ? 'Jaw' : 'Mouth',
          howPerformed: plain(page.body[0]?.type === 'p' ? page.body[0].text : ''),
        }
      : { serviceType: page.h2 }),
    provider: { '@id': ORG_ID },
    areaServed: 'Sutherland Shire',
  };
}

/** Detail sections phrased as questions → FAQPage. */
export function faqSchema(sections: Section[]) {
  const qs = sections
    .filter((s) => !s.gate || featureOn(s.gate))
    .filter((s) => isQuestion(s.heading))
    .map((s) => ({
      '@type': 'Question',
      name: s.heading.endsWith('?') ? s.heading : `${s.heading}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: s.nodes
          .filter((n) => !n.gate || featureOn(n.gate))
          .map((n) => (n.type === 'p' || n.type === 'h4' ? plain(n.text) : n.type === 'ul' ? n.items.map(plain).join(' ') : ''))
          .join(' ')
          .trim(),
      },
    }));
  if (!qs.length) return null;
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qs };
}

export function isQuestion(h: string) {
  return /^(what|when|why|how|will|should|who|where|is|are|do|does|can)\b/i.test(h) || h.endsWith('?');
}

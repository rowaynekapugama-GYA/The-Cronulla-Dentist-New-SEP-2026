import { SITE_CONFIG, isOpen, telHref } from '@/site.config';

/**
 * Mode-aware primary conversion path.
 *  pre-opening → "Register your interest" → /register/
 *  open        → "Book an appointment" → bookingUrl (falls back to /contact/ until set)
 */
export function primaryCta() {
  if (isOpen()) {
    return {
      label: 'Book an appointment',
      /** Used in the nav bar on narrow screens, where the full label overflows. */
      short: 'Book',
      href: SITE_CONFIG.bookingUrl || '/contact/',
      external: Boolean(SITE_CONFIG.bookingUrl),
    };
  }
  return { label: 'Register your interest', short: 'Register', href: '/register/', external: false };
}

/** Secondary CTA only exists once the practice can answer the phone. */
export function secondaryCta() {
  if (!isOpen()) return null;
  return { label: `Call ${SITE_CONFIG.phone}`, href: telHref(), external: false };
}

/** Where "book online" links in running copy resolve to. */
export function ctaHref() {
  return primaryCta().href;
}

export function heroBadge() {
  return isOpen() ? 'Now taking new patients' : `Opening ${SITE_CONFIG.openingDateLabel}`;
}

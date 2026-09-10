import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SITE_CONFIG, fullAddress, telHref, isOpen } from '@/site.config';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { JsonLd } from '@/components/JsonLd';
import { GtmBody, GtmHead } from '@/components/Gtm';
import { dentistSchema } from '@/lib/schema';
import { primaryNav, aboutFeatured, serviceGroups, featuredServices, serviceCount } from '@/lib/nav';
import { primaryCta } from '@/lib/cta';
import { OG_IMAGE } from '@/lib/meta';

// Self-hosted Poppins + Inter (Google Fonts files) via next/font → display:swap, zero third-party requests, no CLS.
const poppins = localFont({
  variable: '--display',
  display: 'swap',
  fallback: ['-apple-system', 'Segoe UI', 'sans-serif'],
  src: [
    { path: './fonts/poppins-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/poppins-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/poppins-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/poppins-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
});
const inter = localFont({
  variable: '--body',
  display: 'swap',
  fallback: ['-apple-system', 'Segoe UI', 'sans-serif'],
  src: [
    { path: './fonts/inter-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: { default: SITE_CONFIG.name, template: '%s' },
  openGraph: { siteName: SITE_CONFIG.name, locale: 'en_AU', type: 'website', images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <GtmHead />
      </head>
      <body>
        <GtmBody />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav
          primary={primaryNav()}
          groups={serviceGroups()}
          featured={featuredServices()}
          aboutCards={aboutFeatured()}
          serviceCount={serviceCount()}
          cta={primaryCta()}
          phone={SITE_CONFIG.phone}
          telHref={telHref()}
          email={SITE_CONFIG.email}
          address={fullAddress()}
        />
        {/* Scroll-reveal must never be able to hide content permanently. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <main id="main">{children}</main>
        <Footer />
        <Reveal />
        <JsonLd data={dentistSchema()} />
        {isOpen() ? null : <span className="sr-only">Opening {SITE_CONFIG.openingDateLabel}</span>}
      </body>
    </html>
  );
}

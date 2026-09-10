import Link from 'next/link';
import Image from '@/components/Img';
import { SITE_CONFIG, fullAddress, telHref, isOpen } from '@/site.config';
import { footerLinks, serviceGroups } from '@/lib/nav';
import { primaryCta } from '@/lib/cta';
import { Hours } from '@/components/Hours';

export default function Footer() {
  const cta = primaryCta();
  const services = serviceGroups().flatMap((g) => g.links);
  return (
    <footer className="footer" id="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">
            <Image
              src={SITE_CONFIG.logo.src}
              alt={SITE_CONFIG.name}
              width={SITE_CONFIG.logo.width}
              height={SITE_CONFIG.logo.height}
              sizes="200px"
              quality={90}
            />
          </div>
          <p className="footer-sub">
            <a href={SITE_CONFIG.sameAs.googleMaps || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(fullAddress())} target="_blank" rel="noopener">
              {fullAddress()}
            </a>
            <br />
            <a href={telHref()}>{SITE_CONFIG.phone}</a>
            <br />
            <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
          </p>
          <p className="footer-sub" style={{ marginTop: '1rem' }}>
            {isOpen() ? 'Now taking new patients.' : `Opening ${SITE_CONFIG.openingDateLabel}.`}{' '}
            <Link href={cta.href}>{cta.label}</Link>
          </p>
          <h3 style={{ marginTop: '1.8rem' }}>Our practices</h3>
          <div className="footer-practices">
            <span aria-current="true" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--display)', fontSize: '0.74rem', fontWeight: 600, color: '#fff', border: '1px solid var(--cyan)', background: 'rgba(38,184,219,0.18)', borderRadius: 100, padding: '0.5rem 1rem' }}>
              {SITE_CONFIG.name} · Cronulla
            </span>
            <a href={SITE_CONFIG.sister.url + SITE_CONFIG.sister.utm} target="_blank" rel="noopener">
              {SITE_CONFIG.sister.name} · Caringbah
            </a>
          </div>
        </div>
        <div>
          <h3>Services</h3>
          <ul>
            {services.slice(0, 9).map((s) => (
              <li key={s.href}>
                <Link href={s.href}>{s.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/services/">All services</Link>
            </li>
          </ul>
        </div>
        {footerLinks().map((g) => (
          <div key={g.label}>
            <h3>{g.label}</h3>
            <ul>
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h3>Opening hours</h3>
          <Hours compact />
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved. {SITE_CONFIG.name} by{' '}
          <a href={SITE_CONFIG.sister.url + SITE_CONFIG.sister.utm} target="_blank" rel="noopener">
            {SITE_CONFIG.sister.name}
          </a>
          .
        </span>
        <span>
          <Link href="/privacy-policy/">Privacy Policy</Link>
        </span>
      </div>
    </footer>
  );
}

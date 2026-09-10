'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from '@/components/Img';
import { usePathname } from 'next/navigation';
import type { NavGroup, NavLink, FeaturedService } from '@/lib/nav';
import { I } from '@/components/Icons';
import { SITE_CONFIG } from '@/site.config';

interface Props {
  primary: NavLink[];
  groups: NavGroup[];
  /** Cards in the Services panel. */
  featured: FeaturedService[];
  /** Cards in the About panel — same styling, fewer columns. */
  aboutCards: FeaturedService[];
  serviceCount: number;
  cta: { label: string; short: string; href: string; external: boolean };
  phone: string;
  telHref: string;
  email: string;
  address: string;
}

type OpenMenu = 'services' | 'about' | null;

export default function Nav({ primary, groups, featured, aboutCards, serviceCount, cta, phone, telHref, email, address }: Props) {
  const [open, setOpen] = useState<OpenMenu>(null);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover intent: opening is instant, closing waits a beat so the pointer can
  // cross the gap into the panel without the menu vanishing.
  const openNow = useCallback((menu: OpenMenu) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(menu);
  }, []);
  const closeSoon = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 200);
  }, []);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(null);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setDrawer(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  const current = (href: string) => (pathname === href ? 'page' : undefined);
  const inServices =
    pathname === '/services/' || featured.some((f) => f.href === pathname) || groups.some((g) => g.links.some((l) => l.href === pathname));
  const inAbout = aboutCards.some((c) => c.href.split('#')[0] === pathname);

  /** Shared panel — only the column count and the footer differ. */
  const panel = (menu: Exclude<OpenMenu, null>, cards: FeaturedService[], foot: React.ReactNode) => (
    <div
      className={`mega${open === menu ? ' open' : ''}`}
      style={{ ['--mega-cols' as string]: cards.length }}
      onMouseEnter={() => openNow(menu)}
      onMouseLeave={closeSoon}
      aria-hidden={open !== menu}
    >
      <div className="mega-inner">
        <div className="mega-grid">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="mega-card" tabIndex={open === menu ? 0 : -1}>
              <span className="mega-thumb">
                <Image src={c.image} alt="" fill sizes="(max-width: 1200px) 30vw, 200px" style={{ objectFit: 'cover' }} />
              </span>
              <span className="mega-label">{c.label}</span>
            </Link>
          ))}
        </div>
        <div className="mega-foot">{foot}</div>
      </div>
    </div>
  );

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} aria-label="Primary" onMouseLeave={closeSoon}>
        <Link href="/" className="nav-brand" aria-label={`${SITE_CONFIG.name} home`}>
          <Image src={SITE_CONFIG.logo.src} alt={SITE_CONFIG.name} width={SITE_CONFIG.logo.width} height={SITE_CONFIG.logo.height} priority sizes="(max-width: 520px) 130px, 230px" quality={90} />
        </Link>

        <div className="nav-links">
          {primary.map((l) => {
            const menu: OpenMenu = l.label === 'Services' ? 'services' : l.label === 'About' ? 'about' : null;
            if (menu) {
              const isCurrent = menu === 'services' ? inServices : inAbout;
              return (
                <button
                  key={l.href}
                  type="button"
                  className={`nav-trigger${open === menu ? ' open' : ''}${isCurrent ? ' current' : ''}`}
                  aria-expanded={open === menu}
                  aria-haspopup="true"
                  onMouseEnter={() => openNow(menu)}
                  onFocus={() => openNow(menu)}
                  onClick={() => setOpen(open === menu ? null : menu)}
                >
                  {l.label} <I name="chevron" />
                </button>
              );
            }
            return (
              <Link key={l.href} href={l.href} aria-current={current(l.href)} onMouseEnter={closeSoon}>
                {l.label}
              </Link>
            );
          })}

          {cta.external ? (
            <a href={cta.href} className="nav-cta" target="_blank" rel="noopener" onMouseEnter={closeSoon}>
              <span className="cta-long">{cta.label}</span>
              <span className="cta-short">{cta.short}</span>
            </a>
          ) : (
            <Link href={cta.href} className="nav-cta" onMouseEnter={closeSoon}>
              <span className="cta-long">{cta.label}</span>
              <span className="cta-short">{cta.short}</span>
            </Link>
          )}

          <button className="nav-burger" aria-label={drawer ? 'Close menu' : 'Open menu'} aria-expanded={drawer} aria-controls="mobile-menu" onClick={() => setDrawer((d) => !d)}>
            <I name={drawer ? 'close' : 'menu'} />
          </button>
        </div>

        {panel(
          'services',
          featured,
          <>
            <p>
              We offer <strong>{serviceCount} treatments</strong> and procedures.
            </p>
            <Link href="/services/" className="mega-all" tabIndex={open === 'services' ? 0 : -1}>
              All services <I name="arrow" />
            </Link>
          </>,
        )}

        {panel(
          'about',
          aboutCards,
          <>
            <p>
              {SITE_CONFIG.name} by <strong>{SITE_CONFIG.sister.name}</strong> — {SITE_CONFIG.sister.heritage}.
            </p>
            <Link href="/about/" className="mega-all" tabIndex={open === 'about' ? 0 : -1}>
              About the practice <I name="arrow" />
            </Link>
          </>,
        )}
      </nav>

      {/* Mobile drawer */}
      {/*
        Closing on `pathname` alone is not enough: tapping the link for the page
        you are already on (Home from the home page, "Our services" from
        /services/) does not change the pathname, so the effect never re-runs —
        the drawer stays open over the page AND `body { overflow: hidden }` keeps
        the scroll locked, with only the burger to get out of it. Closing on any
        tap inside the drawer covers the same-route case, plus in-page # links.
      */}
      <div
        id="mobile-menu"
        className={`mnav${drawer ? ' open' : ''}`}
        aria-hidden={!drawer}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a[href]')) setDrawer(false);
        }}
      >
        <Link href="/">Home</Link>
        {primary.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        {groups.map((g) => (
          <div key={g.label} className="mnav-sub">
            <div className="mnav-head">{g.label}</div>
            {g.links.map((s) => (
              <Link key={s.href} href={s.href}>
                {s.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="mnav-head">Patients</div>
        {aboutCards.map((c) => (
          <Link key={c.href} href={c.href}>
            {c.label}
          </Link>
        ))}
        <Link href="/payment-plans/">Payment plans</Link>
        {cta.external ? (
          <a href={cta.href} className="mnav-cta" target="_blank" rel="noopener">
            {cta.label}
          </a>
        ) : (
          <Link href={cta.href} className="mnav-cta">
            {cta.label}
          </Link>
        )}
        <p className="mnav-meta">
          {address}
          <br />
          <a href={telHref}>{phone}</a>
          <br />
          <a href={`mailto:${email}`}>{email}</a>
        </p>
      </div>
    </>
  );
}

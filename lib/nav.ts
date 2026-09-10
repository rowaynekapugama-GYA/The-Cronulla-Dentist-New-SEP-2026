import { navServicePages, getPage, isLive, allPages } from '@/lib/content';
import type { ServicePage, ServicesHubPage } from '@/content/types';
import { featureOn } from '@/site.config';

export interface NavLink {
  label: string;
  href: string;
}
export interface NavGroup {
  label: string;
  links: NavLink[];
}
export interface FeaturedService extends NavLink {
  image: string;
  alt: string;
}

const GROUPS: { key: ServicePage['category']; label: string }[] = [
  { key: 'general', label: 'General & Children' },
  { key: 'children', label: 'General & Children' },
  { key: 'cosmetic', label: 'Cosmetic' },
  { key: 'restorative', label: 'Restorative' },
  { key: 'gum', label: 'Gum Health' },
  { key: 'other', label: 'Sleep & Comfort' },
];

/** Services mega-menu, grouped, built from live content only. */
export function serviceGroups(): NavGroup[] {
  const pages = navServicePages();
  const map = new Map<string, NavLink[]>();
  for (const g of GROUPS) if (!map.has(g.label)) map.set(g.label, []);
  for (const p of pages) {
    const label = GROUPS.find((g) => g.key === (p.category || 'other'))!.label;
    map.get(label)!.push({ label: p.meta.title, href: p.meta.route });
  }
  return [...map.entries()].filter(([, l]) => l.length).map(([label, links]) => ({ label, links }));
}

/**
 * The image cards across the top of the Services mega-menu.
 * Order matters — edit this list to change what is featured.
 * Any slug whose feature flag is off is dropped automatically.
 *
 * `image` overrides the card thumbnail only; the service page keeps its own
 * image. Use it when a photo suits the small menu card but not the page.
 */
const FEATURED: { slug: string; image?: string }[] = [
  { slug: 'general-dentistry-cronulla' },
  { slug: 'childrens-dentistry-cronulla' },
  { slug: 'cosmetic-dentistry-cronulla' },
  { slug: 'teeth-whitening-cronulla' },
  { slug: 'dental-implants-cronulla' },
  { slug: 'dental-crowns-bridges-cronulla' },
];

export function featuredServices(): FeaturedService[] {
  return FEATURED.map(({ slug, image }) => {
    const p = getPage<ServicePage>(slug);
    if (!isLive(p.meta)) return null;
    return { label: p.meta.title, href: p.meta.route, image: image ?? p.image.src, alt: p.image.alt };
  }).filter((x): x is FeaturedService => Boolean(x));
}

/**
 * Drives the mega-menu footer line. Uses the client's own service list from the
 * Services Hub copy (15 items) rather than the page count — several pages cover
 * one service (the gum-health cluster) and some are not treatments at all
 * (Dental Anxiety), so the page count would overstate it.
 */
export function serviceCount(): number {
  const hub = getPage<ServicesHubPage>('services');
  return hub.serviceList.length;
}

/** The pill nav. 'About' and 'Services' both open an image-card panel. */
export function primaryNav(): NavLink[] {
  return [
    { label: 'About', href: '/about/' },
    { label: 'Services', href: '/services/' },
    { label: 'Finances', href: '/finances/' },
    { label: 'Contact', href: '/contact/' },
  ];
}

/** Image cards in the About panel — same treatment as the Services panel. */
export function aboutFeatured(): FeaturedService[] {
  const cards: FeaturedService[] = [
    { label: 'The practice', href: '/about/', image: '/images/menu-practice.jpg', alt: '' },
    { label: 'Meet the team', href: '/about/#meet-the-team', image: '/images/team.jpg', alt: '' },
    { label: 'Nervous patients', href: '/dental-anxiety-cronulla/', image: '/images/services/dental-anxiety-cronulla.jpg', alt: '' },
    { label: 'Parking & getting here', href: '/parking-information/', image: '/images/cronulla-beach.jpg', alt: '' },
  ];
  // Drop anything whose page is gated off.
  return cards.filter((c) => allPages().some((p) => isLive(p.meta) && c.href.split('#')[0] === p.meta.route));
}

export function footerLinks(): { label: string; links: NavLink[] }[] {
  const patients: NavLink[] = [
    { label: 'About the practice', href: '/about/' },
    { label: 'Finances & health funds', href: '/finances/' },
    { label: 'Payment plans', href: '/payment-plans/' },
    { label: 'Parking & getting here', href: '/parking-information/' },
    { label: 'Nervous patients', href: '/dental-anxiety-cronulla/' },
    { label: 'Contact', href: '/contact/' },
  ];
  if (featureOn('cdbs'))
    patients.splice(2, 0, { label: getPage('kids-gap-free-dentistry-cronulla').meta.title, href: '/kids-gap-free-dentistry-cronulla/' });
  return [{ label: 'Patients', links: patients }];
}

/** Ordered list of all live service links (for the services hub check-list). */
export function allServiceLinks(): NavLink[] {
  return navServicePages().map((p) => ({ label: p.meta.title, href: p.meta.route }));
}

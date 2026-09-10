import type { FeatureFlag, SiteMode } from '@/site.config';

/**
 * Inline text uses a tiny markdown subset:
 *   **bold**   → <strong>
 *   {{phone}}  → SITE_CONFIG.phone (rendered as a tel: link)
 *   {{email}}  → SITE_CONFIG.email (rendered as a mailto: link)
 *   [label](/route/) → internal link
 */
export type Inline = string;

export type Node =
  | { type: 'p'; text: Inline; gate?: FeatureFlag; mode?: SiteMode }
  | { type: 'ul'; items: Inline[]; gate?: FeatureFlag }
  | { type: 'h4'; text: Inline; gate?: FeatureFlag }
  | { type: 'table'; rows: string[][]; gate?: FeatureFlag };

export interface Section {
  heading: string;
  nodes: Node[];
  /** Section renders only when this feature flag is ON. */
  gate?: FeatureFlag;
}

export interface PageMeta {
  /** File/route key, e.g. "general-dentistry-cronulla" */
  slug: string;
  route: string;
  /** Short nav / breadcrumb label */
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** Alternative meta used while a gate is OFF (e.g. payment plans without Zip/Afterpay). */
  metaTitleGated?: string;
  metaDescriptionGated?: string;
  noindex?: boolean;
  /** Whole page renders only when this flag is ON. */
  gate?: FeatureFlag;
  primaryKeyword?: string;
}

export interface Card {
  title: string;
  text: Inline;
  href?: string;
  gate?: FeatureFlag;
  /** Rendered instead of this card when its gate is OFF. */
  fallback?: Card;
  icon?: string;
}

export interface ServicePage {
  kind: 'service';
  meta: PageMeta;
  h1: string;
  breadcrumb: string[];
  eyebrow: string;
  h2: string;
  hook: Inline;
  body: Node[];
  ctaBand: Inline;
  details: Section[];
  closingCta: Inline;
  /** Alternative wording rendered while a gate is OFF (payment plans → DentiCare only). */
  gatedText?: { hook?: Inline; bodyIntro?: Inline };
  /** Category for schema + services hub grouping */
  category?: 'general' | 'children' | 'cosmetic' | 'restorative' | 'gum' | 'other';
  /** Named image slot, see IMAGES-NEEDED.md */
  image: { src: string; alt: string };
}

export interface HomePage {
  kind: 'home';
  meta: PageMeta;
  slides: { headline: string; sub: Inline; linkText?: string; linkHref?: string; gate?: FeatureFlag }[];
  providers: string[];
  h1: string;
  h2: string;
  h3: string;
  pillars: Card[];
  ctaBand: Inline;
  welcome: { h2: string; h3: string; paragraphs: Inline[] };
  categoryCards: Card[];
  treatments: { h2: string; h3: string; tiles: Card[] };
  iconBlocks: Card[];
  paymentBand: { h2: string; lines: Inline[]; logo: string };
  note: { h2: string; h3: string; paragraphs: Inline[]; signoff: string };
}

export interface ProsePage {
  kind: 'prose';
  meta: PageMeta;
  h1: string;
  intro?: Inline[];
  sections: Section[];
  breadcrumb?: string[];
}

export interface ServicesHubPage {
  kind: 'hub';
  meta: PageMeta;
  h1: string;
  intro: Inline;
  serviceList: string[];
  closingLine: Inline;
  featured: Card[];
  blurbs: Card[];
  categoryCards: Card[];
  closing: { h2: string; paragraphs: Inline[]; closingLine: Inline };
}

export interface ContactPage {
  kind: 'contact';
  meta: PageMeta;
  h1: string;
  sections: Section[];
}

export type Page = ServicePage | HomePage | ProsePage | ServicesHubPage | ContactPage;

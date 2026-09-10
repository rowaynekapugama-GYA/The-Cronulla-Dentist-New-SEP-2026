import Image from '@/components/Img';
import Link from 'next/link';
import type { ServicePage } from '@/content/types';
import { featureOn } from '@/site.config';
import { Inline, Nodes, sectionVisible } from '@/components/Inline';
import { CtaButtons, CtaBand, ClosingCta } from '@/components/Cta';
import { Breadcrumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema';
import { RelatedServices } from '@/components/RelatedServices';
import { DetailSections } from '@/components/DetailSections';

function cyanSpan(h2: string) {
  // One word gets the cyan span treatment — the location word where present.
  const words = h2.split(' ');
  const idx = words.findIndex((w) => /^cronulla$/i.test(w.replace(/[^a-z]/gi, '')));
  const i = idx >= 0 ? idx : words.length - 1;
  return (
    <>
      {words.slice(0, i).join(' ')}
      {i > 0 ? ' ' : ''}
      <span>{words[i]}</span>
      {i < words.length - 1 ? ' ' + words.slice(i + 1).join(' ') : ''}
    </>
  );
}

const crumbHref: Record<string, string> = { Home: '/', Services: '/services/' };

export function ServiceTemplate({ page }: { page: ServicePage }) {
  const zipGated = page.meta.slug === 'payment-plans' && !featureOn('zipAfterpay') && page.gatedText;
  const hook = zipGated && page.gatedText?.hook ? page.gatedText.hook : page.hook;
  const body = zipGated && page.gatedText?.bodyIntro ? [page.body[0], { type: 'p' as const, text: page.gatedText.bodyIntro }, ...page.body.slice(2)] : page.body;
  const crumbs = page.breadcrumb.map((c, i) => ({ name: c, href: i === page.breadcrumb.length - 1 ? page.meta.route : crumbHref[c] || '/' }));
  const details = page.details.filter(sectionVisible);
  const faq = faqSchema(page.details);

  return (
    <>
      <JsonLd data={[breadcrumbSchema(crumbs), serviceSchema(page), faq]} />

      {/* BLOCK 1 + 2: hero band with H1 + breadcrumb */}
      <header className="hero-band">
        <div className="wrap">
          <Breadcrumb items={crumbs} />
          <h1 className="h-display">{page.h1}</h1>
        </div>
      </header>

      {/* BLOCK 3–8: eyebrow → H2 → hook → body → CTA → image */}
      <section className="section section-white" style={{ paddingTop: '2rem' }}>
        <div className="split">
          <div>
            <span className="kicker">{page.eyebrow}</span>
            <h2 className="h-display">{cyanSpan(page.h2)}</h2>
            <p className="hook" style={{ marginTop: '1.2rem' }}>
              <Inline text={hook} />
            </p>
            <div className="prose">
              <Nodes nodes={body} />
            </div>
            <CtaButtons />
          </div>
          <div className="photo reveal">
            <Image src={page.image.src} alt={page.image.alt} fill sizes="(max-width: 980px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* BLOCK 9: CTA band */}
      <CtaBand text={page.ctaBand} />

      {/* BLOCK 10: detail sections, laid out section by section.
          Question-phrased headings still emit FAQPage schema (built from the data above). */}
      <DetailSections sections={details} title={`${page.h2}: in detail`} />

      <RelatedServices current={page} />

      {/* BLOCK 11 + 12 */}
      <ClosingCta text={page.closingCta} />
      <p className="sr-only">
        <Link href="/services/">Back to all services</Link>
      </p>
    </>
  );
}

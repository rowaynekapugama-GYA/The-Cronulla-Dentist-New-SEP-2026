import Link from 'next/link';
import type { ServicePage } from '@/content/types';
import { navServicePages } from '@/lib/content';
import { I } from '@/components/Icons';

const GUM = ['hygiene-treatments-cronulla', 'gingivitis-cronulla', 'gum-disease-treatment-cronulla', 'periodontal-treatment-cronulla'];

/** Cross-links: gum-health cluster links to itself; everything else to same-category pages. */
export function RelatedServices({ current }: { current: ServicePage }) {
  const live = navServicePages();
  let related: ServicePage[];
  if (GUM.includes(current.meta.slug)) {
    related = live.filter((p) => GUM.includes(p.meta.slug) && p.meta.slug !== current.meta.slug);
  } else {
    related = live.filter((p) => p.category === current.category && p.meta.slug !== current.meta.slug).slice(0, 3);
    if (related.length < 3) related = [...related, ...live.filter((p) => !related.includes(p) && p.meta.slug !== current.meta.slug)].slice(0, 3);
  }
  if (!related.length) return null;
  const isGum = GUM.includes(current.meta.slug);
  return (
    <section className="section section-white" aria-labelledby="related-heading">
      <div className="section-head">
        <span className="kicker">{isGum ? 'Gum health' : 'Related treatments'}</span>
        <h2 id="related-heading">
          {isGum ? (
            <>
              The rest of the <span>gum health</span> series
            </>
          ) : (
            <>
              You may also be <span>looking for</span>
            </>
          )}
        </h2>
      </div>
      <div className="grid grid-3">
        {related.map((p) => (
          <Link key={p.meta.slug} href={p.meta.route} className="card reveal">
            <div className="card-icon">
              <I name="tooth" />
            </div>
            <h3>{p.meta.title}</h3>
            <p>{p.eyebrow.charAt(0) + p.eyebrow.slice(1).toLowerCase()}</p>
            <span className="text-link">
              Read more <I name="arrow" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

import { providerCards } from '@/lib/providers';
import { img } from '@/lib/img';

/**
 * Three-up cards for DentiCare / nib / HICAPS.
 *
 * Shows the real logo when a file has been supplied (see lib/providers.ts),
 * otherwise the styled wordmark, so the block reads correctly either way.
 */
export default function ProviderCards() {
  const cards = providerCards();
  return (
    <section className="section section-white provider-section" aria-label="Health funds and payment options">
      <div className="grid grid-3 provider-cards">
        {cards.map((c) => (
          <div key={c.name} className={`card provider-card lift${c.logo ? ' has-logo' : ''}`}>
            <div className="provider-logo">
              {c.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={img(c.logo)} alt={c.alt} loading="lazy" decoding="async" />
              ) : (
                <span className="provider-wordmark" aria-hidden="true">
                  {c.name}
                </span>
              )}
            </div>
            {/* Each supplied logo already carries its own descriptor ("Payment
                Solutions", "first choice", "Fast claims… on the spot"), so the
                tagline would repeat it. Show it only in the wordmark fallback;
                it stays in the alt text either way. */}
            {c.logo ? <span className="sr-only">{c.alt}</span> : <span className="provider-tagline">{c.tagline}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

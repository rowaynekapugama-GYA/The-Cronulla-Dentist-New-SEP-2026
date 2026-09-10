import Link from 'next/link';
import { primaryCta, secondaryCta } from '@/lib/cta';
import { SITE_CONFIG, isOpen, fullAddress } from '@/site.config';
import { Inline } from '@/components/Inline';
import type { Inline as InlineText } from '@/content/types';

/** Primary (+ secondary when open) buttons. Replaces every "Button: BOOK ONLINE" in the copy. */
export function CtaButtons({ variant = 'btn', center = false }: { variant?: 'btn' | 'light' | 'solid'; center?: boolean }) {
  const p = primaryCta();
  const s = secondaryCta();
  const cls = variant === 'light' ? 'btn-light' : variant === 'solid' ? 'btn-solid' : 'btn';
  return (
    <div className="btn-row" style={center ? { justifyContent: 'center' } : undefined}>
      {p.external ? (
        <a href={p.href} className={cls} target="_blank" rel="noopener">
          {p.label}
        </a>
      ) : (
        <Link href={p.href} className={cls}>
          {p.label}
        </Link>
      )}
      {s && (
        <a href={s.href} className="btn-ghost">
          {s.label}
        </a>
      )}
    </div>
  );
}

/**
 * The copy's "Give Us A Call At {{phone}} Today To Make An Appointment" band.
 * pre-opening: the practice cannot yet answer bookings, so the band leads with the EOI
 *              (brief §5) and the two hours differentiators; the copy line returns in 'open' mode.
 */
export function CtaBand({ text, address = false }: { text?: InlineText; address?: boolean }) {
  return (
    <section className="cta-band" aria-label="Make an appointment">
      {isOpen() && text ? (
        <h2>
          <Inline text={text} />
        </h2>
      ) : (
        <h2>
          Opening <span>{SITE_CONFIG.openingDateLabel}</span>. Register your interest for priority booking.
        </h2>
      )}
      {address && <p className="strip-address">{fullAddress()}</p>}
      <p>
        {SITE_CONFIG.hooks.lateMonday}. {SITE_CONFIG.hooks.earlyFriday}.
        {!isOpen() && ' Nervous patients are always welcome. We take time to explain your options clearly.'}
      </p>
      <CtaButtons variant="solid" center />
    </section>
  );
}

/** Closing bold line + final book-online block (BLOCK 11 + 12). */
export function ClosingCta({ text }: { text: InlineText }) {
  return (
    <section className="section section-white" aria-label="Arrange an appointment">
      <div className="wrap-narrow" style={{ textAlign: 'center' }}>
        {isOpen() ? (
          <p className="hook" style={{ margin: '0 auto 1.6rem' }}>
            <Inline text={text} />
          </p>
        ) : (
          <p className="hook" style={{ margin: '0 auto 1.6rem' }}>
            Doors open {SITE_CONFIG.openingDateLabel}. Register now and we will be in touch with your priority booking invitation.
          </p>
        )}
        <CtaButtons center />
      </div>
    </section>
  );
}

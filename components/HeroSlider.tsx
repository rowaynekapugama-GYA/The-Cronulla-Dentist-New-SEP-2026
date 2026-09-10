'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export interface Slide {
  headline: string;
  sub: React.ReactNode;
  linkText?: string;
  linkHref?: string;
}

function cyanLast(h: string) {
  const w = h.split(' ');
  return (
    <>
      {w.slice(0, -1).join(' ')} <span>{w[w.length - 1]}</span>
    </>
  );
}

/** Three-slide hero (copy BLOCK 1). Auto-advances every 6s, pauses on hover/focus. */
export default function HeroSlider({ slides, children }: { slides: Slide[]; children?: React.ReactNode }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="slides" aria-live="polite">
        {slides.map((s, k) => (
          <div key={s.headline} className={`slide${k === i ? ' active' : ''}`} aria-hidden={k !== i} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${slides.length}`}>
            <p className="slide-headline">{cyanLast(s.headline)}</p>
            <p className="slide-sub">{s.sub}</p>
            {s.linkText && s.linkHref && (
              <div className="slide-links">
                <Link href={s.linkHref} className="text-link" tabIndex={k === i ? 0 : -1}>
                  {s.linkText} →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="slide-dots" role="tablist" aria-label="Hero slides">
          {slides.map((s, k) => (
            <button key={s.headline} role="tab" aria-selected={k === i} aria-label={`Show slide ${k + 1}: ${s.headline}`} onClick={() => setI(k)} />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

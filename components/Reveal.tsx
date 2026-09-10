'use client';
import { useEffect } from 'react';

/** Adds the landing page's scroll-reveal to every `.reveal` element. */
export default function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      // The huge top rootMargin makes "at or above the current viewport" count as
      // intersecting. Without it, anything the browser lands past — a reload that
      // restores scroll position mid-page, an anchor link, a fast flick that leaps
      // a whole section between observer samples — stays at opacity 0 forever.
      { threshold: 0.12, rootMargin: '100000px 0px 0px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
  return null;
}

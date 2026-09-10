import React from 'react';

const P = { fill: 'none', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', 'aria-hidden': true };

export const Icon = {
  tooth: () => (
    <svg {...P}>
      <path d="M8 4C5.8 4 4 5.9 4 8.4 4 12 6 14 7 19c.3 1.5 2.3 1.5 2.6 0 .5-2.5.8-4.5 2.4-4.5s1.9 2 2.4 4.5c.3 1.5 2.3 1.5 2.6 0 1-5 3-7 3-10.6C20 5.9 18.2 4 16 4c-1.5 0-2.9.7-4 2-1.1-1.3-2.5-2-4-2z" />
    </svg>
  ),
  heart: () => (
    <svg {...P}>
      <path d="M12 21c-4.5-3.4-8-6.6-8-10.4C4 7 6.2 5 8.8 5c1.4 0 2.5.6 3.2 1.6C12.7 5.6 13.8 5 15.2 5 17.8 5 20 7 20 10.6c0 3.8-3.5 7-8 10.4z" />
    </svg>
  ),
  people: () => (
    <svg {...P}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
    </svg>
  ),
  check: () => (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12.5l2 2 4-5" />
    </svg>
  ),
  tick: () => (
    <svg {...P}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  star: () => (
    <svg {...P}>
      <path d="M12 3l1.9 4.7L19 8.4l-3.6 3.4.9 5.2L12 14.5 7.7 17l.9-5.2L5 8.4l5.1-.7L12 3z" />
    </svg>
  ),
  child: () => (
    <svg {...P}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h3a4.5 4.5 0 0 1 4.5 4.5V20" />
      <path d="M17 10.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4L17 10.5z" />
    </svg>
  ),
  implant: () => (
    <svg {...P}>
      <path d="M12 3v9M9 6.5h6M8 12h8l-1 8H9l-1-8z" />
    </svg>
  ),
  wave: () => (
    <svg {...P}>
      <path d="M4 15c1.5-1.6 3.5-1.6 5 0s3.5 1.6 5 0 3.5-1.6 5 0" />
      <path d="M4 10c1.5-1.6 3.5-1.6 5 0s3.5 1.6 5 0 3.5-1.6 5 0" />
    </svg>
  ),
  calendar: () => (
    <svg {...P}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </svg>
  ),
  chat: () => (
    <svg {...P}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  clock: () => (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  pin: () => (
    <svg {...P}>
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  ),
  eye: () => (
    <svg {...P}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  question: () => (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01" />
    </svg>
  ),
  pause: () => (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9v6M14 9v6" />
    </svg>
  ),
  shield: () => (
    <svg {...P}>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
    </svg>
  ),
  moon: () => (
    <svg {...P}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  ),
  smile: () => (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01" />
    </svg>
  ),
  card: () => (
    <svg {...P}>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20M6 15h4" />
    </svg>
  ),
  mail: () => (
    <svg {...P}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3 6.5l9 6 9-6" />
    </svg>
  ),
  phone: () => (
    <svg {...P}>
      <path d="M6.5 3.5h3l1.5 4-2 1.3a12 12 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
    </svg>
  ),
  spark: () => (
    <svg {...P}>
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
    </svg>
  ),
  arrow: () => (
    <svg {...P}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  plus: () => (
    <svg {...P}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  chevron: () => (
    <svg {...P} strokeWidth={2}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  menu: () => (
    <svg {...P} strokeWidth={2}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: () => (
    <svg {...P} strokeWidth={2}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  train: () => (
    <svg {...P}>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14M9 21l1.5-3M15 21l-1.5-3M9 14h.01M15 14h.01" />
    </svg>
  ),
  sun: () => (
    <svg {...P}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
};

export type IconName = keyof typeof Icon;

export function I({ name }: { name: IconName }) {
  const C = Icon[name];
  return <C />;
}

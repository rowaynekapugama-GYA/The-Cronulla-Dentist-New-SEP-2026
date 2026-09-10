'use client';

import { useEffect, useState } from 'react';

function parts(target: number) {
  let diff = target - Date.now();
  if (diff < 0) diff = 0;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

/** Countdown to opening day. Fixed box sizes + tabular-nums → no layout shift. */
export default function Countdown({ iso }: { iso: string }) {
  // No confirmed opening day yet -> no countdown (the "Opening late November
  // 2026" badge carries the message instead).
  if (!iso) return null;
  const target = new Date(iso).getTime();
  const [t, setT] = useState<ReturnType<typeof parts> | null>(null);
  useEffect(() => {
    setT(parts(target));
    const id = setInterval(() => setT(parts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="countdown" aria-label="Countdown to opening day" role="timer">
      <div className="count-box">
        <span className="count-num">{t ? t.d : '--'}</span>
        <span className="count-label">Days</span>
      </div>
      <div className="count-box">
        <span className="count-num">{t ? pad(t.h) : '--'}</span>
        <span className="count-label">Hours</span>
      </div>
      <div className="count-box">
        <span className="count-num">{t ? pad(t.m) : '--'}</span>
        <span className="count-label">Mins</span>
      </div>
      <div className="count-box">
        <span className="count-num">{t ? pad(t.s) : '--'}</span>
        <span className="count-label">Secs</span>
      </div>
    </div>
  );
}

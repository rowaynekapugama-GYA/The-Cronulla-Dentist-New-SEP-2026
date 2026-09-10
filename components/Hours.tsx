import { SITE_CONFIG } from '@/site.config';

/** Crawlable opening hours, rendered from SITE_CONFIG only. */
export function Hours({ compact = false, hooks = false }: { compact?: boolean; hooks?: boolean }) {
  return (
    <>
      <ul className="hours" aria-label="Opening hours">
        {SITE_CONFIG.hours.map((h) => (
          <li key={h.day} className={h.open ? '' : 'closed'}>
            <span>{compact ? h.day.slice(0, 3) : h.day}</span>
            <span>{h.label}</span>
          </li>
        ))}
      </ul>
      {hooks && (
        <div className="hours-hooks">
          <span className="pill">
            <span className="pill-dot" />
            {SITE_CONFIG.hooks.lateMonday}
          </span>
          <span className="pill">
            <span className="pill-dot" />
            {SITE_CONFIG.hooks.earlyFriday}
          </span>
        </div>
      )}
    </>
  );
}

import { SITE_CONFIG, fullAddress } from '@/site.config';

const APPLE_MAPS = 'https://maps.apple.com/?q=' + encodeURIComponent(`The Cronulla Dentists, ${'13 Cronulla Street, Cronulla NSW 2230'}`);

/**
 * Map panel — the practice's Google listing as an embedded map, with
 * click-to-map links for both Google and Apple Maps beneath it (SEO Doc 02,
 * launch checklist #23). Falls back to a styled address panel if the embed URL
 * is ever cleared.
 */
export function MapEmbed() {
  const google = SITE_CONFIG.gbpShareUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(fullAddress());
  return (
    <div className="map-block reveal">
      <div className="map">
        {SITE_CONFIG.mapEmbedUrl ? (
          <iframe src={SITE_CONFIG.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Map showing ${fullAddress()}`} allowFullScreen />
        ) : (
          <p>
            {fullAddress()}
            <br />
            <a href={google} target="_blank" rel="noopener">
              Open in Google Maps
            </a>
          </p>
        )}
      </div>
      {SITE_CONFIG.mapEmbedUrl && (
        <p className="map-links">
          <a href={google} target="_blank" rel="noopener">
            Open in Google Maps
          </a>
          <span aria-hidden="true"> · </span>
          <a href={APPLE_MAPS} target="_blank" rel="noopener">
            Apple Maps
          </a>
        </p>
      )}
    </div>
  );
}

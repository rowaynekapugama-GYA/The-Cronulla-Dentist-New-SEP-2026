import Script from 'next/script';
import { SITE_CONFIG } from '@/site.config';

/** Google Tag Manager — loads only when SITE_CONFIG.gtmId is set. */
export function GtmHead() {
  if (!SITE_CONFIG.gtmId) return null;
  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${SITE_CONFIG.gtmId}');`}
    </Script>
  );
}
/**
 * GA4 (gtag.js) — loads only when SITE_CONFIG.ga4Id is set.
 *
 * Deliberately separate from the GTM block above: a G-XXXXXXXXXX measurement ID
 * and a GTM-XXXXXXX container are different products, and dropping the GA4 ID
 * into the Tag Manager loader would not report anything. If a GTM container is
 * ever added, set gtmId as well — but then move GA4 INSIDE the container and
 * clear ga4Id here, or every pageview is counted twice.
 *
 * One tag only. The snippet supplied was pasted twice; a second copy of gtag.js
 * on the same page fires a duplicate page_view and inflates every session.
 */
export function Ga4() {
  if (!SITE_CONFIG.ga4Id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.ga4Id}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${SITE_CONFIG.ga4Id}');`}
      </Script>
    </>
  );
}

export function GtmBody() {
  if (!SITE_CONFIG.gtmId) return null;
  return (
    <noscript>
      <iframe src={`https://www.googletagmanager.com/ns.html?id=${SITE_CONFIG.gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="gtm" />
    </noscript>
  );
}

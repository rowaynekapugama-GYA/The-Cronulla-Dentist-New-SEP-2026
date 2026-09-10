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
export function GtmBody() {
  if (!SITE_CONFIG.gtmId) return null;
  return (
    <noscript>
      <iframe src={`https://www.googletagmanager.com/ns.html?id=${SITE_CONFIG.gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="gtm" />
    </noscript>
  );
}

/**
 * Two build targets:
 *  - default            → standard Next.js build for Vercel (Git import or `vercel deploy`).
 *  - STATIC_EXPORT=1    → plain static HTML in `out/` (see scripts/build-static.mjs).
 */
const isStatic = process.env.STATIC_EXPORT === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  ...(isStatic
    ? { output: 'export', images: { unoptimized: true } }
    : {
        images: {
          // WebP only. AVIF encoding is very slow without the optional `sharp`
          // binary (it falls back to WASM), and WebP already covers every browser
          // this audience uses. Add sharp and re-enable 'image/avif' first in this
          // array if you want AVIF later.
          formats: ['image/webp'],
          // No source image on this site is wider than 2400px, and the widest
          // next/image container is the 1160px content wrap. Dropping the default
          // 2048/3840 candidates stops Next upscaling (slow, heavy, and blurry).
          deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        },
      }),
};
export default nextConfig;

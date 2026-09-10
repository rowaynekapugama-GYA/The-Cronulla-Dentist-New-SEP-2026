import manifest from './image-manifest.json';

/**
 * Append a short content hash to a public image path: `/images/x.jpg?v=1a2b3c4d`.
 *
 * Why this exists. On Vercel every <Image> is served through the image
 * optimizer as `/_next/image?url=<source>&w=…&q=…`, and the optimized result is
 * cached against that key. The key contains the SOURCE PATH, not the source
 * bytes — so replacing `public/images/services/x.jpg` with a different photo at
 * the same filename leaves the key unchanged, and the CDN keeps serving the old
 * picture after the redeploy. Browsers do the same thing one layer up. That is
 * exactly the "I replaced the image but the site still shows the old one"
 * failure, and redeploying does not fix it, because nothing about the request
 * changed.
 *
 * Hashing the file contents into the query string makes the key move whenever
 * the picture moves, so a swap invalidates itself. An unchanged file keeps its
 * hash and therefore keeps its cache — no cost to the pages we did not touch.
 *
 * The hashes come from a generated manifest rather than reading the filesystem
 * here, so this module works unchanged in client components (Nav) as well as
 * server ones. scripts/gen-image-manifest.mjs regenerates it on every build.
 *
 * The offline preview strips `?v=` back off, because a file:// URL treats a
 * query string as part of the filename and the image would fail to load.
 */
const HASHES = manifest as Record<string, string>;

export function img(src: string): string {
  if (!src.startsWith('/images/')) return src;
  const hash = HASHES[src];
  // No hash means the file is not on disk. Hand back the plain path so the build
  // still succeeds and scripts/audit.mjs reports the broken image.
  return hash ? `${src}?v=${hash}` : src;
}

import NextImage, { type ImageProps } from 'next/image';
import { img } from '@/lib/img';

/**
 * Drop-in replacement for next/image that content-hashes the source path.
 * See lib/img.ts for why. Import this instead of 'next/image' everywhere, so a
 * swapped photo can never be served from a stale CDN entry.
 */
export default function Img(props: ImageProps) {
  const src = typeof props.src === 'string' ? img(props.src) : props.src;
  return <NextImage {...props} src={src} />;
}

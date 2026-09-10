import Link from 'next/link';
import { CtaButtons } from '@/components/Cta';

export default function NotFound() {
  return (
    <header className="hero-band" style={{ minHeight: '70svh' }}>
      <div className="wrap" style={{ textAlign: 'center' }}>
        <span className="kicker">404</span>
        <h1 className="h-display">
          That page is <span>not here</span>
        </h1>
        <p className="lede" style={{ margin: '1rem auto 2rem' }}>
          The link may be out of date. Try our <Link href="/services/">services</Link> or <Link href="/contact/">contact</Link> pages.
        </p>
        <CtaButtons center />
      </div>
    </header>
  );
}

import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG, telHref, featureOn } from '@/site.config';
import { ctaHref } from '@/lib/cta';
import type { Inline as InlineText, Node, Section } from '@/content/types';

/**
 * Renders the copy's tiny markdown subset.
 *  **bold**            → <strong>
 *  {{phone}}           → tel: link with SITE_CONFIG.phone
 *  {{email}}           → mailto: link with SITE_CONFIG.email
 *  [label](href)       → link; href "{{cta}}" resolves to the mode-aware CTA
 */
export function Inline({ text }: { text: InlineText }) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\{\{phone\}\}|\{\{email\}\}|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `t${i++}`;
    if (tok.startsWith('**')) {
      parts.push(
        <strong key={key}>
          <Inline text={tok.slice(2, -2)} />
        </strong>,
      );
    } else if (tok === '{{phone}}') {
      parts.push(
        <a key={key} href={telHref()}>
          {SITE_CONFIG.phone}
        </a>,
      );
    } else if (tok === '{{email}}') {
      parts.push(
        <a key={key} href={`mailto:${SITE_CONFIG.email}`}>
          {SITE_CONFIG.email}
        </a>,
      );
    } else {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      const href = lm[2] === '{{cta}}' ? ctaHref() : lm[2];
      parts.push(
        href.startsWith('http') ? (
          <a key={key} href={href} target="_blank" rel="noopener">
            {lm[1]}
          </a>
        ) : (
          <Link key={key} href={href}>
            {lm[1]}
          </Link>
        ),
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Strip markdown for plain-text contexts (schema, meta). */
export function plain(text: InlineText): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\{\{phone\}\}/g, SITE_CONFIG.phone)
    .replace(/\{\{email\}\}/g, SITE_CONFIG.email)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

export function nodeVisible(n: Node): boolean {
  if (n.gate && !featureOn(n.gate)) return false;
  if (n.type === 'p' && n.mode && n.mode !== SITE_CONFIG.mode) return false;
  return true;
}

export function Nodes({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.filter(nodeVisible).map((n, i) => {
        switch (n.type) {
          case 'p':
            return (
              <p key={i}>
                <Inline text={n.text} />
              </p>
            );
          case 'h4':
            return (
              <h4 key={i}>
                <Inline text={n.text} />
              </h4>
            );
          case 'ul':
            return (
              <ul key={i}>
                {n.items.map((it, j) => (
                  <li key={j}>
                    <Inline text={it} />
                  </li>
                ))}
              </ul>
            );
          case 'table':
            return (
              <table key={i}>
                <thead>
                  <tr>
                    {n.rows[0].map((c, j) => (
                      <th key={j} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {n.rows.slice(1).map((r, j) => (
                    <tr key={j}>
                      {r.map((c, k) => (
                        <td key={k}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
        }
      })}
    </>
  );
}

export function sectionVisible(s: Section): boolean {
  return !s.gate || featureOn(s.gate);
}

/** Prose sections with H3 headings. */
export function Sections({ sections, level = 3 }: { sections: Section[]; level?: 2 | 3 }) {
  // `level` keeps the heading order valid: 2 where these are the page's own
  // top-level sections (privacy, parking), 3 where they sit under an H2.
  const H = (level === 2 ? 'h2' : 'h3') as 'h2' | 'h3';
  return (
    <div className="prose">
      {sections.filter(sectionVisible).map((s) => (
        <section key={s.heading} aria-labelledby={slugify(s.heading)}>
          <H id={slugify(s.heading)}>{s.heading}</H>
          <Nodes nodes={s.nodes} />
        </section>
      ))}
    </div>
  );
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

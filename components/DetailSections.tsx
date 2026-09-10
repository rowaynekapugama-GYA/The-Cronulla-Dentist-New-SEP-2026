import type { Node, Section } from '@/content/types';
import { Inline, Nodes, nodeVisible, slugify } from '@/components/Inline';
import { I, type IconName } from '@/components/Icons';

/**
 * BLOCK 10 on every service page — the copy's detail sections.
 *
 * Rendered section by section down the page rather than as an accordion, so
 * nothing the client wrote is hidden behind a click (and so search engines see
 * it as body copy). Sections alternate white/sand for rhythm and each carries an
 * anchor id, with a jump list at the top.
 *
 * The copy already signals its own structure: many sections are written as a
 * short intro, then a run of paragraphs that each open with a bold lead-in
 * ("**We look, properly.** An examination of…"), then a closing line. A run of
 * two or more of those becomes a grid of icon cards; everything else stays as
 * prose. Nothing is reworded — only laid out.
 */

/** "**Lead-in.** rest of the sentence" → ["Lead-in.", "rest of the sentence"] */
const LEAD = /^\*\*(.+?)\*\*\s*([\s\S]*)$/;

interface CardItem {
  lead: string;
  rest: string;
  node: Node;
}
type Block = { kind: 'prose'; nodes: Node[] } | { kind: 'cards'; items: CardItem[] };

function toBlocks(nodes: Node[]): Block[] {
  const out: Block[] = [];
  let prose: Node[] = [];
  let run: CardItem[] = [];

  const flushProse = () => {
    if (prose.length) out.push({ kind: 'prose', nodes: prose });
    prose = [];
  };
  const flushRun = () => {
    // A single bold lead-in is just an emphasised sentence — leave it in the prose.
    if (run.length >= 2) {
      flushProse();
      out.push({ kind: 'cards', items: run });
    } else {
      prose.push(...run.map((r) => r.node));
    }
    run = [];
  };

  for (const n of nodes) {
    const m = n.type === 'p' ? LEAD.exec(n.text) : null;
    if (m) run.push({ lead: m[1], rest: m[2], node: n });
    else {
      flushRun();
      prose.push(n);
    }
  }
  flushRun();
  flushProse();
  return out;
}

/**
 * Pick an icon from what the lead-in actually says. Falls back to a rotating
 * neutral set so a card is never left without one.
 */
// Word boundaries matter here: without \b, "during" matches /ring/ and "implant"
// matches /plan/, which quietly assigns a phone or a payment-card icon.
const KEYWORDS: [RegExp, IconName][] = [
  [/\bx-?rays?\b|\bscans?\b|\bimaging\b/i, 'eye'],
  [/\blook\b|\bexamin|\bassess|\binspect/i, 'check'],
  [/\bclean|\bscaling\b|\bpolish|\bhygien|\bfluoride\b|\bbrush/i, 'spark'],
  [/\bconversation\b|\btell you\b|\bexplain|\bdiscuss|\bask\b|\banswer/i, 'chat'],
  [/\bbooking?\b|\bappointment|\bschedul|\bvisits?\b/i, 'calendar'],
  [/\bcalls?\b|\bphone\b|\bring\b/i, 'phone'],
  [/\bemails?\b/i, 'mail'],
  [/\bcosts?\b|\bprices?\b|\bpayments?\b|\bfees?\b|\bquote\b|\bhealth funds?\b|\brebate|\bclaim/i, 'card'],
  [/\bhow often\b|\bhow long\b|\bmonths?\b|\byears?\b|\bwait/i, 'clock'],
  [/\bchild|\bkids?\b|\bbaby\b|\bteen/i, 'child'],
  [/\bnight\b|\bsleep|\bsnor|\bgrind/i, 'moon'],
  [/\bprotect|\bprevent|\bguards?\b|\brisks?\b/i, 'shield'],
  [/\bgentle|\bcomfort|\bcalm|\bnervous\b|\banxious\b|\bpause\b|\bstop\b|\bslow/i, 'pause'],
  [/\bimplants?\b|\bcrowns?\b|\bbridges?\b|\bdenture|\brestor|\bfillings?\b/i, 'implant'],
  [/\bwhiten|\bsmile\b|\bcosmetic|\bshades?\b/i, 'smile'],
  [/\btooth\b|\bteeth\b|\benamel\b|\bdecay\b/i, 'tooth'],
  [/\bgums?\b|\bperiodont|\btissues?\b/i, 'heart'],
  [/\bparking\b|\bstreet\b|\bstation\b|\bwalk\b/i, 'pin'],
  [/\bteam\b|\bfamil(y|ies)\b|\btogether\b/i, 'people'],
];
const FALLBACK: IconName[] = ['check', 'star', 'tooth', 'heart', 'spark', 'shield'];

/**
 * `used` keeps two cards in the same grid from landing on the same icon, which
 * reads as a mistake when they sit side by side. Later keyword matches and then
 * the fallback set are tried before giving up and allowing a repeat.
 */
function iconFor(text: string, i: number, used: Set<IconName>): IconName {
  const matches = KEYWORDS.filter(([re]) => re.test(text)).map(([, name]) => name);
  for (const name of matches) if (!used.has(name)) return name;
  for (const name of FALLBACK) if (!used.has(name)) return name;
  return matches[0] ?? FALLBACK[i % FALLBACK.length];
}

export function DetailSections({ sections, title }: { sections: Section[]; title: string }) {
  if (!sections.length) return null;

  return (
    <>
      <section className="section section-white detail-nav-section" aria-labelledby="details-heading">
        <div className="detail-inner">
          <span className="kicker">In detail</span>
          <h2 id="details-heading" className="h-display detail-nav-title">
            {title}
          </h2>
          <nav className="detail-nav" aria-label="Jump to a section">
            {sections.map((s) => (
              <a key={s.heading} href={`#${slugify(s.heading)}`}>
                <span>{s.heading}</span>
                <I name="arrow" />
              </a>
            ))}
          </nav>
        </div>
      </section>

      {sections.map((s, i) => {
        const blocks = toBlocks(s.nodes.filter(nodeVisible));
        return (
          <section
            key={s.heading}
            id={slugify(s.heading)}
            className={`section detail-section ${i % 2 === 0 ? 'section-sand' : 'section-white'}`}
            aria-labelledby={`${slugify(s.heading)}-h`}
          >
            <div className="detail-inner">
              <span className="detail-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="detail-heading" id={`${slugify(s.heading)}-h`}>
                {s.heading}
              </h3>
              {blocks.map((b, bi) =>
                b.kind === 'prose' ? (
                  <div className="prose detail-prose" key={bi}>
                    <Nodes nodes={b.nodes} />
                  </div>
                ) : (
                  <div className={`detail-cards${b.items.length % 3 === 0 ? ' cols-3' : ''}`} key={bi}>
                    {((used) =>
                      b.items.map((it, ii) => {
                        const icon = iconFor(`${it.lead} ${it.rest}`, ii, used);
                        used.add(icon);
                        return (
                      <div className="detail-card" key={ii}>
                        <span className="detail-card-icon">
                          <I name={icon} />
                        </span>
                        {/* The lead-in keeps its full stop: the copy is rendered
                            verbatim and scripts/verify-copy.mjs checks it. */}
                        <h4>
                          <Inline text={it.lead} />
                        </h4>
                        <p>
                          <Inline text={it.rest} />
                        </p>
                      </div>
                        );
                      }))(new Set<IconName>())}
                  </div>
                ),
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}

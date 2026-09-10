/**
 * Ingests content/source/website-copy.md (client's final copy) into
 * structured JSON under content/pages/*.json.
 *
 * Rules (from the build brief):
 *  - Copy is used verbatim. Only normalisation done here is:
 *      [TO CONFIRM: Cronulla phone number] → {{phone}}  (rendered from SITE_CONFIG)
 *      thecaringbahdentists@gmail.com       → {{email}}  (brief wins on facts)
 *      other [TO CONFIRM: …] markers        → removed (reported below), never rendered
 *      cross-references like "our finances page" → same words, wrapped in a link
 *  - Gated content is tagged with `gate` so components can hide it while the flag is OFF.
 *
 * Re-run with:  node scripts/ingest-copy.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('content/source/website-copy.md');
const OUT = path.resolve('content/pages');
fs.mkdirSync(OUT, { recursive: true });

const md = fs.readFileSync(SRC, 'utf8');
const dropped = [];

// ---------- helpers ----------
const PHONE_MARK = /\[TO CONFIRM: Cronulla phone number\]/g;
const ANY_MARK = /\s*\[TO CONFIRM:[^\]]*\]\s*/g;

function clean(text) {
  let t = text.replace(PHONE_MARK, '{{phone}}').replace(/thecaringbahdentists@gmail\.com/g, '{{email}}');
  const marks = t.match(ANY_MARK);
  if (marks) {
    marks.forEach((m) => dropped.push(m.trim()));
    t = t.replace(ANY_MARK, ' ').replace(/\s{2,}/g, ' ').trim();
  }
  return t.trim();
}

const LINKS = [
  ['There is a full page on how this works.', '/dental-anxiety-cronulla/'],
  ['our dental anxiety page', '/dental-anxiety-cronulla/'],
  ['our finances page', '/finances/'],
  ['our periodontal treatment page', '/periodontal-treatment-cronulla/'],
  ['our periodontal treatment and gum disease pages', null], // handled specially below
  ['it has its own page', '/gingivitis-cronulla/'],
  ['our implants page', '/dental-implants-cronulla/'],
  ['our children’s dentistry page', '/childrens-dentistry-cronulla/'],
];
function autolink(text) {
  let t = text;
  t = t.replace(
    'Our periodontal treatment and gum disease pages cover what happens then.',
    'Our [periodontal treatment](/periodontal-treatment-cronulla/) and [gum disease](/gum-disease-treatment-cronulla/) pages cover what happens then.',
  );
  for (const [phrase, href] of LINKS) {
    if (!href) continue;
    if (t.includes(phrase) && !t.includes(`[${phrase}]`)) t = t.replace(phrase, `[${phrase}](${href})`);
  }
  // "book online" (lower-case, in running copy) → mode-aware CTA link ({{cta}} resolves in the renderer)
  t = t.replace(/(?<!\[)\bbook online\b(?!\])/g, '[book online]({{cta}})');
  return t;
}

/** Parse a page chunk into { metaBullets, blocks: [{title, nodes}] } */
function parsePage(chunk) {
  const lines = chunk.split('\n');
  const metaBullets = {};
  const blocks = [];
  let cur = null;
  let listBuf = null;
  let tableBuf = null;
  const flush = () => {
    if (listBuf && cur) cur.nodes.push({ type: 'ul', items: listBuf });
    if (tableBuf && cur) cur.nodes.push({ type: 'table', rows: tableBuf });
    listBuf = null;
    tableBuf = null;
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    const mb = line.match(/^- \*\*(.+?):\*\*\s*(.*)$/);
    if (mb && !cur) {
      metaBullets[mb[1]] = mb[2];
      continue;
    }
    if (line.startsWith('## ')) {
      flush();
      cur = { title: line.slice(3).trim(), nodes: [] };
      blocks.push(cur);
      continue;
    }
    if (!cur) continue;
    if (line.startsWith('### ')) {
      flush();
      cur.nodes.push({ type: 'h3', text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith('#### ')) {
      flush();
      cur.nodes.push({ type: 'h4', text: line.slice(5).trim() });
      continue;
    }
    if (line.startsWith('- ')) {
      if (tableBuf) flush();
      listBuf = listBuf || [];
      listBuf.push(line.slice(2).trim());
      continue;
    }
    if (line.startsWith('|')) {
      if (listBuf) flush();
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c))) continue;
      tableBuf = tableBuf || [];
      tableBuf.push(cells);
      continue;
    }
    flush();
    cur.nodes.push({ type: 'p', text: line.trim() });
  }
  flush();
  return { metaBullets, blocks };
}

/** Convert flat nodes (h3/h4/p/ul/table) into sections keyed by h3. */
function toSections(nodes, gates = {}) {
  const sections = [];
  let cur = null;
  const intro = [];
  for (const n of nodes) {
    if (n.type === 'h3') {
      cur = { heading: clean(n.text), nodes: [] };
      if (gates[cur.heading]) cur.gate = gates[cur.heading];
      sections.push(cur);
      continue;
    }
    const node = cleanNode(n);
    if (!node) continue;
    (cur ? cur.nodes : intro).push(node);
  }
  return { intro, sections };
}

function cleanNode(n) {
  if (n.type === 'p' || n.type === 'h4') {
    const hadMarker = ANY_MARK.test(n.text);
    ANY_MARK.lastIndex = 0;
    const text = autolink(clean(n.text));
    if (!text) return null;
    // "**Accessibility.** [TO CONFIRM…]" → a bare bold label with nothing to say; drop it.
    if (hadMarker && /^\*\*[^*]+\*\*$/.test(text)) return null;
    return { ...n, text };
  }
  if (n.type === 'ul') {
    const items = n.items.map((i) => autolink(clean(i))).filter(Boolean);
    return items.length ? { type: 'ul', items } : null;
  }
  if (n.type === 'table') return { type: 'table', rows: n.rows };
  return null;
}

function metaOf(mb, slugFallback) {
  const route = (mb['Page URL suggestion'] || '/').trim();
  const slug = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '');
  const mt = Object.keys(mb).find((k) => k.startsWith('Meta title'));
  const mdk = Object.keys(mb).find((k) => k.startsWith('Meta description'));
  return {
    slug: slug || slugFallback,
    route,
    title: '',
    metaTitle: (mb[mt] || '').trim(),
    metaDescription: (mb[mdk] || '').trim(),
    primaryKeyword: (mb['Primary keyword focus'] || '').trim(),
  };
}

const firstP = (block) => block?.nodes.find((n) => n.type === 'p')?.text || '';
const strip = (s, label) => clean(s.replace(new RegExp(`^\\*\\*${label}:\\*\\*\\s*`), ''));

/** "**Title** text Read more" cards */
function cardsFrom(block, hrefs = {}) {
  return block.nodes
    .filter((n) => n.type === 'p')
    .map((n) => {
      const m = n.text.match(/^\*\*(.+?)\*\*\s*(.*)$/);
      if (!m) return null;
      const title = m[1].trim();
      const text = clean(m[2].replace(/\s*Read more\s*$/, ''));
      const card = { title, text };
      if (hrefs[title]) card.href = hrefs[title];
      return card;
    })
    .filter(Boolean);
}

const ROUTES = {
  'General Dentistry': '/general-dentistry-cronulla/',
  'Children’s Dentistry': '/childrens-dentistry-cronulla/',
  'Cosmetic Dentistry': '/cosmetic-dentistry-cronulla/',
  'Restorative Dentistry': '/restorative-dentistry-cronulla/',
  'Emergency Dentistry': '/emergency-dentist-cronulla/',
  'Dental Anxiety': '/dental-anxiety-cronulla/',
  'Root Canal Therapy': '/root-canal-therapy-cronulla/',
  'Wisdom Teeth Removal': '/wisdom-teeth-removal-cronulla/',
  'Dental Crowns and Bridges': '/dental-crowns-bridges-cronulla/',
  'Periodontal Treatment': '/periodontal-treatment-cronulla/',
  'Tooth Coloured Fillings': '/tooth-coloured-fillings-cronulla/',
  Dentures: '/dentures-cronulla/',
  Gingivitis: '/gingivitis-cronulla/',
  'Anti-Snoring and Sleep Apnoea': '/anti-snoring-sleep-apnoea-cronulla/',
  'Hygiene Treatments': '/hygiene-treatments-cronulla/',
  'Dental Implants': '/dental-implants-cronulla/',
  'Mouth and Night Guards': '/mouth-night-guards-cronulla/',
};

const CATEGORY = {
  'general-dentistry-cronulla': 'general',
  'childrens-dentistry-cronulla': 'children',
  'cosmetic-dentistry-cronulla': 'cosmetic',
  'restorative-dentistry-cronulla': 'restorative',
  'teeth-whitening-cronulla': 'cosmetic',
  'dental-veneers-cronulla': 'cosmetic',
  'dental-implants-cronulla': 'restorative',
  'dental-crowns-bridges-cronulla': 'restorative',
  'dental-anxiety-cronulla': 'general',
  'emergency-dentist-cronulla': 'general',
  'finances': 'other',
  'hygiene-treatments-cronulla': 'gum',
  'gingivitis-cronulla': 'gum',
  'gum-disease-treatment-cronulla': 'gum',
  'periodontal-treatment-cronulla': 'gum',
  'root-canal-therapy-cronulla': 'restorative',
  'dentures-cronulla': 'restorative',
  'tooth-coloured-fillings-cronulla': 'restorative',
  'wisdom-teeth-removal-cronulla': 'general',
  'mouth-night-guards-cronulla': 'general',
  'anti-snoring-sleep-apnoea-cronulla': 'other',
  'kids-gap-free-dentistry-cronulla': 'children',
  'payment-plans': 'other',
};

// ---------- split pages ----------
const chunks = md.split(/^# Page \d+: /m).slice(1);
const pages = chunks.map((c) => {
  const nl = c.indexOf('\n');
  return { name: c.slice(0, nl).trim(), body: c.slice(nl + 1) };
});

function write(page) {
  fs.writeFileSync(path.join(OUT, `${page.meta.slug}.json`), JSON.stringify(page, null, 2) + '\n');
  console.log('wrote', page.meta.slug);
}

// ---------- SERVICE TEMPLATE ----------
function buildService(p, opts = {}) {
  const { metaBullets, blocks } = parsePage(p.body);
  const b = (n) => blocks.find((x) => x.title.startsWith(`BLOCK ${n}:`));
  const meta = metaOf(metaBullets);
  meta.title = opts.title || p.name.split(' / ')[0];
  if (opts.gate) meta.gate = opts.gate;
  if (opts.metaGated) Object.assign(meta, opts.metaGated);
  const { intro: body } = toSections(b(6).nodes);
  const { sections: details } = toSections(b(10).nodes, opts.sectionGates || {});
  // node-level gates
  if (opts.nodeGates) {
    for (const s of details) {
      for (const n of s.nodes) {
        for (const [prefix, gate] of opts.nodeGates) if (n.text?.startsWith(prefix)) n.gate = gate;
      }
    }
  }
  const page = {
    kind: 'service',
    meta,
    h1: strip(firstP(b(1)), 'H1'),
    breadcrumb: firstP(b(2)).split('>').map((s) => s.trim()),
    eyebrow: firstP(b(3)),
    h2: strip(firstP(b(4)), 'H2'),
    hook: clean(firstP(b(5))),
    body,
    ctaBand: clean(firstP(b(9))),
    details,
    closingCta: clean(firstP(b(11))),
    category: CATEGORY[meta.slug] || 'other',
    image: { src: `/images/services/${meta.slug}.jpg`, alt: opts.alt || `${meta.title} at The Cronulla Dentists` },
  };
  if (opts.gatedText) page.gatedText = opts.gatedText;
  write(page);
}

// ---------- HOME ----------
function buildHome(p) {
  const { metaBullets, blocks } = parsePage(p.body);
  const b = (n) => blocks.find((x) => x.title.startsWith(`BLOCK ${n}:`));
  const meta = metaOf(metaBullets);
  meta.title = 'Home';
  const slides = b(1).nodes.map((n) => {
    const m = n.text.match(/^\*\*Slide \d\*\*\s*Headline:\s*(.+?)\s*Subline:\s*(.+?)(?:\s*Link text:\s*(.+?))?\s*Button:.*$/);
    return { headline: m[1].trim(), sub: clean(m[2]), linkText: m[3]?.trim() };
  });
  slides[1].gate = 'emergency';
  slides[1].linkHref = '/emergency-dentist-cronulla/';
  slides[2].linkHref = '/dental-anxiety-cronulla/';
  const b3 = b(3).nodes.map((n) => n.text);
  const welcomeNodes = b(7).nodes.map((n) => n.text);
  const categoryCards = cardsFrom(b(8), ROUTES);
  const emergencyIdx = categoryCards.findIndex((c) => c.title === 'Emergency Dentistry');
  categoryCards[emergencyIdx].gate = 'emergency';
  // fallback card uses the copy's own Cosmetic Dentistry card from the Services Hub (verbatim)
  categoryCards[emergencyIdx].fallback = {
    title: 'Cosmetic Dentistry',
    text: 'Whitening, veneers and conservative options for the appearance of your smile.',
    href: ROUTES['Cosmetic Dentistry'],
  };
  const t = b(9);
  const paymentLines = b(11).nodes.filter((n) => /^\*\*H3:\*\*/.test(n.text)).map((n) => strip(n.text, 'H3'));
  const noteNodes = b(12).nodes.map((n) => n.text);
  const page = {
    kind: 'home',
    meta,
    slides,
    providers: firstP(b(2)).replace(/\.$/, '').split(',').map((s) => s.trim()),
    h1: strip(b3[0], 'H1'),
    h2: strip(b3[1], 'H2'),
    h3: strip(b3[2], 'H3'),
    pillars: cardsFrom(b(4)),
    ctaBand: clean(firstP(b(5))),
    welcome: {
      h2: strip(welcomeNodes[0], 'H2'),
      h3: strip(welcomeNodes[1], 'H3'),
      paragraphs: welcomeNodes.slice(2, -1).map(clean).map(autolink),
    },
    categoryCards,
    treatments: {
      h2: strip(t.nodes[0].text, 'H2'),
      h3: strip(t.nodes[1].text, 'H3'),
      tiles: cardsFrom({ nodes: t.nodes.slice(2) }, ROUTES),
    },
    iconBlocks: cardsFrom(b(10)),
    paymentBand: { h2: strip(b(11).nodes[0].text, 'H2'), lines: paymentLines, logo: 'DentiCare' },
    note: {
      h2: strip(noteNodes[1], 'H2'),
      h3: strip(noteNodes[2], 'H3'),
      paragraphs: noteNodes.slice(3, -1).map(clean),
      signoff: clean(noteNodes[noteNodes.length - 1]).replace(/\*\*/g, ''),
    },
  };
  write(page);
}

// ---------- SERVICES HUB ----------
function buildHub(p) {
  const { metaBullets, blocks } = parsePage(p.body);
  const b = (n) => blocks.find((x) => x.title.startsWith(`BLOCK ${n}:`));
  const meta = metaOf(metaBullets);
  meta.title = 'Services';
  meta.metaDescriptionGated =
    'General, children’s, cosmetic and restorative dentistry at 13 Cronulla Street, Cronulla. Serving Woolooware, Burraneer and the Sutherland Shire.';
  const b1 = b(1);
  const featuredTitles = firstP(b(2)).split('**').map((s) => s.trim()).filter(Boolean);
  const featured = featuredTitles.map((title) => ({ title, href: ROUTES[title], text: '' }));
  featured[0].gate = 'emergency';
  featured[0].fallback = { title: 'General Dentistry', href: ROUTES['General Dentistry'], text: '' };
  const blurbs = cardsFrom(b(3), ROUTES);
  blurbs.find((c) => c.title === 'Emergency Dentistry').gate = 'emergency';
  const c5 = b(5).nodes.map((n) => n.text);
  const page = {
    kind: 'hub',
    meta,
    h1: strip(b1.nodes[0].text, 'H1'),
    intro: strip(b1.nodes[1].text, 'Bold intro'),
    serviceList: b1.nodes.find((n) => n.type === 'ul').items,
    closingLine: strip(b1.nodes.find((n) => n.text?.startsWith('**Bold closing line')).text, 'Bold closing line'),
    featured,
    blurbs,
    categoryCards: cardsFrom(b(4), ROUTES),
    closing: {
      h2: strip(c5[0], 'H2'),
      paragraphs: c5.slice(1, -2).map(clean),
      closingLine: strip(c5[c5.length - 2], 'Bold closing line'),
    },
  };
  write(page);
}

// ---------- PROSE (About, Parking, Privacy) ----------
function buildProse(p, opts) {
  const { metaBullets, blocks } = parsePage(p.body);
  const meta = metaOf(metaBullets);
  meta.title = opts.title;
  if (opts.noindex) meta.noindex = true;
  const h1Block = blocks.find((x) => x.title.startsWith('H1:'));
  const { intro, sections } = toSections(h1Block.nodes, opts.sectionGates || {});
  for (const s of sections) if (opts.dropSections?.includes(s.heading)) s.nodes = [];
  if (opts.filterNodes) for (const s of sections) s.nodes = s.nodes.filter((n) => opts.filterNodes(n, s));
  const page = {
    kind: 'prose',
    meta,
    h1: h1Block.title.replace(/^H1:\s*/, '').trim(),
    intro: intro.map((n) => n.text).filter(Boolean),
    sections: sections.filter((s) => s.nodes.length || opts.keepEmpty?.includes(s.heading)),
  };
  if (opts.breadcrumb) page.breadcrumb = opts.breadcrumb;
  write(page);
}

// ---------- CONTACT ----------
function buildContact(p) {
  const { metaBullets, blocks } = parsePage(p.body);
  const meta = metaOf(metaBullets);
  meta.title = 'Contact';
  const h1Block = blocks.find((x) => x.title.startsWith('H1:'));
  const { sections } = toSections(h1Block.nodes, { 'Dental emergencies': 'emergency' });
  // The form itself is a component; drop the placeholder line.
  const form = sections.find((s) => s.heading === 'Send us a message');
  if (form) form.nodes = [];
  // Online booking does not exist before opening → render only in 'open' mode.
  for (const s of sections) for (const n of s.nodes) if (n.text?.startsWith('**Online.**')) n.mode = 'open';
  // Parking/accessibility markers dropped; parking summary rendered by the component.
  write({ kind: 'contact', meta, h1: h1Block.title.replace(/^H1:\s*/, '').trim(), sections });
}

// ---------- run ----------
for (const p of pages) {
  const n = p.name;
  if (n === 'Home') buildHome(p);
  else if (n.startsWith('About')) {
    buildProse(p, {
      title: 'About',
      filterNodes: (node) => !(node.type === 'p' && node.text === 'Call {{phone}} or book online.' && false),
    });
  } else if (n === 'Services Hub') buildHub(p);
  else if (n === 'Contact') buildContact(p);
  else if (n === 'Parking Information') {
    buildProse(p, {
      title: 'Parking',
      // Parking section is entirely [TO CONFIRM]; author notes are not client copy.
      filterNodes: (node, s) =>
        !(s.heading === 'Parking') && !/^\*\*(Suggested wording|Recommendation)/.test(node.text || ''),
    });
  } else if (n === 'Privacy Policy') {
    buildProse(p, {
      title: 'Privacy Policy',
      noindex: true,
      filterNodes: (node) => !/^\*\*Last updated:\*\*/.test(node.text || ''),
    });
  } else if (n === 'Emergency Dentistry') buildService(p, { gate: 'emergency', alt: 'Emergency dental care at The Cronulla Dentists' });
  else if (n === 'Kids’ Gap Free Dentistry') buildService(p, { gate: 'cdbs', title: 'Kids’ Gap Free Dentistry' });
  else if (n.startsWith('Children')) buildService(p, { title: 'Children’s Dentistry', sectionGates: { 'The Child Dental Benefits Schedule': 'cdbs' } });
  else if (n.startsWith('Finances'))
    buildService(p, { title: 'Finances', nodeGates: [['**Child Dental Benefits Schedule.**', 'cdbs']] });
  else if (n.startsWith('Payment Plans'))
    buildService(p, {
      title: 'Payment Plans',
      sectionGates: { Zip: 'zipAfterpay', Afterpay: 'zipAfterpay' },
      metaGated: {
        metaTitleGated: 'Payment Plans | DentiCare | Cronulla',
        metaDescriptionGated:
          'Spread the cost of dental treatment with DentiCare at 13 Cronulla Street, Cronulla. How it works and what to consider first.',
      },
      // Shown while zipAfterpay is OFF (the page then describes DentiCare only).
      gatedText: {
        hook: 'Need to spread the cost of treatment? A payment plan option is available for larger treatment plans.',
        bodyIntro: 'A payment plan option is available at 13 Cronulla Street. It is provided by a third party rather than by us.',
      },
    });
  else if (n === 'Dental Anxiety / Nervous Patients') buildService(p, { title: 'Dental Anxiety' });
  else if (n === 'Dental Crowns and Bridges') buildService(p, { title: 'Crowns & Bridges' });
  else if (n === 'Mouth and Night Guards') buildService(p, { title: 'Mouth & Night Guards' });
  else if (n === 'Anti-Snoring and Sleep Apnoea') buildService(p, { title: 'Anti-Snoring & Sleep Apnoea' });
  else buildService(p, {});
}

console.log('\nDropped [TO CONFIRM] markers (never rendered):');
for (const d of [...new Set(dropped)]) console.log('  -', d);

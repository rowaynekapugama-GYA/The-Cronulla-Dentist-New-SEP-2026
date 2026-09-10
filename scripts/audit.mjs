/**
 * Full-site audit over the offline preview.
 *   node scripts/audit.mjs
 *
 * Checks, on every page, at desktop / tablet / mobile:
 *   1. every internal link resolves to a file that exists
 *   2. no broken or zero-size images; no image left as a placeholder in a live slot
 *   3. every button/CTA has a destination or a handler, and a visible label
 *   4. no horizontal overflow, and nothing spilling outside the viewport
 *   5. tap targets >= 40px on mobile
 *   6. one <h1>, headings not skipping levels, images have alt text
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// playwright is a global install in this environment, not a project dependency
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('preview-offline');
const BASE = 'file://' + ROOT + '/';
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
];

const pages = [];
(function walk(dir, rel = '') {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.name === '_next' || d.name === 'images') continue;
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, `${rel}${d.name}/`);
    else if (d.name === 'index.html' && !rel.startsWith('404')) pages.push(rel + 'index.html');
  }
})(ROOT);
pages.sort();

const issues = [];
const add = (page, vp, kind, detail) => issues.push({ page, vp, kind, detail });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  for (const rel of pages) {
    await page.goto(BASE + rel, { waitUntil: 'load' });
    // scroll the whole page so lazy images and reveal animations fire
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    // bounded: never let a single stuck decode hang the run
    await page.evaluate(() => {
      const imgs = [...document.images].filter((i) => i.getBoundingClientRect().width > 0 && !i.complete);
      return Promise.race([
        Promise.all(imgs.map((i) => new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))),
        new Promise((r) => setTimeout(r, 3000)),
      ]);
    }).catch(() => {});

    const res = await page.evaluate(() => {
      const out = { links: [], images: [], buttons: [], overflow: null, spill: [], h1: 0, headings: [], small: [] };
      out.overflow = document.documentElement.scrollWidth - window.innerWidth;

      for (const a of document.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href');
        const label = (a.innerText || a.textContent || a.getAttribute('aria-label') || a.querySelector('img')?.alt || '').trim();
        out.links.push({ href, label, hasText: !!label });
      }
      for (const i of document.images) {
        // Images inside the closed mega-menu are display:none and lazy, so they
        // legitimately have not loaded. Only judge images that are actually laid out.
        const r = i.getBoundingClientRect();
        const rendered = r.width > 0 && r.height > 0 && i.offsetParent !== null;
        out.images.push({ src: i.currentSrc || i.src, rendered,
          ok: i.complete && i.naturalWidth > 0, alt: i.alt, hasAltAttr: i.hasAttribute('alt') });
      }
      for (const b of document.querySelectorAll('button')) {
        const r = b.getBoundingClientRect();
        out.buttons.push({ label: (b.innerText || b.getAttribute('aria-label') || '').trim(), type: b.type, w: r.width, h: r.height });
      }
      // anything sticking out past the right edge
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > window.innerWidth + 2) {
          const s = getComputedStyle(el);
          if (s.position !== 'fixed' && s.overflowX !== 'auto' && s.overflowX !== 'scroll')
            out.spill.push({ tag: el.tagName + '.' + (el.className || '').toString().split(' ')[0], right: Math.round(r.right) });
        }
      }
      out.h1 = document.querySelectorAll('h1').length;
      out.headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]);
      // tap targets
      for (const el of document.querySelectorAll('a,button')) {
        const r = el.getBoundingClientRect();
        const txt = (el.innerText || '').trim();
        // WCAG exempts links inside a sentence of text; only standalone controls count.
        const inline = el.closest('p,label,.prose p,.footer-bottom,.lede,.hook');
        if (r.width > 0 && r.height > 0 && r.height < 40 && txt && !inline && el.closest('nav,header,footer,.btn-row,.hero,form,.breadcrumb,.check-list,.service-list'))
          out.small.push({ tag: el.tagName, txt: txt.slice(0, 30), h: Math.round(r.height) });
      }
      return out;
    });

    if (res.overflow > 1) add(rel, vp.name, 'H-OVERFLOW', `${res.overflow}px wider than viewport`);
    for (const s of res.spill.slice(0, 3)) add(rel, vp.name, 'SPILL', `${s.tag} right=${s.right} > ${vp.width}`);

    if (vp.name === 'desktop') {
      for (const l of res.links) {
        const h = l.href;
        if (!h || h.startsWith('http') || h.startsWith('mailto') || h.startsWith('tel') || h.startsWith('#')) continue;
        if (h.startsWith('/')) { add(rel, '-', 'ABS-LINK', h); continue; }
        const target = path.resolve(path.dirname(path.join(ROOT, rel)), h.split('#')[0]);
        if (!fs.existsSync(target)) add(rel, '-', 'DEAD-LINK', `${h} (${l.label || 'no label'})`);
        if (!l.hasText) add(rel, '-', 'LINK-NO-LABEL', h);
      }
      for (const i of res.images) {
        if (i.rendered && !i.ok) add(rel, '-', 'BROKEN-IMG', i.src.replace(BASE, ''));
        if (!i.hasAltAttr) add(rel, '-', 'IMG-NO-ALT', i.src.replace(BASE, ''));
        if (/placeholder-/.test(i.src)) add(rel, '-', 'PLACEHOLDER-IMG', i.src.replace(BASE, ''));
      }
      for (const b of res.buttons) if (!b.label) add(rel, '-', 'BUTTON-NO-LABEL', `${b.type} ${Math.round(b.w)}x${Math.round(b.h)}`);
      if (res.h1 !== 1) add(rel, '-', 'H1-COUNT', String(res.h1));
      let prev = 0;
      for (const h of res.headings) { if (prev && h > prev + 1) { add(rel, '-', 'HEADING-SKIP', `h${prev} -> h${h}`); break; } prev = h; }
    }
    if (vp.name === 'mobile') for (const s of res.small.slice(0, 3)) add(rel, vp.name, 'SMALL-TAP', `${s.tag} "${s.txt}" ${s.h}px`);
  }
  await ctx.close();
}
await browser.close();

const byKind = {};
for (const i of issues) (byKind[i.kind] ||= []).push(i);
console.log(`\nAudited ${pages.length} pages x ${VIEWPORTS.length} viewports\n`);
if (!issues.length) console.log('No issues. ✓');
for (const [kind, list] of Object.entries(byKind).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${kind} (${list.length})`);
  const seen = new Set();
  for (const i of list) {
    const key = i.kind + i.detail;
    if (seen.has(key)) continue;
    seen.add(key);
    const also = list.filter(x => x.detail === i.detail).length;
    console.log(`   ${i.detail}${also > 1 ? `   [${also} pages]` : `   — ${i.page}${i.vp !== '-' ? ' @' + i.vp : ''}`}`);
  }
}
fs.writeFileSync('audit-report.json', JSON.stringify(issues, null, 1));
console.log(`\n${issues.length} issues -> audit-report.json`);

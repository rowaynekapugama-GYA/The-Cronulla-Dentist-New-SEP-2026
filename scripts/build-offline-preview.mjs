/**
 * Makes `preview-offline/` — the same static pages, but with every path rewritten
 * to be relative and every internal link pointed at `index.html`, so you can
 * double-click `preview-offline/index.html` and browse the whole site from disk
 * (no server, no build, works offline).
 *
 *   npm run build:static      # produces static-site/  (upload this to Vercel)
 *   npm run preview:offline   # produces preview-offline/ (open index.html to review)
 *
 * Use static-site/ for hosting — it keeps clean URLs. Use preview-offline/ only
 * for looking at the design.
 */
import fs from 'node:fs';
import path from 'node:path';

const src = path.resolve('static-site');
const dest = path.resolve('preview-offline');
if (!fs.existsSync(src)) {
  console.error('static-site/ not found — run `npm run build:static` first.');
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
fs.rmSync(path.join(dest, 'api'), { recursive: true, force: true });
fs.rmSync(path.join(dest, 'vercel.json'), { force: true });

/** Every route that exists as a directory with an index.html. */
const routes = new Set(['/']);
const walkDirs = (dir, base = '') => {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name === '_next' || d.name === 'images') continue;
    const rel = `${base}/${d.name}`;
    if (fs.existsSync(path.join(dir, d.name, 'index.html'))) routes.add(`${rel}/`);
    walkDirs(path.join(dir, d.name), rel);
  }
};
walkDirs(dest);

const htmlFiles = [];
const walkHtml = (dir) => {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walkHtml(p);
    else if (d.name.endsWith('.html')) htmlFiles.push(p);
  }
};
walkHtml(dest);

for (const file of htmlFiles) {
  const depth = path.relative(dest, path.dirname(file)).split(path.sep).filter(Boolean).length;
  const up = depth === 0 ? './' : '../'.repeat(depth);
  let html = fs.readFileSync(file, 'utf8');

  // 1. Internal page links → relative + explicit index.html (file:// has no directory index).
  //    Each route is rewritten in three shapes: bare ("/about/"), with a fragment
  //    ("/about/#meet-the-team") and with a query — plus the backslash-escaped
  //    variants that appear inside the inlined React payload. Missing the
  //    fragment form is what used to leave the About menu's "Meet the team" card
  //    pointing at file:///about/, which the browser reports as ERR_FILE_NOT_FOUND.
  for (const route of routes) {
    if (route === '/') continue;
    const target = `${up}${route.slice(1)}index.html`;
    for (const suffix of ['"', '#', '?']) {
      html = html.split(`"${route}${suffix}`).join(`"${target}${suffix}`);
      html = html.split(`\\"${route}${suffix}`).join(`\\"${target}${suffix}`);
    }
  }
  html = html.split('href="/"').join(`href="${up}index.html"`).split('\\"href\\":\\"/\\"').join(`\\"href\\":\\"${up}index.html\\"`);

  // 1b. Favicon / app-icon links are root-absolute too. Harmless (they only set
  //     the tab icon) but they log a failed request on every page from disk.
  for (const icon of ['favicon.ico', 'icon.png', 'apple-icon.png']) {
    html = html.split(`href="/${icon}`).join(`href="${up}${icon}`);
  }

  // 1c. Strip the ?v=<hash> cache-buster off image paths (see lib/img.ts). Over
  //     HTTP it is what forces Vercel's image cache to refresh after a photo is
  //     swapped, but a file:// URL treats the query as part of the FILENAME, so
  //     "x.jpg?v=1a2b3c4d" is simply a file that does not exist and every image
  //     on the page renders blank.
  html = html.replace(/(\/images\/[^"'()\\\s]+?)\?v=[a-f0-9]+/g, '$1');

  // 2. Assets and chunk paths (also inside the inlined React payload) → relative.
  html = html.split('"/_next/').join(`"${up}_next/`).split('\\"/_next/').join(`\\"${up}_next/`);
  html = html.split('"/images/').join(`"${up}images/`).split('\\"/images/').join(`\\"${up}images/`);
  html = html.split('(/_next/').join(`(${up}_next/`); // url() in inline styles

  // 3. Drop the hosting-build guard — this folder is the one it points people to.
  html = html.replace(/<script>\s*\/\*\*\s*\n \* Injected into every page of static-site\/[\s\S]*?<\/script>/, '');

  // 4. file:// treats each page as a unique origin, so crossorigin font preloads are refused.
  html = html.split(' crossorigin=""').join('');

  // 5. Client-side routing can't work from disk — let every link do a normal page load.
  html = html.replace('</body>', `<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a&&!a.target&&a.getAttribute('href').indexOf('#')!==0&&a.getAttribute('href').indexOf('mailto')!==0&&a.getAttribute('href').indexOf('tel:')!==0&&a.getAttribute('href').indexOf('http')!==0){e.preventDefault();e.stopPropagation();location.href=a.getAttribute('href');}},true);</script></body>`);

  fs.writeFileSync(file, html);
}

// Fonts and the hero background are referenced from the stylesheet, which lives at
// _next/static/css/ — three levels down from the site root.
for (const css of fs.readdirSync(path.join(dest, '_next', 'static', 'css'))) {
  const p = path.join(dest, '_next', 'static', 'css', css);
  const rewritten = fs
    .readFileSync(p, 'utf8')
    .split("url('/images/")
    .join("url('../../../images/")
    .split('url(/images/')
    .join('url(../../../images/')
    .split('url(/_next/static/media/')
    .join('url(../media/');
  fs.writeFileSync(p, rewritten);
}

fs.writeFileSync(
  path.join(dest, 'READ-ME-FIRST.txt'),
  `The Cronulla Dentists — offline design preview
=============================================

Open _all-pages.html for a clickable list of all 28 pages, or index.html to
start at the home page. Every page links to every other page, images and
fonts load from disk, and the countdown, hero slider, mobile menu and
accordions all work. No server needed.

This folder is FOR LOOKING AT ONLY. Do not upload it — the links point at
"index.html" files, which is wrong for a live site. Upload static-site/
instead (clean URLs, plus the two form functions).

Where to edit what:
  Copy/wording ....... content/source/website-copy.md, then re-run
                       node scripts/ingest-copy.mjs
  Colours, spacing,
  fonts, components ... app/globals.css
  Phone, email, hours,
  opening date, flags . site.config.ts
  Page layout/order ... app/page.tsx (home), components/ServiceTemplate.tsx
                       (all service pages), app/services, app/contact,
                       components/ProseTemplate.tsx (about, parking, privacy)

After any change: npm run build:static && npm run preview:offline
`,
);

// A jump-off index so every page is one click away during review.
const titleOf = (file) => (fs.readFileSync(file, 'utf8').match(/<title>([^<]*)<\/title>/) || [, ''])[1].replace(/&amp;/g, '&').replace(/&#x27;|&rsquo;/g, '\u2019');
const rows = [...routes]
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)))
  .filter((r) => r !== '/404/')
  .map((r) => {
    const file = path.join(dest, r.slice(1), 'index.html');
    return `<tr><td><a href=".${r}index.html">${titleOf(file) || r}</a></td><td><code>${r}</code></td></tr>`;
  })
  .join('\n');
fs.writeFileSync(
  path.join(dest, '_all-pages.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>All pages — design review</title><style>
body{font:16px/1.6 -apple-system,Segoe UI,sans-serif;color:#0A2749;background:#F7F5F1;margin:0;padding:3rem 1.5rem}
.w{max-width:820px;margin:0 auto;background:#fff;border-radius:20px;padding:2.5rem;box-shadow:0 20px 50px rgba(14,53,102,.10)}
h1{font-size:1.6rem;margin:0 0 .3rem;color:#0E3566}p{color:#4A5866;margin:0 0 1.6rem}
table{border-collapse:collapse;width:100%}td{padding:.6rem .5rem;border-bottom:1px solid #E6EDF3}
td:last-child{text-align:right}code{color:#5C6B7A;font-size:.82rem}
a{color:#0E3566;text-decoration:none;font-weight:500}a:hover{color:#26B8DB}
.n{background:#E4F6FB;border-radius:14px;padding:1rem 1.2rem;font-size:.9rem;color:#0E3566;margin-bottom:1.6rem}
</style></head><body><div class="w">
<h1>The Cronulla Dentists — all pages</h1>
<p>Offline design review copy. Click any page; the site navigates normally from there.</p>
<div class="n"><strong>Not shown:</strong> Emergency Dentistry and Kids&rsquo; Gap Free Dentistry are built but gated OFF, so they are not exported. Zip &amp; Afterpay sections on Payment Plans are hidden for the same reason. Flip the flags in <code>site.config.ts</code> and re-export to see them.</div>
<table>${rows}</table>
</div></body></html>
`,
);

console.log(`✓ preview-offline/ ready — ${htmlFiles.length} pages, open preview-offline/index.html`);

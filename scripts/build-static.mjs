/**
 * Builds a plain static HTML version of the site into `static-site/`,
 * for dragging into Vercel (or any static host) without a build step.
 *
 *   npm run build:static
 *
 * What it does:
 *   1. Moves app/api aside (route handlers cannot be statically exported).
 *   2. Runs `next build` with STATIC_EXPORT=1 → output:'export', unoptimized images.
 *   3. Copies out/ → static-site/
 *   4. Adds Vercel Functions at static-site/api/{eoi,contact}.js so the EOI and
 *      contact forms keep working (same SMTP2GO → SmileOx relay, same env vars).
 *   5. Restores app/api.
 *
 * Caveat: `mode` and the feature flags in site.config.ts are baked in at export time.
 * Change one → re-run this script → re-upload.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiDir = path.join(root, 'app', 'api');
const apiStash = path.join(root, '.api-stash');
const out = path.join(root, 'out');
const dest = path.join(root, 'static-site');

function restore() {
  if (fs.existsSync(apiStash)) {
    fs.rmSync(apiDir, { recursive: true, force: true });
    fs.renameSync(apiStash, apiDir);
  }
}
process.on('exit', restore);
process.on('SIGINT', () => process.exit(1));

console.log('→ stashing app/api (route handlers are not statically exportable)');
fs.rmSync(apiStash, { recursive: true, force: true });
fs.renameSync(apiDir, apiStash);

console.log('→ next build (static export)');
fs.rmSync(out, { recursive: true, force: true });
fs.rmSync(path.join(root, '.next'), { recursive: true, force: true });
execSync('npx next build', { stdio: 'inherit', env: { ...process.env, STATIC_EXPORT: '1' } });

console.log('→ copying out/ → static-site/');
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(out, dest, { recursive: true });

// A page in this folder only renders correctly when it is SERVED from the site
// root — its asset paths are absolute (/_next/...), which is right for hosting and
// wrong for double-clicking. Inject a self-diagnosing notice so that mistake
// explains itself instead of looking like a broken build.
console.log('→ injecting the "stylesheet did not load" guard');
const GUARD = '<script>' + fs.readFileSync(path.join(root, 'scripts', 'static-guard.js'), 'utf8') + '</script>';
let guarded = 0;
const inject = (dir) => {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, d.name);
    if (d.isDirectory()) inject(f);
    else if (d.name.endsWith('.html')) {
      const html = fs.readFileSync(f, 'utf8');
      if (html.includes('</body>')) {
        fs.writeFileSync(f, html.replace('</body>', GUARD + '</body>'));
        guarded++;
      }
    }
  }
};
inject(dest);
console.log(`   guard added to ${guarded} pages`);

console.log('→ writing Vercel Functions for the forms');
const relaySrc = fs.readFileSync(path.join(root, 'lib', 'relay.ts'), 'utf8');
// Strip the TypeScript types — the function files are plain Node ESM.
const relayJs = relaySrc
  .replace(/export interface RelayResult \{[\s\S]*?\n\}\n/, '')
  .replace(/: Promise<RelayResult>/g, '').replace(/: RelayResult/g, '').replace(/: Record<string, unknown>/g, '')
  .replace(/: Record<string, string>/g, '')
  .replace(/: unknown/g, '')
  .replace(/: string(\[\])?/g, '')
  .replace(/ as string\[\]/g, '')
  .replace(/\(await res\.json\(\)\.catch\(\(\) => \(\{\}\)\)\) as \{[\s\S]*?\};/, 'await res.json().catch(() => ({}));');

fs.mkdirSync(path.join(dest, 'api'), { recursive: true });
fs.writeFileSync(path.join(dest, 'api', '_relay.mjs'), relayJs);

const handler = (name, validate, subject, fields, source) => `import { relay, isEmail, e164 } from './_relay.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (body.website) return res.status(200).json({ ok: true });
${validate}
  const result = await relay(${subject}, ${fields}, ${source});
  if (!result.ok) return res.status(502).json({ error: 'We could not send your ${name}. Please try again or email us.' });
  return res.status(200).json({ ok: true });
}
`;

fs.writeFileSync(
  path.join(dest, 'api', 'eoi.mjs'),
  handler(
    'registration',
    `  const first_name = (body.first_name || '').trim();
  const last_name = (body.last_name || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const interest = (body.interest || '').trim();
  if (!first_name || !last_name || !isEmail(email) || !phone || !interest || body.consent !== 'yes') {
    return res.status(400).json({ error: 'Please complete all fields.' });
  }
`,
    '`New EOI: ${first_name} ${last_name}`',
    `{ firstName: first_name, lastName: last_name, email, phoneNumber: e164(phone), interest, consent: 'yes', source: 'thecronulladentists.com.au /register' }`,
    `'Founding patient expression of interest — The Cronulla Dentists website'`,
  ),
);

fs.writeFileSync(
  path.join(dest, 'api', 'contact.mjs'),
  handler(
    'message',
    `  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const message = (body.message || '').trim();
  if (!name || !isEmail(email) || !message) return res.status(400).json({ error: 'Please complete all required fields.' });
`,
    '`Website message: ${name}`',
    `(() => { const lead = { firstName: name.split(/\\s+/)[0], email, message, source: 'thecronulladentists.com.au /contact' }; const ln = name.split(/\\s+/).slice(1).join(' '); if (ln) lead.lastName = ln; if (phone) lead.phoneNumber = e164(phone); return lead; })()`,
    `'Contact form — The Cronulla Dentists website'`,
  ),
);

// Tell Vercel this folder is a plain static site with /api functions (no build step).
fs.writeFileSync(
  path.join(dest, 'vercel.json'),
  JSON.stringify({ $schema: 'https://openapi.vercel.sh/vercel.json', cleanUrls: false, trailingSlash: true }, null, 2) + '\n',
);

fs.writeFileSync(
  path.join(dest, 'READ-ME-FIRST.txt'),
  `The Cronulla Dentists — static HTML export
==========================================

Every page is a plain .html file. Upload this whole folder to Vercel or any
static host.

DO NOT double-click index.html. The pages in here use absolute asset paths
(/_next/..., /images/...) because that is what a hosted site needs; opened from
disk those resolve to your hard drive's root and nothing loads, so the page
appears as unstyled blue links. To look at the design, use the sibling folder
preview-offline/ and open its index.html (or _all-pages.html).

Vercel (drag and drop):
  1. vercel.com → Add New… → Project → Deploy without a Git repository
     (or run: npx vercel deploy --prod  from inside this folder)
  2. Framework preset: Other. No build command, output directory: ./
  3. Add these environment variables so the forms work:
       SMTP2GO_API_KEY
       SMTP2GO_SENDER
       SMILEOX_INTAKE_EMAIL
       NOTIFY_EMAIL        (optional)

The /api folder holds two Vercel Functions (eoi.mjs, contact.mjs) that relay the
forms through SMTP2GO to the SmileOx intake address. If you host this folder
somewhere that does NOT run functions (plain S3, Netlify Drop, cPanel), the
pages all work but the two forms will fail — point them at your own endpoint,
or use the Next.js project instead.

IMPORTANT: the pre-opening/open mode and the three feature flags are baked into
these files at export time. To change one, edit site.config.ts in the Next.js
project and re-run:  npm run build:static
`,
);

const count = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((n, d) => n + (d.isDirectory() ? count(path.join(dir, d.name)) : d.name.endsWith('.html') ? 1 : 0), 0);
console.log(`\n✓ static-site/ ready — ${count(dest)} HTML pages + /api functions`);

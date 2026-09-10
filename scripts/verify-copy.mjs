/**
 * Word-for-word spot check: every paragraph/list item/heading of a page in website-copy.md
 * must appear in the rendered HTML (after the documented substitutions). Run after build:
 *   node scripts/verify-copy.mjs "Page 10: Dental Implants" "Page 2: About" "Page 14: Contact"
 */
import fs from 'node:fs';
const md = fs.readFileSync('content/source/website-copy.md', 'utf8');
const cfg = fs.readFileSync('site.config.ts', 'utf8');
const phone = cfg.match(/phone: '([^']+)'/)[1];
const email = cfg.match(/email: '([^']+)'/)[1];
const norm = (s) => s.replace(/\s+/g, ' ').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').trim();
const strip = (html) => norm(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<\/(p|li|h[1-6]|div|td|th|section|tr|summary|span class="kicker")>/g, ' ').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&[a-z#0-9]+;/g, ' '));
const IGNORE = /^(Button:|\*\*Page URL|\*\*Slide|Home > |\[Contact form|DentiCare logo|Team photograph|Full width practice|\*\*H[123]:\*\*|\*\*Bold|\*\*Suggested wording|\*\*Recommendation|- \*\*|\*\*Last updated|- Whether|- The nearest|- Street parking|- Accessible parking|- Any council)/;
let fails = 0;
for (const arg of process.argv.slice(2)) {
  const start = md.indexOf(`# ${arg}`);
  const end = md.indexOf('\n# Page', start + 1);
  const chunk = md.slice(start, end === -1 ? undefined : end);
  const route = chunk.match(/Page URL suggestion:\*\*\s*(\S+)/)[1];
  const file = route === '/' ? '.next/server/app/index.html' : `.next/server/app/${route.replace(/^\/|\/$/g, '')}.html`;
  if (!fs.existsSync(file)) { console.log(`SKIP ${arg}: ${file} not built (gated?)`); continue; }
  const html = strip(fs.readFileSync(file, 'utf8'));
  const lines = chunk.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && !IGNORE.test(l) && !l.startsWith('|'));
  let ok = 0, miss = [];
  for (const raw of lines) {
    let t = raw.replace(/\[TO CONFIRM: Cronulla phone number\]/g, phone).replace(/thecaringbahdentists@gmail\.com/g, email).replace(/\s*\[TO CONFIRM:[^\]]*\]\s*/g, ' ').replace(/\*\*/g, '').replace(/^- /, '').replace(/\s*Read more\s*$/, '');
    t = norm(t);
    if (!t) continue;
    // ignore lines that are entirely gated content (checked via flags separately)
    if (html.includes(t)) ok++; else miss.push(t);
  }
  console.log(`${arg}: ${ok}/${ok + miss.length} copy lines found verbatim`);
  for (const m of miss) console.log('   MISSING:', m.slice(0, 140));
  fails += miss.length;
}
process.exit(fails ? 1 : 0);

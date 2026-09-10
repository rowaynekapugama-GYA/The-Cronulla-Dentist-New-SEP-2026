# The Cronulla Dentists — website

Next.js 14 (App Router, TypeScript, plain CSS) · static-generated · deploys to Vercel with zero config.

Direct visual extension of the approved EOI landing page: same tokens, glass cards, cyan-gradient buttons, countdown.

**Navigation.** The approved floating pill: logo left, `About · Services · Finances · Contact` and the cyan CTA on the right. **About** and **Services** each open a panel of rounded image cards directly beneath the pill — Services shows six treatments plus a *We offer 15 treatments* line and an *All services* button; About shows four cards (the practice, the team, nervous patients, parking).

Both panels open on hover *and* on click (so they work on touch), close on Escape or when the pointer leaves, and survive the trip from pill to panel: the 0.7rem gap is bridged by an invisible `.mega::before` strip, and open/close is React state with a 200ms close delay rather than a CSS-only `:hover` rule. That combination is what fixes the old menu vanishing mid-travel.

Which cards appear: `FEATURED` (Services) and `aboutFeatured()` (About), both in `lib/nav.ts`. Anything gated off drops out automatically.

## Local development

```bash
npm install
cp .env.example .env.local   # optional — forms log to the console until SMTP2GO is configured
npm run dev                  # http://localhost:3000
npm run build                # production build (also runs type-checking)
npm run qa:banned            # definition-of-done check over the rendered HTML (run after build)

npm run build:static         # → static-site/     plain HTML for Vercel drag-and-drop
npm run preview:offline      # → preview-offline/ same pages, browsable from disk
```

## Three ways to deploy / review

| | What it is | Use it for |
|---|---|---|
| **This repo** | Next.js source | **Recommended.** Import to Vercel from Git; it builds on every push, forms run as serverless functions, images optimised, flags flipped by editing `site.config.ts` and pushing. |
| **`static-site/`** | 28 plain `.html` files + `_next/` assets + `/api` functions | **Hosting only — do not open from disk.** Its asset paths are absolute (`/_next/…`), correct for a server and broken over `file://`, where the page falls back to unstyled links. (Every page carries a guard script that says so if you try.) Vercel → Deploy without a Git repository, framework **Other**, no build command, output dir `./`. Clean URLs. Mode and flags are baked in — re-run `npm run build:static` after any change. |
| **`preview-offline/`** | Same pages, paths rewritten to be relative | **Looking at the design — this is the one to double-click.** Open `_all-pages.html` (index of all 28 pages) or `index.html`. No server needed. Do not host this one: its links end in `index.html`, which would give you duplicate URLs. |

### Where to edit what

| To change | Edit |
|---|---|
| Wording on any page | `content/source/website-copy.md`, then `node scripts/ingest-copy.mjs` |
| Colours, type, spacing, buttons, cards | `app/globals.css` (all tokens at the top) |
| Phone, email, hours, opening date, feature flags, mode | `site.config.ts` |
| Home page layout / section order | `app/page.tsx` |
| Every service page's layout | `components/ServiceTemplate.tsx` |
| The "in detail" sections on service pages | `components/DetailSections.tsx` |
| About, parking, privacy layout | `components/ProseTemplate.tsx` |
| Services hub / contact | `app/services/page.tsx`, `app/contact/page.tsx` |
| Nav and footer | `components/Nav.tsx`, `components/Footer.tsx`, `lib/nav.ts` |
| Which cards show in the Services / About dropdowns | `FEATURED` and `aboutFeatured()` in `lib/nav.ts` |
| Photos | drop files into `public/images/…` per `IMAGES-NEEDED.md` |
| Logo, favicon, share card | replace `assets-source/logo-primary-original.jpg`, then `python3 scripts/make-brand-assets.py` |

After editing, re-run `npm run build:static && npm run preview:offline` to refresh both folders.

## Where things live

| Path | What |
|---|---|
| `site.config.ts` | **Single source of truth**: name, address, phone, email, hours, mode, feature flags, TODO values. Nothing is hard-coded in components. |
| `content/source/website-copy.md` | The client's final copy (do not edit — edit the source doc and re-ingest). |
| `scripts/ingest-copy.mjs` | Turns the copy doc into `content/pages/*.json` (one file per page). Re-run after any copy change: `node scripts/ingest-copy.mjs`. |
| `content/pages/*.json` | Structured copy, block by block, with `gate` tags on gated content. |
| `app/` | Routes. `app/[slug]/page.tsx` renders every service + prose page; home, services hub, contact, register are explicit. |
| `components/` | Nav, footer, service template, prose template, CTA blocks, forms, countdown, schema. |
| `lib/` | Content loader, nav builder, CTA/mode logic, JSON-LD builders, form relay. |
| `app/globals.css` | The design system extracted from the landing page. |
| `scripts/check-banned.mjs` / `scripts/verify-copy.mjs` | QA tooling (see below). |

## Flipping to post-opening mode

In `site.config.ts` change one line:

```ts
mode: 'open' as SiteMode,
```

Effect: primary CTA becomes **Book an appointment** (→ `bookingUrl`, falls back to `/contact/` until set) plus a **Call (02) 8599 9815** button; countdown disappears; hero badge becomes "Now taking new patients"; the copy's "Give Us A Call…" / "To arrange an appointment…" lines render; the contact page's "Online. Book at a time that suits you…" line appears; `/register/` redirects to the booking link (or `/contact/`).

While `mode` is `'pre-opening'`, every CTA is **Register your interest → /register/**, the "Opening late November 2026" pill shows (the countdown returns automatically once an exact `openingDateTime` is set in `site.config.ts`), and the phone number is displayed (footer, contact, schema) but never used as a CTA.

## Feature flags (all default OFF — flipping a flag is the whole launch)

```ts
features: {
  emergency: false,   // Emergency Dentistry page + all emergency language
  cdbs: false,        // Kids' Gap Free page + CDBS blocks on Children's and Finances
  zipAfterpay: false, // Zip & Afterpay sections on /payment-plans/
}
```

| Flag | OFF | ON |
|---|---|---|
| `emergency` | `/emergency-dentist-cronulla/` is **not built (404)**, not in nav/footer/sitemap. Home slide 2, home "Emergency Dentistry" card (replaced by the copy's Cosmetic card), services-hub tile + blurb, contact "Dental emergencies" section all hidden. Services hub meta description uses the no-emergency variant. | Everything above renders verbatim. |
| `cdbs` | `/kids-gap-free-dentistry-cronulla/` is not built; "The Child Dental Benefits Schedule" section on Children's Dentistry and the CDBS paragraph on Finances are hidden (pages render cleanly). | Page + blocks live; footer gets a "Kids' Gap Free Dentistry" link. |
| `zipAfterpay` | `/payment-plans/` ships DentiCare-only: Zip and Afterpay sections hidden; hook + intro sentence use the DentiCare-only wording stored in `gatedText`; meta title "Payment Plans \| DentiCare \| Cronulla". | Full copy + original meta. |

Gated copy is never deleted — it stays in `content/pages/*.json` with `gate` tags.

Gated pages are served as **404** (not built) rather than `noindex`, so nothing can leak while a flag is off.

## TODO config values to swap in (`site.config.ts`)

- `bookingUrl` — practice-management online booking link (used in `open` mode)

Now set (no longer TODO): `mapEmbedUrl` (keyless Google embed of the GBP listing), `gbpShareUrl` + `sameAs.googleMaps` (the client's share.google listing link, also emitted as `hasMap`), `teamNamesConfirmed: true` with Person schema for both practitioners on /about/ per the SEO strategy docs. Env vars for the forms are in `VERCEL-ENV-VARIABLES.txt` — only `SMTP2GO_API_KEY` still needs its value pasted in Vercel.
- `gtmId` — GTM container; the snippet loads on every page only when set
- `sameAs.googleMaps / facebook / instagram` — schema `sameAs` (empty strings are omitted)
- `geo` — verify against the final map pin
- `team[].title` — registration/title wording; set `teamNamesConfirmed: true` to publish full names in metadata/schema (body copy already uses the names from the approved copy)
- `parkingNotes` — bullet list for the Parking section on `/parking-information/` (hidden while empty; the copy's section was entirely `[TO CONFIRM]`)
- `privacyLastUpdated` — shown at the top of the privacy policy once published
- `legalName` — entity name + ABN for the privacy policy (currently the trading name)

## Forms (`/register/` EOI and `/contact/`)

`/api/eoi` and `/api/contact` relay through **SMTP2GO → SmileOx intake address**, the same pattern as the live EOI page. Set in Vercel → Project → Environment Variables:

```
SMTP2GO_API_KEY=…
SMTP2GO_SENDER=website@thecronulladentists.com.au   # must be a verified SMTP2GO sender
SMILEOX_INTAKE_EMAIL=the-cronulla-dentists+94b89dce-…@intake.smileox.com.au
NOTIFY_EMAIL=reception@thecronulladentists.com.au   # optional CC
```

Both routes have a honeypot field (`website`), server-side validation and a glass-card success state. Until the env vars are set, submissions are logged server-side and the UI still shows success (handy for previews).

## Deploy to Vercel

1. Push this folder to a Git repo.
2. Vercel → Add New Project → import the repo. Framework is auto-detected (Next.js). No build settings needed.
3. Add the environment variables above.
4. Point `www.thecronulladentists.com.au` at the project (Settings → Domains). Canonicals and the sitemap assume the `www` host.
5. After the client supplies photography, drop the files into `public/images/…` per `IMAGES-NEEDED.md` (same filenames) and redeploy.

`vercel deploy --prod` from the CLI also works.

## SEO / schema

- Exact meta title + description per page from the copy doc; canonical URLs with trailing slashes; OG tags.
- `sitemap.xml` and `robots.txt` generated; gated pages and the noindex privacy policy are excluded.
- JSON-LD: sitewide `Dentist` (address, geo, `openingHoursSpecification` from config, `+61285999815`, reception@ email, sameAs), `BreadcrumbList` on inner pages, `MedicalProcedure`/`Service` per service page, `FAQPage` built from question-phrased detail sections.
- Outbound Caringbah links carry `?utm_source=cronulla-site`.

## Copy handling notes (what was normalised, and why)

The copy is rendered verbatim from `website-copy.md`. The only changes, all made by `scripts/ingest-copy.mjs`:

- `[TO CONFIRM: Cronulla phone number]` → the confirmed number from config.
- `thecaringbahdentists@gmail.com` → `reception@thecronulladentists.com.au` (brief wins on facts).
- All other `[TO CONFIRM: …]` markers are stripped and never rendered (the script prints the list). A bold label left with nothing after it (e.g. "**Accessibility.**") is dropped too.
- Cross-references such as "our finances page" and "book online" become links (same words). "book online" points at the mode-aware CTA.
- Author notes in the doc (structure notes, "Suggested wording", "Each links through to its service page", the privacy-policy legal disclaimer) are not client copy and are not rendered.
- "Button: BOOK ONLINE" → the mode-aware CTA button. The "Give Us A Call At … Today To Make An Appointment" band and "To arrange an appointment, call us on …" line render in `open` mode; in pre-opening mode those slots carry the opening-date/EOI message per brief §5 (no call-to-book before the practice can answer).
- Headings keep the copy's words; case is normalised to the design system (e.g. "TAKE YOUR TIME, ASK ANYTHING" renders as the kicker under the H1). Short UI labels ("Read more", "In detail") and section kickers are interface furniture, not copy.
- Uppercase slide headlines stay uppercase as written.

## QA checklist (definition of done)

```bash
npm run build          # clean build, 30 routes (28 live + 2 gated) + /register + API
npm run qa:banned      # 0 hits across all rendered live pages
node scripts/verify-copy.mjs "Page 10: Dental Implants" "Page 2: About" "Page 14: Contact"
```

`verify-copy.mjs` reports any copy line not found verbatim in the rendered HTML. Expected "missing" lines while flags are OFF / mode is pre-opening: gated emergency/CDBS/Zip/Afterpay lines, the two call-to-book lines, and the contact page "Online." line.

Verified: both modes, each flag ON and OFF (routes, nav, sitemap, in-page blocks), JSON-LD parses on home / service / contact, countdown, EOI + contact forms with success states, mobile nav, accordions.

## Service-page detail sections (BLOCK 10)

The copy's detail sections render **section by section down the page**, not as an
accordion — nothing the client wrote is hidden behind a click, and search engines
read it as body copy. `components/DetailSections.tsx` handles it:

- A jump list at the top links to every section; sections alternate white/sand and
  each keeps an anchor id (`#what-happens-at-a-check-up`).
- The copy signals its own structure. Where a section is written as a short intro,
  then a run of paragraphs each opening with a bold lead-in (`**We look,
  properly.** An examination of…`), then a closing line, the run of two or more
  becomes a grid of **icon cards**; everything else stays prose. Nothing is
  reworded or reordered — only laid out. 38 of the 143 detail sections across the
  site take the card treatment.
- Icons are chosen from what each lead-in says (`KEYWORDS` in that file), with a
  per-grid de-duplication pass so two cards side by side never share an icon.
- Lead-ins keep their full stop, because the copy is rendered verbatim and
  `scripts/verify-copy.mjs` checks it word for word.

FAQ schema is unaffected — it is built from the page data, not this markup, so
question-phrased headings still emit `FAQPage`.

## Site-wide QA sweep (`scripts/audit.mjs`)

`node scripts/audit.mjs` (after `npm run preview:offline`) walks every page at
desktop / tablet / mobile and reports: dead or root-absolute links, broken or
still-placeholder images, unlabeled links/buttons, horizontal overflow and
element spill, heading-order skips, missing alt attributes, and sub-40px tap
targets on standalone mobile controls (links inside a sentence are exempt, per
WCAG target-size). Current state: **0 issues across 28 pages × 3 viewports.**
Interactive behaviours verified separately: countdown, hero slider, both mega
menus (hover, click, Escape), the detail jump-nav, mobile menu open/navigate,
and form validation blocking empty submits.

Note on scroll-reveal: `components/Reveal.tsx` observes with a huge top
rootMargin so anything at or above the current viewport always reveals — without
it, a reload that restores scroll mid-page, an anchor jump, or a fast flick
could leave sections at opacity 0. A `<noscript>` fallback in `app/layout.tsx`
forces everything visible when JS is off.

# marketingaskola.lv — static site (migrated off WordPress)

Owner: Rihards (rihards@marketingaskola.lv). Latvian-language digital marketing
agency site, migrated from WordPress/Divi on 19 Aug 2026 by crawling the live
site and rebuilding it as an Eleventy static site. Content was copied verbatim;
the design system (Roboto/Roboto Condensed, cyan #03c3f8, navy #00152c) mirrors
the original.

## Stack and layout

- **Eleventy 3** (Nunjucks templates), no client framework, one plain CSS file.
- **Design system v5 "ledger" — DARK-FIRST** (19 Aug 2026, owner: "not a fan
  of the white background at all"). **OWNER RULES: no gradients ever; no
  white/light page backgrounds; WCAG-safe contrast; generous scale — never
  shave section padding to fit content.**
  ONE canvas `#020d1c` sitewide — backgrounds never change color, no
  section stripes. Cards `#00152c` + mandatory 1px `rgba(255,255,255,.08)`
  hairline; `#051e35` for inputs/hover fills/inset wells; depth = hairlines,
  NEVER box-shadows or glows. Three text tiers ONLY: headings `#ffffff`,
  body `#c9d8e8`, muted `#8ba3bd` (the floor — nothing dimmer ever carries
  text; no opacity-faded text or logos; no font weight <400).
  **Cyan budget** (≤5% of any viewport, never as heading color/background
  wash/border-at-rest/mass icon tint): primary CTA fill (ONE per viewport),
  eyebrow index+tick, stat suffixes + at most one full numeral per page
  (course price), inline links + active nav, focus ring, featured panel's
  2px top bar + corner ticks, hero h1 terminal period.
  Devices: indexed dossier eyebrows (`.eyebrow` + `<span class="idx">01</span>`,
  rule flexes to edge inside `.sec-head`), collapsed hairline grids
  (`.hgrid.hgrid--3 > .cell` with `.cell-idx`), ledger stats (`.stats`/`.stat`
  with `.num` + cyan `.sfx`, `.stats--row` horizontal), evidence `.panel`
  (cyan top bar + corner ticks — max 1-2 per page), unboxed `.steps`,
  hairline `.testimonial` columns, `.cta-band` (the ONE `#00152c` full-bleed
  band per page), boxed `.cta` panel for inner pages. Buttons: cyan fill +
  `#020d1c` text, radius 4px, flat hover `#45d4fa` (no translate, no glow);
  `.btn--ghost` white 0.32 border. `.form-embed` stays a WHITE document card
  (Tally renders dark text — deliberate exception). `.sec--dark`/`.sec--soft`
  are deprecated no-ops (transparent). Type scale is large on purpose: hero
  ~96px desktop, sections clamp(6rem,10vw,10rem).
- **The header is DARK and must stay dark** — the brand logo
  (`src/img/logo.png`) is white artwork, invisible on light backgrounds.
  Likewise the client logos (`*-grey.png/webp`) are light grey: only show
  them on navy sections (`.logo-row` sections are flipped to `sec--dark`).
- **Images**: every raster has a `.webp` twin (`tools/optimize-images.mjs`,
  max 1600px q78; 33.5 MB → 4.9 MB). Body markup references `.webp`; front
  matter `image:` keeps the original png/jpg for og:image link previews
  (templates display it via the `webp` filter). New images: drop the original
  in `src/img/...`, run the optimizer, reference the `.webp`.
- `src/pages/*.html` — the 19 site pages. Front matter + plain HTML sections.
  Section conventions: `.sec` (white), `.sec--soft` (light blue-gray),
  `.sec--dark` (navy + glow), `.sec--hero` (home/landing hero; optional
  `style="--bg:url('...')"` photo) with `.row .cols-N > .col` grids inside.
  Components: `.btn`/`.btn--ghost`/`.btn--sm`, `.blurb` (+`.card-icon`),
  `.testimonial`, `.faq` (`<details>`), `.cta`, `.divider`, `.eyebrow`,
  `.stats`/`.stat`, `.steps`/`.step`, `.marquee` (logo strip), `.post-grid`,
  `.team-card`, `.contact-card`, `.page-hero`.
- **Inner-page heroes come from front matter**: `heroTitle`, `heroSub`,
  `heroChip` (rendered by `page.njk` as `.page-hero`). Added in bulk by
  `tools/upgrade-pages.mjs`, which also de-duplicated first in-body headings.
- `src/posts/*.md` — the 31 blog posts, Markdown + front matter
  (title, description, date, image, categories, permalink).
- `src/_includes/` — `base.njk` (head/topbar/header/nav/footer), `page.njk`,
  `post.njk`. Nav and contact data live in `src/_data/site.json`.
- `src/_data/categoryList.json` — blog categories (slug, name, post slugs).
  **Do not rename to `categories`** — that collides with per-post front matter
  under Eleventy's data deep-merge (was a real bug).
- `src/css/style.css` — the whole design system, tokens in `:root`.
- `src/img/YYYY/MM/…` — all images, mirrored from wp-content/uploads.
- `tools/` — the migration pipeline (see below) and `serve.cjs` (local static
  server for `_site`), `check-site.mjs` (link + content integrity checker).
- `archive/wordpress-mirror.zip` — raw HTML of every page as WordPress served
  it on 19 Aug 2026. The design/content reference if anything is ever in doubt.

## Commands

```bash
npm run build     # eleventy -> _site/
npm run serve     # node tools/serve.cjs  -> http://localhost:8385 (serves _site)
npm run check     # link integrity + thin-page check over _site
```

## Deploy

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) builds and
deploys to GitHub Pages. While on the github.io preview URL the build uses
`PATH_PREFIX=/marketingaskola-site/` and `PREVIEW=1` (adds `noindex`).

**Custom-domain cutover checklist** (when pointing marketingaskola.lv here):
1. In `deploy.yml`: set `PATH_PREFIX: /` and delete the `PREVIEW: "1"` line.
2. Add a `CNAME` file containing `marketingaskola.lv` to `src/` and passthrough-copy it (or set the custom domain in repo Settings → Pages, which commits it).
3. DNS: `A` records for apex → 185.199.108.153 / .109. / .110. / .111.153, `CNAME www` → `mravocadoman.github.io`.
4. Enable "Enforce HTTPS" in repo Settings → Pages once the cert is issued.


## Two surfaces: dark canvas + light paper (v6, 20 Aug 2026)

The marketing site is dark; **long-form reading is on white paper** (owner:
"keep white background for the blog posts; and part of other content too where
it helps with readability").

- `.paper` is a **token-flipping wrapper** — it redefines --canvas/--card/
  --line/--heading/--body/--muted/--link, so every existing component (cards,
  faq, tick-list, stats, forms, buttons) works inside it unchanged. Use
  `.paper` for any dense reading zone; `.paper--tint` for a #f6f9fc variant.
- **On paper, cyan is DECORATIVE ONLY.** Interactive text uses --link #01608c
  (5.9:1 on white); cyan text on white is banned (2.2:1). Buttons on paper are
  navy fill / white text — a cyan slab on white is too loud.
- Blog **articles** are paper; the blog **index and category pages stay dark**
  (they are navigation, not reading). Article structure: dark `.page-hero`
  (chip, h1, `.article-meta` with date + reading time) → generated cover in
  `.media` → `.paper > .article-shell > .article-grid` (`.article-body` at
  68ch + sticky `.toc`) → dark `.cta-band` → dark related posts.

## Imagery pipeline (generated brand artwork)

Every non-photographic image on the site is generated flat brand artwork.

- `src/_data/imagery.json` — the manifest: one entry per slot with
  `id, page, placement, aspect, alt, prompt`. The id IS the filename.
- `npm run images` → `tools/generate-images.mjs` calls the OpenAI images API
  (`gpt-image-2`, medium quality) for every slot with no file yet, then
  converts to webp at 1600px/q80. `--force`, `--only=<id>`, `--limit`,
  `--quality`, `--model` supported. Output: `src/img/gen/<id>.webp`.
- `npm run covers` → `tools/apply-covers.mjs` points each post's front-matter
  `image:` at `/img/gen/cover-<slug>.webp` and keeps the original WordPress
  cover in `legacyImage:` (`--revert` restores it).
- **Art direction** (house style is appended to every prompt by the generator,
  edit it there to re-tune the whole set): flat editorial vector on solid
  #020d1c, ONE accent (cyan #03c3f8) plus white and #8ba3bd grey, generous
  negative space, subtle grain. **Never**: gradients, glow, 3D, and above all
  **no text/letters/numbers/logos in the image** — the site is Latvian and
  baked-in type is unmaintainable (the old WordPress covers had headlines
  burned in, which is why they clashed on the dark canvas).
- **The API key lives in `.env` (gitignored, never committed).** `.env.example`
  documents the variable. Rotate the key if it was ever pasted into a chat.

## Team photographs — brand accents YES, new people NO

History, so nobody relitigates it:
- A first pass restyled the portraits through the OpenAI image-edit endpoint and changed
  backgrounds, lighting and one person's hair colour. Owner: *"why did you change the people
  in the images, my team members… revert them!"* — reverted.
- A pure local colour grade was then judged too weak. Owner, 21 Aug 2026: *"edit them like you
  did this guy in the main page, use openai api and add the cyan elements/accents, not just
  change the shade slightly."*

**The settled rule: team faces are NEVER generated.** `images/edits` is a *generation* call —
it re-draws the whole picture and repeatedly substituted different people. Owner: *"you changed
their faces to someone else"*. Prompt engineering did not fix it and must not be relied on.

**No generated person may stand in for a real one.** The homepage process
section used a GENERATED stock figure (`home-process-portrait`) in a founder
role; it is replaced by `rihards-founder-brand.webp` and that manifest slot is
deleted so `npm run images` cannot recreate it. `aspect` in the PORTRAITS list
sets the FRAME shape only — a taller frame draws more backdrop, it never crops
or stretches the photograph. Match the slot exactly (`.media--portrait` is 3:4)
or object-fit:cover silently crops the result.

`npm run portraits:brand` → `tools/brand-portraits.mjs` (non-generative):
1. sharp square-crops the ORIGINAL photograph;
2. `tools/_matte.mjs` produces an alpha cutout with a local ONNX model — it decides
   *transparency only*, never colour. It runs in a SEPARATE PROCESS: loading libvips (sharp) and
   onnxruntime together dies with a GLib-GObject error on Windows;
3. the navy field, cyan disc and white arc are drawn as flat SVG;
4. the original RGB is masked with the matte's alpha via `composite(blend:'dest-in')` and
   composited over that backdrop.
   *Not* `joinChannel` — it silently loses the alpha at PNG encode and the original background
   survives. *Not* the matte library's own RGB — it resamples internally (~1.6/255 drift).

The tool self-verifies and fails loudly:
- **subject pixel diff vs the original must be ≤2.5/255** (~1.0 is alpha-compositing rounding);
- **backdrop coverage must be >95%**, which catches an opaque cutout that would make the pixel
  check pass trivially. Compare the backdrop *colour*, never "differs from the source" — Madara's
  original background is already near-black, so that test wrongly reported 4.5%.

Sources stay in `src/img/YYYY/MM/…` and are the source of truth. `npm run portraits`
(`tools/grade-portraits.mjs`) is the plain local-colour-grade fallback.

## Forms — hand-coded, MailerLite (21 Aug 2026)

The Tally iframes are gone. `src/_data/forms.json` defines the fields,
`src/_includes/form.njk` renders them, `src/js/forms.js` submits. Import the
macro **with context** — `{% from "form.njk" import form with context %}` —
or the `forms` global is invisible inside the macro and every field silently
disappears. Two forms, `contact` and `course`; the second argument presets a
field, e.g. `form("course", { course: "SEO kurss" })`. The field lists were
read off the live Tally embeds, not invented.

**MailerLite, not Resend — the deciding factor is that this site is static.**
MailerLite's form endpoint takes a browser POST and carries no secret, so it
works from GitHub Pages as-is. A Resend API key can never reach the browser, so
Resend would need a serverless function on a host this project does not have,
purely to receive a form. MailerLite is also a list with automations (free to
1,000 subscribers / 12,000 emails a month) where Resend stores nothing, so it
would be an addition to a list tool rather than a replacement for one. The
provider sits behind an adapter in `forms.js`: switching means adding one entry
there and changing `provider` in `forms.json` — no markup changes anywhere.

- Endpoint: `assets.mailerlite.com/jsonp/<account>/forms/<formId>/subscribe`.
  If the browser refuses to let us read the response, the code retries with
  `mode:'no-cors'` — a cross-origin FormData POST is a *simple* request, so it
  still reaches the server even when the reply is opaque.
- **Every failure path falls back to a pre-filled `mailto:`** rather than an
  error message. A form that loses a lead is worse than no form.
- Honeypot field plus Latvian client-side validation. The consent checkbox is
  required and names SIA "Stonks" as the data controller.
- The MailerLite form IDs live in `forms.json` under `forms.<key>.id`. With an
  empty id the form still renders and still works — it just routes to `mailto:`.

### MailerLite objects (created 21 Aug 2026, account 1475)

| what | name | id |
| --- | --- | --- |
| group | Web — kontaktforma | `196419625361082354` |
| group | Web — kursu pieteikumi | `196419628518344585` |
| form | Mājaslapa — kontaktforma | `196419637828650760` |
| form | Mājaslapa — kursu pieteikumi | `196419640979621088` |

Custom fields added: `website`, `message`, `motivation`, `course`,
`participants` (number), `source_page`. The rest map onto MailerLite defaults
(`name`, `last_name`, `email`, `phone`, `company`).

`npm run test:forms` drives both forms in headless Chrome against the local
preview, with the MailerLite request stubbed so it asserts client behaviour
without creating subscribers: validation, Latvian messages, required consent,
honeypot, payload contents, success panel, course preselect.

**Open decision — double opt-in is ON for these forms.** A submitted enquiry
lands as `status: unconfirmed` until the person clicks a confirmation email.
The lead and every custom field are still stored and visible in the dashboard,
so nothing is lost, but unconfirmed subscribers cannot be emailed in campaigns
and group-join automations generally will not fire for them. That is sensible
for a newsletter and wrong for "tell us about your business" — turn it off for
these two forms in the MailerLite dashboard if enquiries should arrive
confirmed. Left as-is because it is a consent decision, not a technical one.

## Marks and white-slab artifacts

`.img--card` (`background:#fff`) is **deleted**. It faked white paper behind
artwork that was already transparent, punching a light hole in the dark canvas.

- `npm run marks` → `tools/tone-marks.mjs` recolours transparent MARK artwork to
  `#c9d8e8` through its own alpha, the same trick as the logo normaliser. Used
  for the EU funding lockup: single-colour reproduction on a dark ground is what
  the EU emblem guidelines provide for, and the source was already monochrome.
  **The mask must be an image that still has an alpha channel.** Passing an
  extracted greyscale buffer masks nothing — a b-w PNG is fully opaque, so
  `dest-in` keeps every pixel and you get a solid light slab, the exact artifact
  the tool exists to remove. The tool fails unless ink coverage lands between
  3% and 70%; the upper bound is what catches that failure.
- The **Meta certification badges are deliberately NOT toned.** They are already
  brand-coloured on transparent and read fine on navy; flattening them to one
  tone would destroy an official badge. They just use `.marks`.
- Real screenshots (portfolio) keep their own light UI and use `.img--shot` — a
  hairline frame, no white padding.
- The EU funding notice moved out of an orphaned centred card at the foot of
  `/sazinies/` into a `.funding` band closing the contact section, so the legal
  disclosures sit together and the page ends on the founder story instead of on
  a compliance footnote. **The wording is unchanged and still legally required.**

## Client / partner logos

`npm run logos` → `tools/normalize-logos.mjs` rebuilds `src/img/logos/`.
The originals range from 1:1 to 9:1 in aspect with mixed tones and padding, so a
fixed CSS height makes square marks tiny and wordmarks huge. The tool trims each
logo, recolours it to one tone (#c9d8e8) via its alpha mask, and scales it to a
blend of equal-height and equal-area (the geometric mean) so every logo carries
the same optical weight, then centres it on a 300x80 canvas. The markup just
uses `.logo-grid` — a 4-column hairline-celled wall. **No CSS filters and no
opacity fading on logos.**

## Motion (src/js/main.js)

Reveal-on-scroll, ledger stat **counters** (count up preserving "1M", "75 000",
"36,34" formatting — the `.sfx` span is left untouched), article **reading
progress** bar, **TOC scrollspy**, back-to-top, sticky header state, mobile nav.
All of it is gated behind `prefers-reduced-motion` and degrades to a static page.

## Tooling gotchas

- `tools/screenshot.mjs` — headless Chrome captures. Run it from PowerShell, or
  from Git Bash **with `MSYS_NO_PATHCONV=1`**: MSYS rewrites a leading-slash
  path arg (`/blogs/`) into `C:/Program Files/Git/blogs/`, and the script then
  silently shoots `about:blank` (a blank dark PNG). It resizes the viewport to
  the document height rather than using fullPage, which Chrome returns blank
  for very tall pages, and clips at 15000px.
- Start the preview server as a persistent background process; a server started
  inside a one-shot shell call dies before the next call.

## Case-study videos on /video-reklama/ (21 Aug 2026)

`.video-embed` carries the aspect ratio of the **actual file**, via
`--ar` (default `16 / 9`, `.video-embed--vertical` sets `9 / 16`). It used to
hard-code `padding-top: 56.25%` for everything, which letterboxed the social
clips into squat black slabs a fraction of their real height.

`node tools/probe-video.mjs <url…>` reads the true dimensions out of the MP4
`tkhd` box (no ffprobe here). It measured **all eight case-study clips as 9:16**
— 480x854, except Lumi's second at 1080x1920. Re-run it before trusting any
assumption about a video's shape. Note the `tkhd` width/height sit at offset
76 (v0) / 88 (v1) from the body start, after the 36-byte matrix; 84 lands past
the end of a v0 box and returns junk.

The MP4s are `<video controls preload="metadata" playsinline>`, not `<iframe>`.
As iframes the browser wrapped each one in its standalone media viewer, which
is why one cell showed different player chrome from its neighbours.
`preload="metadata"` is deliberate — the eight files are ~44 MB together.

Layout: `.video-row` is its own 4-up grid capped at 860px (2-up under 860px) so
four tall verticals do not tower over the section, and `.case` / `.case-result`
give each study one left edge with the outcome marked by a thin rule.

**Two open content items, flagged not changed:**
- The Lumi copy says "vertikāls Reels un horizontāls Feed" and describes making
  both formats, but all four embedded clips are vertical. Either the horizontal
  Feed cuts were never uploaded, or they should be added.
- These videos still stream from `marketingaskola.lv/wp-content/uploads/…` and
  will 404 at the DNS cutover. ~44 MB, so they need transcoding before they can
  live in the repo.

## Type scale (21 Aug 2026)

`npm run type:audit` resolves every font-size in the stylesheet at 390 / 768 /
1440px and reports how many distinct sizes exist. It found **82 declarations on
40 distinct desktop sizes, 27 pairs within 1px of each other below 30px** —
drift, not a scale. Every new component had been inventing its own size.

Ten steps, desktop: **12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 60 / 80.**
Arithmetic at the small end (perceived difference at small sizes tracks absolute
pixels, not ratio); a widening climb above the reading step, because display
type appears once or twice per viewport and needs unmistakable separation.

**The display peak is measure-derived, not ratio-derived.** Latvian compounds
are long and these headings are already capped at 17–18ch, so the hero came down
96 → 80. Do not raise it back without checking a real headline at 1440px.

- `tools/type-scale.json` is the source of truth: the ten tokens plus a mapping
  from every selector onto one of them.
- `npm run type:build` regenerates that mapping by role rules and **fails if any
  declaration is unmapped** — a silently-unmapped selector keeps its old size.
- `npm run type:apply` writes the tokens into `:root` and rewrites every
  `font-size` to `var(--t-…)`. It also refuses to write with anything unmapped.
- Re-run `npm run type:audit` afterwards. Expect 10 distinct sizes, 0
  indistinguishable pairs. That is the check.
- **Every uppercase tracked micro-label uses `--t-micro` (12px) and nothing
  else.** That one rule removed six near-duplicate sizes.

## Article typography and content defects

Blog posts came out of WordPress with raw `<h2 id="1">` HTML, and markdown-it
does not parse inline markdown inside a raw HTML block — so `**1.** **Heading**`
reached the reader as literal asterisks. `npm run articles:normalize` converts
those to real markdown headings (177 across 31 posts), which fixes the bold and
gives each section a slug anchor instead of `#1`. `withAnchors` slugifies and
`toc` follows, so the table of contents stays correct.

A second cause of literal asterisks: `**Instagram:**Attēlu` cannot close its
emphasis under CommonMark, because the closing run sits between punctuation and
a letter. The normaliser inserts the missing space.

Two scanners, both worth running after any content import:
- `npm run articles:defects` — scans **built** `_site` HTML (not `src`, because
  the failure only appears after the build) for literal markdown, inline
  font-size/colour and leftover WordPress classes. Target: 0.
- `node tools/content-defects.mjs` — scans post source for misplaced FAQ blocks,
  fused words from lost line breaks, duplicated paragraphs, and **non-Latin
  lookalike letters** (a Cyrillic `с` inside a Latvian word passes every
  spellcheck and breaks search; one was caught this way).

**The AI article carried a FAQ about `mārketinga plāns`** that belongs to a
different post, and the splice had swallowed the first word of its own opening
sentence. The same corruption is present in `archive/wordpress-mirror.zip`, so
it is upstream content, not a migration regression. The FAQ moved to
`marketinga-plans.md`, which had none.

## Information architecture (21 Aug 2026)

`npm run content:inventory` dumps every page's title, description, headings and
CTAs plus the post list and category counts — use it before any IA decision
rather than working from memory.

Nav was rebuilt because two real service pages were reachable only from the
footer. Current top level: Sākums · Pakalpojumi · Portfolio · Kursi · Produkti ·
Blogs · Sazinies.
- **Pakalpojumi** now lists all five services including
  `/socialo-mediju-marketings/`, which was a 1000-word page missing from the nav.
- **Kursi** now includes `/tiktok-kursi/`, previously footer-only.
- **Produkti** now includes `/100-instagram-stories-veidnes/`, which had one
  inbound link in the whole site.
- The homepage services grid holds services only; the courses cell was
  redundant because the page already has a dedicated courses section below it.

**`/facebook-kurss-landing/` is deliberately not in the nav.** It has zero
inbound links and duplicates `/facebook-kursi/`, which looks like an orphan but
is the normal shape of a paid-campaign landing page. It was NOT deleted, because
an ad campaign may point at it. It only lacked a meta description, now added.

## AI and automations service (21 Aug 2026)

`/ai-un-automatizacijas/` is a fifth service page following the same structure
as the other service pages. Scope: pieteikumu plūsmas and CRM, e-pastu
automatizācijas, segmentācija, atskaites, AI satura sagatavošana, komandas
apmācība. Entry point is an audit, and pricing follows the existing
"cena pēc darba apjoma" pattern rather than an invented number.

Two posts support it, both categorised `maksligais-intelekets`:
`/marketinga-automatizacija-ar-ko-sakt/` and
`/ai-saturs-bez-zimola-balss-zaudesanas/`. They deliberately sit one level more
practical than the three existing AI posts, which are all "what is AI".

**Owner sign-off still needed** on the service page: it describes an offering
in general terms and makes no claims about results, clients or tools in use.
Confirm the scope is what the agency actually delivers, and add real pricing or
delivery times if they should be public.

**`acquisition.md` was not found anywhere on the machine.** The owner intends
Latvian versions of its content to live here eventually; nothing from it has
been used, because it could not be read.

## Geometry — SQUARE, one decision (21 Aug 2026)

The stylesheet had **seven** corner treatments at once: 8px, 6px, 5px, 4px, 2px,
0 and 50%. Owner: *"too much of a mix of square and rounded… just use one and
stick with it."*

`--radius: 0` and `--radius-btn: 0`. Every ad-hoc 2/4/5/6px radius is gone.
Square is the right half of the choice because the system is already a ledger —
hairline grids, indexed eyebrows, corner ticks on panels, depth from hairlines
and never shadows. Rounded corners were fighting all of it.

**The only circles left are two true dots** (a 3px separator in `.article-meta`
and the 4px travelling signal on `.logo-strip`). Containers, images, avatars and
buttons are boxes and read as boxes. If you add a rounded element, you are
reopening a decision that was made deliberately — change the token instead.

## Header and nav (21 Aug 2026)

- Brand mark **148px** desktop / 132px under 1020px (was 176px).
- Topbar is a utility strip, not a second nav: 32px tall, contacts get a cyan
  hairline that wipes in on hover.
- Nav hover and active share ONE mark: a 2px cyan rule that wipes in from the
  left, replacing an inset box-shadow that appeared instantly and read as a
  different device from everything else.
- Dropdowns animate (fade + rise, rows staggered 30ms apart) and the caret
  rotates. All of it degrades to instant state changes under
  `prefers-reduced-motion` — the menus still work, they just stop moving.

**Two traps, both hit during this change:**

1. **`.dropdown` is a `<ul>`, so `.nav ul` (0,1,1) outranks `.dropdown`
   (0,1,0).** That is why the old rules carried `display: none !important`.
   Removing the `!important` silently left every mobile submenu expanded. The
   fix is specificity, not force: the rules are scoped `.nav .dropdown` (0,2,0).
   Same reason the desktop rule needed `padding: 8px !important` — also fixed.
2. **The caret already owns `a::after` on `.has-children` links.** Adding the
   underline on `::after` merged the two rulesets into one pseudo-element and
   drew a stray box under the parent items. The underline uses `::before`.

`npm run test:nav` drives both, plus the logo sizes, in headless Chrome:
hidden-at-rest, hover, pointer-leave, keyboard focus, mobile collapse and tap,
and horizontal overflow.

## The type audit had a blind spot (found 21 Aug 2026)

The first pass reported "10 distinct sizes, 0 indistinguishable pairs". That was
measured with a broken scan. **A CSS rule immediately preceded by a comment
captures that comment into the selector capture group**, and the
`sel.startsWith('/*')` guard then skipped the entire rule. Six declarations
never got tokenised — `.topbar`, `.footer`, `.toc`, `.article-meta`, `.eyebrow`
and `.btn` — and the audit could not see them to report them either.

All three tools now strip comments from the selector before matching. The real
numbers: **90 declarations, 10 distinct sizes, 0 indistinguishable pairs, zero
raw font-sizes left in the file.** If the audit ever reports fewer than 90
declarations, it has gone blind again.

## Rules — do not break these

- **Permalinks are the WordPress URLs.** Posts live at `/{slug}/` (root level,
  not under /blog/), pages keep their slugs, categories at `/category/{slug}/`.
  Changing any permalink breaks SEO and inbound links at cutover.
- **The EU funding notice and company requisites on `/sazinies/`**
  (SIA "Stonks", Atveseļošanas fonda paragraph) are legally required — never
  remove or reword them.
- **Forms are Tally embeds** (`tally.so/embed/wz1DrM` contact,
  `tally.so/embed/nrvEB2` course signups) and **course purchases go through
  Thinkific** (`marketingaskola.thinkific.com/enroll/...`) plus one Stripe
  payment link on the Instagram-templates page. These are external services —
  they keep working statically; do not replace them with fake forms.
- Site language is Latvian (`lang="lv"`); keep diacritics intact (files are UTF-8).
- Course pricing shown (e.g. 295€ → 145€) is copied verbatim from the live
  WordPress site — it is the owner's real pricing, only he changes it.

## Repaired links (were broken on the old WordPress site too)

All links that 404'd on the live WordPress site have been repointed (19 Aug
2026, redesign pass): `/meta-reklamas-kursi/` → `/meta-reklamas-kurss/`,
`/7-padomi-marketinga-strategijas-izstrade/` → `/marketinga-strategijas-izstrade/`
(301 live), `/padzilinats-seo-kurss/` and
`/digitala-marketinga-strategija-vaditajiem/` → `/digitala-marketinga-kursi/`,
`/seo-pakalpojumi/` → `/pakalpojumi/`, `/improvizacija-un-izklaide/` →
`/video-reklama/`. If the owner ever creates those pages, point the links back.

## Course pages (rebuilt by hand, 19 Aug 2026)

`meta-reklamas-kurss`, `seo-kursi`, `tiktok-kursi`, `digitala-marketinga-kursi`
use the course-sales layout: in-page `.page-hero` with fact `.chips`,
`.course-layout` (body + sticky `.course-aside` with `.course-card` offer box
and `.instructor-card`), `.tick-list`, `.faq` module accordions, shared
catalog include `src/_includes/course-catalog.njk` (set `catalogExclude`
before including). Facts are owner data — price 150 € + PVN, levels, hours,
instructors (Rihards / Matīss Seipulāns / Madara Dakse). Data decisions made
during the rebuild, revisit with the owner if wrong:
- The stale "Nākamais norises datums: 17. Jūnijs" on the Meta course was
  replaced with evergreen copy ("datumu precizēsim pēc pieteikšanās").
- Meta course hours: page said 3 h, catalog card said 4 h — normalized to
  the course page's 3 h.
- TikTok course keeps its honest "Šobrīd netiek organizēts" badge and has no
  signup form (none existed) — CTAs go to /sazinies/.
- Catalog courses without own pages (padziļinātais Meta/SEO, stratēģija
  vadītājiem) link to the hub form, not to themselves.

## Copy rules

- **Consultation policy** (owner, 21 Aug 2026 — supersedes the earlier
  blanket ban on the word "bezmaksas"):
  * A **free 20-minute introductory call** ("bezmaksas 20 min iepazīšanās
    zvans") is offered ONLY to prospects who want to work with the agency —
    i.e. people interested in services. Its CTA goes to `/sazinies/`.
  * **Advisory consultations remain PAID**: €100/h, €60/30 min — see
    `/marketinga-konsultacijas/`. Never advertise free advice/strategy
    sessions, and never call a paid consultation "bezmaksas".
  * Course signup pages may keep "Piesakies bez maksas" — that means the
    *application* is free, not the course.
- **Rihards has worked with 100+ companies** — use 100+ consistently
  (one course page said 50+; that was wrong).
- Stats used on the homepage (10+ gadi, 100+ uzņēmumi, 1M+ € budžeti) come
  from Rihards' own bio on `/sazinies/` — don't inflate them.
- No invented claims, ratings, or star reviews; testimonials are verbatim
  from the original site.

## What was deliberately changed vs WordPress

- The live Instagram feed (Smash Balloon plugin) became a static "Seko mums
  Instagram!" CTA — a static site can't render the feed without an API worker.
- The blog module on the homepage is now a dynamic latest-3-posts loop.
- Related-posts blocks, comment forms and the WP search were dropped.
- RSS feed (`/feed/`) does not exist here (add `@11ty/eleventy-plugin-rss` if wanted).

## Migration pipeline (only needed if re-importing from WordPress)

```bash
node tools/extract-wordpress.mjs <mirror-dir> <extract-dir>  # Divi HTML -> outlines/markdown
node tools/generate-pages.mjs <extract-dir> [slug]           # outlines -> src/ + image download
```

Generated files are the source of truth afterwards — hand edits live in
`src/`, and regenerating a page overwrites them (the homepage blog section
was hand-patched after generation, for example).

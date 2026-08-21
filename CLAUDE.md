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

**The settled rule:** the OpenAI image-edit endpoint MAY be used on team photographs to place
them on the brand backdrop with cyan accents — but the person must survive untouched.

- `npm run portraits:brand` → `tools/restyle-portraits.mjs` (edit endpoint, gpt-image-1).
  Output: `src/img/team/<id>-brand.webp`. The prompt is identity-locked and explicitly demands
  a PHOTOGRAPH: an early version said "flat graphic illustration" and returned vectorised line
  art with a hardened, older face — if a result looks illustrated, that clause has crept back in.
- **Always diff the result against the source before shipping.** Check face, build, hairstyle and
  especially HAIR COLOUR (Katrīna was turned brunette once). If a portrait drifts, re-roll it with
  a per-person `note` in the PORTRAITS array rather than accepting it.
- `npm run portraits` → `tools/grade-portraits.mjs` is the no-AI fallback: local colour maths
  only, face pixels mathematically untouched. Use it if the owner ever wants AI out of the loop.
- Originals stay in `src/img/YYYY/MM/…` and remain the source of truth for both tools.

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

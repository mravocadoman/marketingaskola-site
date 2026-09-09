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
- `archive/wordpress-mirror/` (and the identical `wordpress-mirror.zip`) — raw
  HTML of every page as WordPress served it on 19 Aug 2026. The design/content
  reference if anything is ever in doubt. The loose copies used to sit in the
  repo root; they moved on 2 Sep 2026.

## Commands

```bash
npm run build     # eleventy -> _site/
npm run serve     # node tools/serve.cjs  -> http://localhost:8385 (serves _site)
npm run check     # link integrity + thin-page check over _site
npm run check:mirror  # + text coverage vs archive/wordpress-mirror (the WP render)
npm run derived   # og:image twins, default social image, favicon.ico, author thumb
```

## Deploy

`.github/workflows/deploy.yml` routes every push to `main`:

- **SiteGround (production, https://marketingaskola.lv)** when the `SG_HOST`,
  `SG_USER`, `SG_SSH_KEY`, `SG_PATH` secrets exist: build, `npm run check`,
  `rsync --delete` over SSH into the web root, then `npm run check:live`
  (`tools/check-live.mjs`) smoke-tests the live site from its sitemap.
  `src/.htaccess` ships with the build: https + no-www, the WordPress-era
  301s, `/feed/` → `/feed.xml`, old `/wp-content/uploads/` → `/img/`,
  410 for `/wp-admin` & co, cache lifetimes, security headers.
- **GitHub Pages (preview)** otherwise, or on `workflow_dispatch` with
  `target=pages`: `PATH_PREFIX=/marketingaskola-site/` + `PREVIEW=1` (noindex).

**Live on SiteGround since 3 Sep 2026.** The cutover was a folder swap over
SSH; the WordPress install is still on the server as
`public_html_wordpress_2026-09-02` for rollback (delete it once confident).
The workflow flushes SuperCacher's dynamic cache after every upload through
the server-side CLI (`site-tools-client domain-all update id=1 flush_cache=1`
over SSH) — without it nginx kept serving the previous HTML. SiteGround's
bot challenge (`protect_captcha`) answers datacenter IPs such as GitHub
Actions runners with a 202 page, so the workflow verifies the upload over
SSH and treats a challenged HTTP smoke test as a warning; `npm run check:live`
and `npm run test:mobile` from a normal network are the real checks. GitHub
Pages still hosts the noindex preview (`workflow_dispatch`, target=pages).
The full checklist (backup, SSH key, secrets, first deploy, cache flush,
Search Console, rollback) is in `docs/siteground-cutover.md`. DNS
already points at SiteGround and email is on Google Workspace, so the
cutover is a file swap, not a DNS change.

## A red deploy usually still shipped — check WHICH step died (8 Sep 2026)

`deploy.yml` goes red often, and the run's status on its own tells you
nothing. Three distinct failures, and **only one of them keeps changes off the
live site**:

| Failed step | Ran before rsync? | Is the change live? |
| --- | --- | --- |
| `Run npx @11ty/eleventy` | yes | **No** — real build break |
| `SSH key` | yes | **No** — nothing uploaded |
| `Smoke test the live site` | no | **Yes** — upload already succeeded |

- **Build break** is almost always front-matter YAML: an unescaped `"` inside
  a double-quoted `description:`. That took three consecutive red runs on
  5 Sep before it was spotted, because it was misread as a shell artefact.
- **`SSH key`** is five `Connection timed out` attempts to the SiteGround
  host, before rsync, so nothing reaches the server. Seen 8 Sep 21:09 UTC.
  It cleared on `gh run rerun <id> --failed`, so treat it as intermittent
  before assuming a broken credential.
- **`Smoke test the live site`** runs last, after rsync, the SSH verify and
  the cache flush. A failure here means the deploy worked and the *test* is
  wrong or the runner was challenged. `check-live.mjs` exits 3 for
  SiteGround's `protect_captcha` and the workflow downgrades only that to a
  warning; any other non-zero is a hard failure.

**The trap this created:** `check-live.mjs` asserted that `/seo-pakalpojumi/`
301s to `/pakalpojumi/`. When that URL became a real page on 8 Sep the
assertion was not updated, so every deploy went red at the last step while
deploying perfectly. Two days of that trains you to wave red runs through —
and the very next failure was the SSH one, which genuinely had shipped
nothing. **Fix a failing smoke test the day it starts failing.**

`gh` is logged in on this machine, so `gh run list`, `gh run view --log-failed`
and `gh run rerun <id> --failed` all work directly.

**Do not grab the run id with `--limit 1` straight after a push.** GitHub has
not created the run yet at that moment, so you get the PREVIOUS run, watch it
succeed, and then read a live site that has not been updated - which looks
exactly like a deploy that ran and did nothing. Filter by the commit instead:

```
SHA=$(git rev-parse HEAD)
RID=$(gh run list --workflow=deploy.yml --limit 10 --json databaseId,headSha \
      -q ".[] | select(.headSha==\"$SHA\") | .databaseId" | head -1)
```

**A fourth status: `cancelled` is not a failure.** The workflow sets
`concurrency: { group: deploy, cancel-in-progress: true }`, so pushing again
while a deploy is running kills the earlier one. Two commits in quick
succession therefore leave a `cancelled` run behind that never deployed, and
only the last push's run matters. Do not go debugging a cancelled run.

**The cheapest proof a CSS/JS change actually reached visitors** is the
cache-bust hash: compute `sha1(_site/css/style.css)[:8]` locally and compare
it against the `?v=` the live HTML references. Equal means live; different
means the deploy has not landed, whatever the run says.

## WhatsApp entry point (2 Sep 2026)

`.wa-float` in `base.njk` is a fixed click-to-chat link to `wa.me/37126673384`
with a prefilled Latvian message naming the page and its URL (`bareTitle`
filter strips the brand suffix). **Cyan fill by owner request** ("make the background cyan so it sticks
out") - the one deliberate exception to the one-cyan-CTA-per-viewport
rule; styled like `.btn`. Icon + label on desktop, icon on phones; back-to-top stacks above
it and the consent card sits above it on phones. `data-track="whatsapp-float"`
is there for a GTM click trigger once analytics is on. The AI assistant plan
that would sit behind it is in `docs/ai-assistant.md` — not built.

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
  `.media` → `.paper > .article-shell > .article-grid` (`.article-body` in a
  640px column + sticky `.toc`) → dark `.cta-band` → dark related posts.

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
- **In-article infographics (3 Sep 2026) — the one place text in pixels is
  allowed.** Owner: *"OpenAI image 2 is very good with Latvian texts, so do
  proper infographics."* Slots with `"style": "paper"` get the white-paper
  typography brief (navy ink, cyan accent, Inter-like type) and their prompts
  carry the exact Latvian strings in «guillemets»; generate at
  `quality: "high"` and proof-read every image — regenerate with
  `--force --only=<id>` on any misspelling. The `infographic` shortcode —
  `{% infographic { id, title, items } %}` — renders the image plus a
  collapsible text version (`<details class="infographic-text">`) so the
  content stays accessible and indexable. It renders nothing until
  `src/img/gen/<id>.webp` exists. Six articles carry one each. Covers and
  page artwork stay text-free.

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
honeypot, payload contents, success panel. **16/16 as of 7 Sep 2026.** It had
been failing since 4 Sep for a reason that was never the form: it drove the
course form on `/seo-kursi/`, and once all three courses got a Stripe
`bookUrl` that page renders the buy button instead, so `form("course")`
survives only on the hub. The preselect assertion went with it - the preset
path (`form("course", { course: courseName })`) is NOT dead code, it is what
`course-sessions.njk` renders for a course with no `bookUrl`, so put the
assertion back against any course that ever loses its Stripe link.

**Every submit in that test goes through the `submit()` helper, and must.**
`html { scroll-behavior: smooth }` makes scrolling asynchronous, and
puppeteer's `click` scrolls the target into view and then clicks its
coordinates - on a long page the animation is still running when the click
lands, so it hits whatever is under those coordinates. The hub's form sits
~7 200px down and failed exactly this way while the identical code passed on
`/sazinies/` at ~1 050px. The helper pins `scroll-behavior: auto` and centres
the button first. Suspect this the moment a headless click "succeeds" and
nothing happens.

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

- **Chrome path**: every headless tool (`screenshot`, `test:nav`, `test:hero`,
  `test:forms`) resolves Chrome through `tools/_chrome.mjs` — macOS, Windows
  and Linux defaults, or `CHROME_PATH=…` to override. They used to hard-code
  the Windows path and silently failed on a Mac.
- `tools/check-site.mjs` rewrote `/` to `\\` when building paths, so on macOS
  every internal link was reported BROKEN. Fixed 2 Sep 2026; `npm run check`
  is trustworthy on all platforms now.

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

**Videos are local now (2 Sep 2026).** All nine clips (eight case studies plus
the Instagram-templates demo) were downloaded and transcoded with ffmpeg
(libx264, preset slow, crf 27, faststart, AAC 96k) into `src/video/`:
52 MB of originals became 14.9 MB, no clip over 3 MB, frame sizes kept
(Lumi's 1080x1920 capped to 608x1080). Each has a WebP poster frame next to
it, and the `<video>` tags use `poster` + `preload="none"`, so a page load
fetches nine small posters instead of nine MP4 headers. The Instagram demo is
2.57:1 and sets `--ar: 1218 / 474` inline. `src/video/` ships through the
referenced-assets copy step (see the second-pass section), not a passthrough.

**One open content item, flagged not changed:** the Lumi copy says
"vertikāls Reels un horizontāls Feed" and describes making both formats, but
all four clips are vertical. Either the horizontal Feed cuts were never
uploaded, or they should be added.

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

## One reading pattern per page (8 Sep 2026)

Owner, relaying a friend: *"when he looks at the page he's not sure where he's
supposed to look and what to read."* Audited by measuring the rendered
hierarchy, not by eye, and it was two concrete faults rather than taste.

**1. Stat numerals were impersonating section headings.** `.stat .num` sat on
`--t-d3`, the same token as a section `h2`, and shares its weight (600) and
colour (`--heading`). So a numeral rendered at 46px white — pixel-identical to
a section title. `/portfolio/` presented **12 numerals against 6 real
headings**: twice as many false entry points as true ones, which is exactly
what "I don't know where to look" feels like. Numerals now sit one rank down
on `--t-d2`. They are still the largest thing in their own cell by a mile (the
label is 12px), so they keep their punch without pretending to open a section.
The mobile hero had already done this locally. **Do not put `.stat .num` back
on `--t-d3`** — and if a new device wants that size, remember `--t-d3` means
"this begins a section" and nothing else.

**2. Two course pages had no reading path.** `/meta-reklamas-kurss/` and
`/google-ads-kurss/` open 01 Par kursu → 02 Kam paredzēts → 03 Kursa saturs.
`/seo-kursi/` and `/tiktok-kursi/` dropped the reader straight into
`.course-body` with three unlabelled same-size `h2`s and only reached their
first eyebrow halfway down the page, where a "01" then implied the page
started there. Both now carry the full numbered path from the top. **All four
course pages open on "01 Par kursu"** — keep it that way when adding a fifth.

**The anchor is the indexed eyebrow**, not the heading: cyan tick, `01`, a
label, and a rule flexing to the edge inside `.sec-head`. Every content
section on every marketing page now has one — 87 of 88. The single exception
is the featured post card on `/blogs/`, whose `h2` is a post title
(`.post-title`), not a section head, and must stay that way for the blog
index's document outline.

**A `.sec-head` is a TWO-column grid**: eyebrow + `h2` on the left, `.lead` as
its SIBLING in the right-hand column. Putting the intro `<p>` inside the left
`<div>` renders it as body copy under the heading instead of as the lead, and
that is a different-looking section. Two of mine did exactly that and were
corrected the same day.

## The article column is 720px, and the left rail must be `1fr` (9 Sep 2026)

Owner: *"can you make blog post width slightly bigger"*. Measured before
changing anything, and the finding was not what these notes claimed — they
said 68ch, which had been stale for a while.

`.article-grid` is `1fr minmax(0, 640px) 210px`: an empty left rail, the
reading column, the sticky TOC. **The rail has to be `1fr`, not a length.**
It was `210px`, and `minmax(0, 210px)` is no better — grid hands free space to
every track that can still grow, so the empty rail competed with the reading
column and both stopped short (verified: the measurement did not move at all).
An `fr` track absorbs only what is left *after* the other tracks reach their
growth limits, so the column reaches its 640px cap first and the rail takes
the remainder.

What that was costing, measured at `--container: 1200px` (inner 1104px):

| Viewport | Was | Now |
| --- | --- | --- |
| 1440px | 592px (~70 ch) | 640px (~76 ch) |
| 1280px | 602px | 640px |
| **1100px** | **522px (~62 ch)** | 640px |
| 1020px and below | 640px | 640px |

The 1100px row is the one that mattered: a small laptop got the *narrowest*
column on the site, narrower than the single-column layout a phone gets,
because that width is the squeeze just before the 1020px breakpoint drops the
TOC.

**Raised to 720px later the same day, on the owner's second ask** (*"make blog
text area wider.. I thought I already asked you that"*). That is ~85
characters at the 18px body size, past the classic comfortable measure, and
that is the owner's call rather than an oversight - it has now been asked
twice. Measured at 1440 / 1280 / 1100 / 1020px: a flat 720px with no
horizontal overflow. If it goes wider again, raise the body size with it.

**No rule and no cyan tick above an article `h2`.** One was added earlier the
same day to break up the white column; the owner read it as a *"weird section
break"*. Inside running prose the heading IS the break, and a hairline every
few paragraphs chops the reading. The tick device belongs to eyebrows and
steps, not to body copy.

The text column ends up ~25px left of page centre, because the `fr` rail
absorbs the slack instead of `justify-content` splitting it. That is invisible
in use and is the trade for the width; recentring exactly would need a wider
container scoped to articles.

Side effect worth knowing: in-article infographics render 48px wider, which
helps — their baked-in labels were already marginal at small sizes.

## Geometry — SQUARE, one decision (21 Aug 2026)

The stylesheet had **seven** corner treatments at once: 8px, 6px, 5px, 4px, 2px,
0 and 50%. Owner: *"too much of a mix of square and rounded… just use one and
stick with it."*

`--radius: 0` and `--radius-btn: 0`. Every ad-hoc 2/4/5/6px radius is gone.
Square is the right half of the choice because the system is already a ledger —
hairline grids, indexed eyebrows, corner ticks on panels, depth from hairlines
and never shadows. Rounded corners were fighting all of it.

**The only circle left is one true dot** — the 3px separator in `.article-meta`.
(The 4px travelling signal on `.logo-strip` was removed on 21 Aug 2026: owner
did not want the dot animation there. The hero dots are the one place motion of
that kind lives.) Containers, images, avatars and buttons are boxes and read as
boxes. If you add a rounded element, you are
reopening a decision that was made deliberately — change the token instead.

## The topbar is a CYAN strip and it sticks (7 Sep 2026)

Owner: *"improve the design of 2nd nav bar (on top) with number and email;
make them always visible; cyan background, dark navy typography."*

**This is the second deliberate exception to the cyan budget**, after the
WhatsApp float. The phone number and the address are the first two things a
service buyer looks for, so they get the one loud surface on the site.
Do not "fix" it back to `--canvas` — it is the owner's call, twice made.

- Ground `--cyan`, ink `--navy-ink` (#00152c) at weight 500. **8.9:1**,
  past WCAG AAA. Never reach for `--muted` here: those three text tiers
  exist for the dark canvas and would fail on this ground.
- **Both bars stick.** `.topbar` is `sticky; top: 0` and `.header` is
  `sticky; top: var(--topbar-h)`, so the contacts never scroll away. The
  token is 32px, 36px under 640px, and **the header's `top` reads it — if
  the strip's height ever changes, change the token, not the rule.**
- Because the sticky chrome grew, `[id] { scroll-margin-top: calc(var(--topbar-h) + 88px) }`
  keeps a linked heading from landing underneath it, and the mobile nav's
  `max-height` went to `calc(100vh - 160px)`.
- The hover hairline that used to be cyan is now navy; the social marks
  invert the strip instead (navy square, cyan glyph).
- **On phones the e-mail stays and the SOCIAL MARKS give up the room.**
  That reverses the 3 Sep decision to hide the e-mail under 640px. At
  375px the two contacts measure 113px and 175px and sit on one line with
  the strip at `--t-micro`; the marks are in the footer anyway. Adding a
  third item to the strip will break that line — measure before you do.

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

## Homepage hero backdrop — drifting dots (21 Aug 2026)

`src/_includes/hero-fx.njk` puts seven small cyan squares on curved paths behind
the homepage headline. That is the whole effect.

The first version added a hairline lattice, an attribution fan, firing nodes, a
hub and a scan line on top of the dots. Owner: *"thats way too much. no grids or
anything, just some simple animations… the blue moving dots I like."* All of it
is gone; only the dots remain, on more interesting paths.

**It uses SVG `<animateMotion>`, not CSS `offset-path`.** offset-path animates
fine, but its coordinates do not compose with the viewBox transform, so the dots
rendered hundreds of pixels outside the hero. animateMotion lives in the SVG
user coordinate system and scales with the viewBox for free.

**The viewBox aspect has to sit near the hero's real aspect.** It was 1440x620
against an 879px-tall hero; because `slice` scales to COVER, that upscaled
everything 1.4x and cropped ~210 units off each side, throwing three of the
seven dots out of frame. At 1440x900 nothing is clipped on desktop.

**Paths avoid the headline.** Every route runs through the top band, the bottom
band or the outer margins. A cyan dot sliding across the white headline reads as
a rendering artifact, not as design.

**The layer is bounded to `.hero-stage`, not to `.sec--hero`.** The client logo
strip lives inside the hero section too, and an inset:0 layer drifted dots
straight over the logos. Note an `<svg>` is a REPLACED element: with `height`
unset it takes its intrinsic viewBox ratio and IGNORES `bottom`, so the height
must be given explicitly or the layer silently runs past the stage.

**Dropped entirely below 980px** (where `.hero-grid` collapses to one column and
the headline grows into the bands the paths avoid) and under
`prefers-reduced-motion`. CSS cannot pause a SMIL timeline, so removing the
layer is also the only honest way to stop it.

`npm run test:hero` samples every dot eight times over its path and asserts none
leaves the hero box, none overlaps the headline, they are actually moving, there
are no long frames, the layer is pointer-inert and the hero CTA is still
clickable through it. 11/11.

**Founder portrait crop.** `.media--crop-top` (1:1, `object-position: bottom`)
is on the homepage founder figure. The 3:4 frame carries deliberate headroom
above the subject, which made the process section the tallest on the page. The
photograph occupies the bottom square of that frame, so a 1:1 bottom-anchored
crop removes the drawn headroom exactly and takes nothing off Rihards. The
section went 1190px → 1047px, and the steps column is now the tallest element
rather than the picture.

## Second pass — SEO, sharing, performance, privacy (2 Sep 2026)

An audit of the built site found a handful of things that would have broken
at the domain cutover and a longer list of SEO/performance gaps. Everything
below is in place; the mechanisms live in `eleventy.config.js` unless noted.

**Head and sharing.** `<title>` uses one separator (`… | Mārketinga Skola`;
posts keep the WordPress `seoTitle`). Every page emits og:site_name/locale,
og:image with width/height, Twitter cards, a canonical (dropped on `noindex`
pages), `theme-color`, a web manifest (`src/manifest.njk`), `/favicon.ico` and
an Atom feed link (`/feed.xml`, `@11ty/eleventy-plugin-rss`). Pages without
an `image:` fall back to `site.image` (`/img/og-default.jpg`).

**og:image is always a JPEG.** `npm run derived` (`tools/derived-images.mjs`)
writes a 1200x630 `<name>-og.jpg` next to every front-matter `image:` (the
generated covers exist only as WebP, which WhatsApp/LinkedIn previews still
mishandle) and the `ogImage` filter picks the twin up when it exists. Re-run
it after adding a page image or a cover; the optimizer skips `-og.jpg` files.

**Structured data.** The `schemaGraph` filter builds one JSON-LD graph per
page: Organization + ProfessionalService (address, phone, VAT, socials from
`site.json`), WebSite, WebPage, BreadcrumbList, BlogPosting on articles and
Course on course pages. Breadcrumb parents come from `crumb:` front matter
(`{ label, url }` on service, course and product pages); course facts come
from `course:` front matter (`name, level, hours, price, vatIncluded, mode,
instructor`) copied from each page's own chips — keep them in sync with the
visible price. TikTok has no offer because the page says it is not running.

**Sitemap / robots.** `sitemap.njk` formats `updated` through `isoDate` (it
used to emit raw JS Date strings for 31 posts), category pages are included
(`addAllPagesToCollections: true` on the paginated template — without it only
the first category made it into `collections.all`), and any page with
`noindex: true` in front matter gets `<meta name="robots" content="noindex">`,
no canonical and no sitemap entry (`/vebinars-paldies/`, `/404.html`).

**Assets: only what is referenced ships.** `src/img` holds every original next
to its `.webp` twin, and a blanket passthrough shipped ~37 MB of files no page
used. An `eleventy.after` step now scans the output for `/img/`, `/video/`
and `/fonts/` references and copies just those. `npm run check` is the safety
net: a needed file that nothing references shows up as BROKEN. CSS references
count too (`fonts.css`); the scan reads html/css/js/xml/json/webmanifest.

**Layout shift.** The `imgDims` transform reads every local `<img>` without
width/height and injects the intrinsic size (sharp metadata, cached), so
legacy post images no longer shift the page. Article hero covers carry
`fetchpriority="high"`. Team portraits are lossy WebP now (q84; 1.7 MB became
350 KB across nine files) and `brand-portraits.mjs` verifies the lossless
composite in memory before encoding. The author box loads a 160px thumbnail.

**Fonts are self-hosted** (`src/fonts/`, `src/css/fonts.css`): Google's own
variable woff2 builds of Inter and Space Grotesk, latin + latin-ext (the
Latvian diacritics), four files / 171 KB, `font-display: swap`, the two latin
files preloaded. No more fonts.googleapis.com round trip. `fonts.css` uses
`../fonts/` URLs so the github.io preview prefix works. OFL texts sit beside
the files.

**Embeds.** Five posts carried WordPress lazy-load iframes (`data-src`, no
`src`) that never loaded; they are plain `src` + `loading="lazy"` now, and
every YouTube embed uses `youtube-nocookie.com`. Third-party tool logos in
the AI-tools post are local (`src/img/2026/09/`); two dead affiliate links
point at the vendors' own sites.

**Meta pixel is live too (6 Sep 2026): `3817680101624891`**, in
`site.analytics.metaPixelId`, loaded by the same consent gate as GA4 and never
before "Piekrītu". `consent.js` maps the site's GA4 events onto Meta standard
events — `generate_lead`→`Lead`, `begin_checkout`→`InitiateCheckout`,
`schedule_booking`→`Schedule`, `contact_click`→`Contact` — so one `msTrack`
call feeds both. Verified on the wire: PageView, Lead, InitiateCheckout and
Contact all reached pixel 3817680101624891, and refusing consent loads nothing
from Meta or Google at all.

**Meta CAPI runs through n8n (6 Sep 2026).** The earlier note that CAPI was
impossible here was wrong once the owner pointed at n8n: the missing server is
the n8n Cloud instance they already run. Workflow **"Mārketinga Skola — Meta
CAPI relay"** (`KiiDciCuUsCc3ezc`, personal project) exposes
`POST /webhook/meta-capi`, hashes anything still raw, and forwards to
`graph.facebook.com/v21.0/3817680101624891/events`.

**Both roads share one `event_id`.** `msTrack` mints an id, passes it to the
pixel as `{ eventID }` AND to the relay, so Meta keeps one event rather than
counting the conversion twice. This is the part that silently double-counts if
someone later changes one side without the other.

**Personal data is hashed in the BROWSER**, not in n8n: `consent.js` SHA-256s
email and phone (trimmed/lowercased; phone digits only, per Meta's
normalisation) before the request leaves, so raw identifiers never reach n8n or
its execution logs. Verified against Node's crypto: the browser hashes match
byte for byte. The workflow also has `saveDataSuccessExecution: none` and
routes failures to the shared alert workflow `R9OmXjBXdhYetZkM`.

**The relay is LIVE as of 7 Sep 2026** and verified end to end: a POST to
`/webhook/meta-capi` carrying `x-ms-secret: ms-site-2026` came back
`{"ok":true,"events_received":1}`, and the same request with a wrong secret
dies in the Code node without ever reaching Meta. Three things had to be
fixed, and all three would have kept it dead on their own:

1. **`$env` throws on this instance.** It runs with
   `N8N_BLOCK_ENV_ACCESS_IN_NODE`, so `$env.META_CAPI_SECRET` raised
   `ExpressionError: access to env vars denied` and the workflow died at the
   Code node before the HTTP request. **Never reference `$env` in a Code
   node here** — the shared secret is a literal in the node for that reason
   (it ships in client JS anyway, so it was never authentication).
2. **The credential type has to match the node.** The owner created
   `Mata CAPI Token` as `httpCustomAuth`, while the node was set to
   `httpTemplatedCustomAuth`; n8n will not attach across types, so the node
   silently had no credential. The node is `httpCustomAuth` now.
3. The workflow then had to be published, not merely saved.

**Successful executions are not stored** (`saveDataSuccessExecution: none`),
so an empty execution list after a good request is the expected result, not
evidence of failure. Errors ARE stored and routed to the shared alert
workflow `R9OmXjBXdhYetZkM` — which means every probe with a bad secret
raises an alert. If that ever gets noisy, replace the `throw` with an IF
node that answers politely instead.

**What was already sending CAPI events, investigated 6 Sep 2026.** The owner
noticed Events Manager still showing Conversions API traffic. It is real but it
is not ours and it is not healthy:

- the event is **`pageView` in lowercase**, which is NOT Meta's standard
  `PageView`. Meta files it as a custom event, so it cannot drive standard
  optimisation and never aggregates with the real `PageView` row;
- it **stopped 3 days before** (the 3 Sep cutover), like everything else;
- it comes from **`meistarklase.marketingaskola.lv`**, a "Meta Reklāmas
  Vebinārs" landing page, not from marketingaskola.lv. The pixel
  3817680101624891 is shared across **four** websites.

That page is a **Lovable app** (`gpt-engineer-file-uploads` assets,
`/~flock.js`) behind Cloudflare, with the pixel hardcoded client-side. The
CAPI sender itself could NOT be identified from outside: `/~flock.js` is only
Lovable's web-vitals bundle, and neither Supabase project has any edge
functions. It is most likely a Lovable or partner integration configured
inside Events Manager. **Find and fix or retire it before switching our relay
on**, or two senders with different naming conventions will write to one
dataset. Event Match Quality on the dataset is currently **6.1/10**, under the
~7 Meta considers workable.

**Stripe → CAPI is written but NOT created in n8n.** The workflow is validated
and preserved in `docs/n8n-stripe-to-meta-capi.md`; the automated creation call
was refused by a permission classifier, so it needs pasting in by hand. It is
the most valuable of the three because it is server to server (immune to
blockers) and carries the real amount, and it uses the Stripe session id as
`event_id` so retries cannot double-count.

**`capiSecret` in site.json is obfuscation, not authentication** — it ships in
client JS and anyone can read it. It stops drive-by noise. The genuinely
tamper-proof events would be server-to-server ones (Stripe purchase,
MailerLite subscribe) posted to the same webhook; those are NOT built yet and
are the obvious next step, because they also carry real revenue values.

**The privacy policy was wrong about the host.** It still named GitHub Pages
as the processor doing the hosting, three days after the 3 Sep 2026 cutover to
SiteGround; corrected, and Meta Platforms Ireland added to the processor list
now that its pixel runs. **The exact SiteGround legal entity is not stated —
confirm it with the owner and add it.**

**CSS and JS are cache-busted, and they have to be.** `.htaccess` asks for
"access plus 1 day" on CSS/JS, but **SiteGround's own cache layer overrides it
and serves them with `max-age=31536000` — a full year.** Without a changing
URL, a returning visitor keeps last year's script: this silently swallowed the
analytics rollout on 6 Sep 2026, and the browser was still running pre-deploy
JS while the server had the new file. `base.njk` now passes every CSS/JS href
through the `bust` filter (`eleventy.config.js`), which appends `?v=<8 hex of
the file's own sha1>`, so the URL changes when and only when the file does.
Verified by editing a file, rebuilding and reverting: the hash moved and came
back. **Any new CSS/JS reference must use `| bust` or it will not reach
returning visitors.**

**Analytics + consent. GA4 IS LIVE (6 Sep 2026), loaded DIRECTLY, not via
GTM.** `site.analytics.ga4Id` = `G-5SEQ339399`; `gtmId` stays empty. Setting
EITHER renders the consent card (`.consent`) and `src/js/consent.js`, which
sets Consent Mode v2 defaults to denied, loads nothing until "Piekrītu",
remembers the choice in localStorage and reopens from the footer "Sīkdatņu
iestatījumi" button. Never on `PREVIEW` builds. The gtmId path still works
and both can run together.

**Why direct and not the container** (owner's call, asked and answered):
`GTM-MVJJGQ4` still holds two tags last edited in 2020 — a **dead Universal
Analytics** tag (Google shut UA down in July 2023) and a **Facebook Pixel set
to fire on All Pages**. Publishing that container to turn analytics on would
have switched that pixel back on as a side effect. Nothing in the Google
accounts was changed. If the container is ever cleaned up, set `gtmId` and
clear `ga4Id`.

**How the tracking was lost in the first place, worth knowing:** the GA4 data
stream is named *"MonsterInsights - marketingaskola.lv"* — a WordPress
plugin. It died with the WordPress install at the 3 Sep 2026 cutover, and the
static site carried no tag at all, so GA4 recorded **no data from 3 to 6 Sep**.
Anything in GA4 dated before the cutover is WordPress-era; the page titles in
those reports are the old ones and do not match the current site.

Verified end to end in the browser before shipping: before consent zero
Google requests and all four Consent Mode signals denied; after "Piekrītu"
gtag.js loads, consent updates to granted and a real hit reaches
`region1.google-analytics.com/g/collect?v=2&tid=G-5SEQ339399`; after
"Noraidīt" zero Google requests on reload.

**The consent card could not be closed until 7 Sep 2026.** Owner: *"a cookie
banner that wont close at the button click"*. `consent.js` was doing its job
(`banner.hidden = true`, choice saved, gtag and fbq loaded) but
`.consent { display: grid }` is a class rule and outranks the browser's own
`[hidden] { display: none }`, so the card stayed painted. The stylesheet now
opens with `[hidden] { display: none !important; }`, so the attribute wins over
any display rule. **Toggle visibility with `el.hidden`, never with a class
that sets `display`** - and if you give an element a `display` rule, it will
still hide correctly because of that reset.

**Sitemap `lastmod` comes from git, not the filesystem (7 Sep 2026).**
Eleventy dates a page from its file mtime, and `actions/checkout` rewrites
every mtime to the clone time — so the LIVE sitemap stamped all 21 pages
with the deploy day and all 40 posts with `updated: 2026-09-05`. A lastmod
that moves for every page on every deploy is false, and it is a signal
crawlers learn to ignore, so it was worse than having none. The `lastmod`
filter now resolves, in order: an explicit front-matter `updated:`, then
the date of the last commit that touched the source file (one `git log`
pass, cached for the build), then the file date. **`deploy.yml` sets
`fetch-depth: 0` on both checkouts** — without the history every file maps
to the one fetched commit, so the filter refuses a map with a single
distinct date and warns rather than silently recreating the cluster.

Post `updated:` dates were spread across August–7 September the same day.
Two rules hold and must keep holding: **`updated` is never earlier than
`date`**, and the eight posts published in that window have `updated ==
date`, which is what suppresses the reader-facing "atjaunots" line in
`post.njk` for a post that has not actually been revised.

**GA4 key events are set (8 Sep 2026).** In the property (363934063,
`marketingaskola.lv`) under Data display → Events, three are starred and all
three are live on the stream: **`generate_lead`, `begin_checkout` and
`contact_click`**. Without this Google Ads cannot import them as conversions
and nothing in GA4 says which article produces an enquiry, which is what
should choose the next post.

**`schedule_booking` is NOT starred and cannot be yet** — GA4 only lists
events it has seen in the last 28 days, and nobody has clicked a Cal.com link
since tracking went live on 6 Sep. Star it once it appears; the code already
fires it (`main.js` delegated click handler, any `cal.com` href).

Three legacy key events remain from the MonsterInsights era and all say "No
stream data detected": `close_convert_lead`, `purchase`, `qualify_lead`. They
were left alone deliberately — harmless, and unstarring is the owner's call —
but they do pad the conversions report with rows that will never populate.

**Meta descriptions were rewritten for CTR the same day.** Google bolds query
matches inside the snippet, so eight descriptions that never contained their
own focus phrase were throwing away the cheapest CTR gain available to a page
that already ranks (`/b2b-marketings/` never said "B2B"; `/maksliga-intelekta-riki/`
said "MI rīki" while searchers type "mākslīgā intelekta rīki"). Length was NOT
the problem and was left alone: only four descriptions sitewide are under 120
characters and three of those are correct.

**Headings and link names.** Footer and TOC labels are `<p class="footer-h">` /
`<p class="toc-h">` (they were h4s that skipped levels on every page); post
cards use `.post-title` — h2 on the blog index and category pages, h3 where a
section h2 precedes them. The `cellLinkLabels` transform gives every
"Uzzini vairāk" inside a `.cell` an aria-label ending in the cell's h3. The
nav toggle has `aria-controls`, active links `aria-current`.

**Blog index search.** `/blogs/` has a client-side filter over title,
description and category (diacritics folded, so "marketings" finds
"mārketings"); the count and an empty state update live.

**Services grid.** The seventh cell on `/pakalpojumi/` spans the row
(`.cell--wide`) instead of leaving two empty cells.

**Copy.** Category pages have real descriptions (`categoryList.json`), eight
meta descriptions were trimmed under 160 characters, four titles gained the
brand, the "2025. gadam" e-book copy is evergreen, and five bare "šeit" links
say where they go.

**The two year-stamped permalinks are gone (5 Sep 2026, owner's call).** Their
titles already said 2026 while the URLs still said 2025, and these articles are
rewritten every year, so the year had to leave the URL rather than be bumped:
`/5-digitala-marketinga-tendences-2025-gada/` → `/digitala-marketinga-tendences/`
and `/google-reklama-2025/` → `/google-reklama/`. Both old URLs 301 in
`src/.htaccess`, and all 24 internal references were repointed. The SOURCE
FILENAMES deliberately keep their old slugs (`google-reklama-2025.md`), because
`apply-covers.mjs` derives `cover-<filename>.webp` from them and renaming the
file would orphan the cover image. The permalink is explicit in front matter,
so the filename never reaches a URL.

## Homepage and service tiles — imagery pass (3 Sep 2026)

Owner: *"add images for service tiles so it doesn't look so empty; change
the image next to testimonials, looks weird; improve the above-the-fold
hero on mobile."* Done from assets already in the repo (no image API on
this machine):

- **Service tiles** (`.cell--media` + `.cell-media`, 16:10, index in a
  canvas-coloured box on the picture): **generated house-style artwork only.**
  A first pass used real campaign photos (Brew Company, an improv actor, the
  Četras Zoles creatives); owner: *"change the pictures you added on the
  frontpage from old website to stylized images we have now for consistency,
  otherwise it looks quite terrible."* All ten tiles across `/` and
  `/pakalpojumi/` now reuse the existing dark artwork —
  `meta-targeting-band`, `video-formats-band`, `smm-orbit-band`,
  `ai-flow-band`, `konsultacijas-saruna`, `seo-mekletaja-motivs`,
  `kursi-programmas-motivs`. Do not put photographs in this grid.
- **Testimonials are three equal quotes** (`.row.cols-3`), no picture. The
  left column used to hold filler artwork, which also forced the first quote
  into a different shape from the other two.
- **Mobile hero**: e-mail hidden from the topbar under 640px (it is in the
  footer and the WhatsApp float), hero padding cut, stats as three compact
  ledger rows instead of a 340px card, so the client-logo strip reaches the
  first screen at 390x844. Measured, not eyeballed: `npm run test:mobile`
  plus the hero geometry check in the session notes.

## IA change — courses simplified, products retired (3 Sep 2026)

Owner: *"I don't want to deal with inquiries about TikTok kursi and Facebook
(video)… ideally we just push the traffic from them towards paid
Konsultācijas. Swap Visi kursi menu under item link to Kursi and just link
the page as main nav page. Also remove Produkti page / nav item for now and
100 veidnes / sociālo mediju rokasgrāmata, as they are all outdated."*

- **Nav is six flat items**: Sākums · Pakalpojumi (the only dropdown) ·
  Portfolio · Kursi · Blogs · Sazinies. `Kursi` links straight to
  `/digitala-marketinga-kursi/`; its dropdown is gone.
- **`/tiktok-kursi/` keeps its page and its SEO** but no longer collects
  intake. Every CTA goes to `/marketinga-konsultacijas/` and the copy says
  the group course is not running and names the consultation prices.
- **`/produkti/`, `/bezmaksas-e-gramata/` and
  `/100-instagram-stories-veidnes/` are `noindex: true`** — out of the nav,
  the footer and the sitemap, but **not deleted and not redirected**. The
  templates page still holds a working Stripe link (6,99 €) and old ads may
  point at it, so the URLs must keep answering 200. Reversible: delete the
  `noindex` line to bring a page back.
- **`/socialo-mediju-marketings/` is taken out as a service (4 Sep 2026).**
  Owner: *"take out sociālo mediju mārketings as service for now to compress
  the offerings; niche down."* Same treatment as the products: `noindex`,
  out of the nav, the footer and the services grid, but the URL still
  answers 200. The grid is six tiles now, which fills two rows of three
  exactly, so `.cell--wide` is no longer used on that page. Three blog
  posts sold the service in body copy and were rewritten to point at
  consultations and the Meta course instead. Reversible: delete the
  `noindex` line and put the nav entry and tile back.
- **`/facebook-kursi/` is retired and 301s to `/meta-reklamas-kurss/`.**
  Owner: *"the video course is old too. See which content is better and keep
  just one, and merge them into one solid LP with online (not recorded)
  course as main product."* The recorded course's marketing copy was much
  the stronger of the two (audience personas, the "svētais Grāls" argument,
  the 36,34 € ROAS example, the instructor bio, B2B invoicing, LIFT, the
  FAQ), so that copy moved onto the live course's page; the **syllabus stays
  the live course's five modules**, because claiming the recorded course's
  nine modules for a three-hour live session would be false. Claims tied to
  the recording did NOT move: 45 lectures, 6,5 h, one-year access, the
  30-day money-back guarantee, the 295→145 price and the Thinkific link.
  The Thinkific product still exists for people who already bought it; the
  site no longer sells it.
- **The paid consultation books itself (4 Sep 2026).**
  `src/_data/booking.json` holds the three formats (60 min / €90, 30 min /
  €60, 5 × 60 min / €370), each with a live Stripe payment link and the
  Cal.com event it lands on. **It is the only place those prices live** — the
  page renders every mention from it. The redirect itself is configured in
  **Stripe** (After payment, "Don't show confirmation page"); `calendarUrl`
  in the data file only tells the templates a calendar exists, so the copy
  can promise an instant booking. Empty it and the copy honestly falls back
  to "we will agree a time"; empty a `url` and the section falls back to the
  enquiry form. The bundle redirects to the 60-minute event and its five
  sessions are booked one at a time from that link — nothing enforces the
  count, so it is tracked by eye.
- **Consultations have their own Cal.com schedule.** The course event uses
  "Working hours", which has NO weekly hours, only date overrides for the
  course dates. Attaching a consultation to it would offer only course days,
  so the two consultation events use a separate schedule, **"Konsultācijas",
  currently a placeholder Mon-Fri 9:00-17:00 Riga that the owner should
  adjust**. Google Calendar conflict checking is on, so genuinely busy hours
  are excluded automatically.
- **Live course groups are data, not prose.** `src/_data/courseSessions.json`
  holds `policy` and, per course, `bookUrl` + `calendarUrl` + the dates.
  **One Stripe payment link covers every date**, because its after-payment
  redirect (set in Stripe under After payment) lands the buyer on the Cal.com
  event, where the months are the real availability and the seat limit is
  enforced. So the page lists the dates as information and shows ONE call to
  action; a button per date could not preselect anything anyway. With no
  `bookUrl` the section falls back to the application form.
- **Cal.com is the booking system** (account `rihards-zeila-pglbwc`; calendar
  events land on rihards.zeila@gmail.com, conflicts checked against the
  marketingaskola.lv Google Calendar). The Meta course event
  `/meta-reklamas-pamati` is 3 h on Google Meet with **Offer seats = 12** and
  **no weekly hours at all**: the schedule "Working hours" carries **date
  overrides**, one per course date (first Tuesday monthly, 10:00-13:00 Riga).
  Adding a month means adding a date override there AND a date in
  courseSessions.json - they are the same schedule and must match.
  Cal.com's own payment app is **Cal Pay, not Stripe**, so payment stays on
  the Stripe side where Stripe Tax already adds the 21% VAT correctly.
- **Permalinks are the WordPress URLs.** Posts live at `/{slug}/` (root level,
  not under /blog/), pages keep their slugs, categories at `/category/{slug}/`.
  Changing any permalink breaks SEO and inbound links at cutover.
- **The EU funding notice and company requisites on `/sazinies/`**
  (SIA "Stonks", Atveseļošanas fonda paragraph) are legally required — never
  remove or reword them.
- **Forms are hand-coded and submit to MailerLite** (see "Forms" above; the
  Tally iframes are gone) and **course purchases go through Thinkific**
  (`marketingaskola.thinkific.com/enroll/...`) plus one Stripe payment link on
  the Instagram-templates page. These are external services — they keep
  working statically; do not replace them with fake forms.
- **The privacy policy at `/privatuma-politika/`** is linked from every form's
  consent checkbox and the footer. It describes what the site actually does
  (MailerLite, Thinkific, Stripe, GitHub Pages, YouTube/Vimeo, consent-gated
  analytics). Keep it in sync when a processor changes; owner/legal review of
  the wording is still pending (2 Sep 2026).
- Site language is Latvian (`lang="lv"`); keep diacritics intact (files are UTF-8).
- Course pricing shown (e.g. 295€ → 145€) is copied verbatim from the live
  WordPress site — it is the owner's real pricing, only he changes it.

## Repaired links (were broken on the old WordPress site too)

All links that 404'd on the live WordPress site have been repointed (19 Aug
2026, redesign pass): `/meta-reklamas-kursi/` → `/meta-reklamas-kurss/`,
`/7-padomi-marketinga-strategijas-izstrade/` → `/marketinga-strategijas-izstrade/`
(301 live), `/padzilinats-seo-kurss/` and
`/digitala-marketinga-strategija-vaditajiem/` → `/digitala-marketinga-kursi/`,
`/improvizacija-un-izklaide/` →
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

## Third course, LIFT retired, fine print shrunk (4 Sep 2026)

**`/google-ads-kurss/` is a full course page**, built on the Meta page's
structure (hero → par kursu → kam paredzēts → 5 moduļi + sticky aside →
rezultāti → pieteikšanās → pasniedzējs → rēķins → BUJ → katalogs → cta-band).
It is wired into the nav dropdown, the footer, `course-catalog.njk` (now
`hgrid--3`), the course form's dropdown and `courseSessions.json`.

- **Instructor is Kristaps Apeināns**, the agency's Google reklāmas
  speciālists per `/sazinies/`. The "vairāk nekā 10 miljonus eiro" figure is
  the site's own claim, lifted verbatim from `/google-reklama-2025/` — it was
  not invented here.
- **Price 150 € + PVN and 3 stundas confirmed by the owner (5 Sep 2026).**
  They started as assumptions copied from the Meta course; they are now the
  real figures and can be quoted.
- Its `courseSessions.json` entry is empty, so **it falls back to the
  application form** exactly like SEO. To sell seats it needs the same three
  things as Meta: agreed monthly dates, a Cal.com event with seats and date
  overrides, and a Stripe payment link redirecting to that event.

**LIFT is gone — the programme ended (owner, 4 Sep 2026).** Removed: the LIFT
section on the Meta course page (eyebrows renumbered 09→08, 10→09), the clause
in Rihards's instructor bio, the present-tense LIFT sentence in his bio on
`/sazinies/`, the CTA in `kas-ir-seo.md`, and the SEO page's "Pieejams 100%
līdzfinansējums" badge plus the same claim in its meta description — the
co-financing WAS the LIFT programme, so it stopped being true too.
**One reference survives on purpose:** the "LIFT vebinārs" case study on
`/portfolio/` is a record of work actually delivered, not an offer. Delete it
only if the owner asks.

**Fine print under a payment block is small and collapsible.** `.fine` had no
bare CSS rule, so the standalone ones in `course-sessions.njk` and
`booking.njk` inherited body size at full container width and read as a wall
of terms (owner: *"this is too big on course pages"*). There is now a `.fine`
rule (14px, muted, 68ch) and a `.fine-more` disclosure that holds the group
minimum, the cancellation window and the invoice line. **The terms were
shortened in presentation, not removed** — they are consumer terms and the
refund promise must stay reachable.

## Three courses, three non-clashing slots (4 Sep 2026)

Owner set the pattern: Google Ads "anytime after 20. Sept, 14:00, monthly";
SEO the same but not clashing with Meta or Google and later in the day.

| Course | Day | Time | Cal.com event | Schedule |
| --- | --- | --- | --- | --- |
| Meta reklāmas kurss | 1st Tuesday | 10:00-13:00 | `/meta-reklamas-pamati` (6262225) | Working hours |
| Google Ads kurss | 4th Tuesday | 14:00-17:00 | `/google-ads-kurss` (6949203) | Google Ads kurss (2325540) |
| SEO kurss | 2nd Thursday | 16:00-20:00 | `/seo-kurss` (6949227) | SEO kurss (2325556) |

Nothing collides on a date, and nothing collides in time even if a date ever
does. **December's Google date is the THIRD Tuesday (15 Dec), not the fourth**
— the fourth is Christmas week. Each course has **its own schedule with no
weekly hours at all**, only date overrides; the dates in
`src/_data/courseSessions.json` mirror those overrides and the two must be
kept in sync by hand. Both new events were **duplicated from the Meta event**,
which is why they carry Offer seats = 12 and Google Meet without being
configured again.

**Cal.com automation notes, learned the hard way:** if the page reports
`innerWidth: 0` and `document.hidden: true`, the tab is a BACKGROUND tab —
Chromium never lays it out, so clicks register but React never opens the dialog
and screenshots fail with "0 width". It is not a minimised window and resizing
does not fix it. Bring the tab to the front first; on this machine the browser
is **Brave, not Chrome**, so:

```
osascript -e 'tell application "Brave Browser"
  repeat with w in windows
    set i to 0
    repeat with t in tabs of w
      set i to i + 1
      if URL of t contains "<some-url-fragment>" then
        set active tab index of w to i
        set index of w to 1
        activate
      end if
    end repeat
  end repeat
end tell'
```

Reading Cal.com's tRPC API from the page works for inspection
(`/api/trpc/availability/schedule.get?input=…`), but **writing through it is
blocked by the permission classifier** — drive the UI instead.

**More automation notes:** coordinate clicks land on
the wrong row in this browser — always act on a `ref` from `find`. For the
schedule `<select>`, open it and then TYPE the schedule name (or arrow down)
and press Enter; clicking an option by ref or coordinate silently picks its
neighbour. The date-override dialog keeps selections ACROSS months, so all
four dates go in one override with one time range and one Save.

**All three courses now sell seats.** Each has a `bookUrl` in
`courseSessions.json` pointing at a Stripe payment link whose after-payment
redirect lands on the Cal.com event above.

**Resolved 5 Sep 2026: the Meta course does cover tracking, "a bit"**
(owner). Module 1 gained one line — *"Pikselis un konversiju mērīšanas
pamati"* — placed there because that module already covers Business Manager
setup. Deliberately ONE bullet, not a module: the owner said a bit, so the
page says a bit. The blog CTAs now say "konta uzbūve un konversiju
mērīšanas pamati" rather than promising a full walkthrough, and
`/konversiju-uzskaite/` points at the **Google Ads** course for the deeper
treatment, because that one genuinely has a whole module for it (module 5).
The SEO course covers analytics in module 4.

## Offers pass (7 Sep 2026) — prices are data, the ladder has one name per rung

Owner: *"how can we further improve the whole website from offers
standpoint"*, then *"continue on the old offers plan"*. The audit (33 agents,
adversarially verified) found a complete ladder — free 20-min call → 150 €
course → 60/90 € consultation → 370 € bundle → managed ads → automation audit
— that no page showed, with prices typed by hand in five places and the
rungs mislabelled at the joins. The owner-independent items were built; the
owner-gated ones are listed at the end of this section and must not be
guessed at.

**`src/_data/courseSessions.json` is now the ONLY source for a course's
`price`, `hours`, `name`, `instructor`, `cadence` and `proof`.** The hero
chips, the `.course-card`, the Stripe button in `course-sessions.njk`, the
catalog tiles and the JSON-LD `Course` (matched by slug in `schemaGraph`, so
the schema can never disagree with the button) all read it; the
front-matter `course:` blocks no longer carry `price`/`hours`. `booking.json`
does the same for the consultation (`best2` is the 60-minute option's
second fit line, `sessions: 5` drives the bundle's per-session price).
**Never type a price into copy again** — in `src/pages/*.html` use
`{{ courseSessions.courses["meta-reklamas-kurss"].price }}`; in posts use
the `{% offer %}` shortcode. Front-matter `description:` strings are YAML
and cannot render Nunjucks, so the few price mentions there are the
remaining hand-typed ones: grep `+ PVN` in `src/pages` after any change.

- **`gross` filter** (`eleventy.config.js`): `150 | gross` → `181,50`,
  Latvian comma. The consumer-facing total is printed ONCE beside the net
  where a private person buys (course button fine print, each consultation
  cell) — muted text, not cyan. Consumer price rules want the final price
  visible; one parenthetical is not the wall of terms the owner objected to.
- **`{% offer "key" [, "field"] %}`** — keys are the three course slugs or
  the consultation ids `60` / `30` / `bundle5`; fields `price` (default,
  "150 € + PVN"), `gross`, `hours` ("3 stundas"), `cadence` ("pirmajā
  otrdienā katru mēnesi"). An unknown key THROWS at build time rather than
  printing an empty string into a sentence. `lv-polish.mjs` treats it as
  load-bearing like `{% infographic %}` and refuses to write if the model
  altered it. It is applied by hand in each post's closing section with
  varied phrasing — one stamped clause across 41 posts would recreate the
  "bet X puse rakstā Y" template that lv-review just dismantled.
- **Past course dates hide themselves.** Session cells carry `data-date`
  and `main.js` sets `hidden` on any date before today (the Meta page was
  selling 8 Sep like December on 6 Sep). Cal.com remains the real
  availability; this only stops the page contradicting it. If every listed
  date is past, the grid is empty — add dates. The optional daily rebuild
  cron in `deploy.yml` was NOT added.
- **Course checkout copy.** The refund promise ("Bezmaksas atteikšanās līdz
  7 dienām pirms norises…") is a visible line under the button, not only
  inside the collapsed disclosure — it is the strongest risk reversal on the
  site. The invoice route is a prefilled `mailto:` (subject + body listing
  what to send) ending "Pēc rēķina apmaksas nosūtām kalendāra saiti", so an
  invoice buyer has a path to the calendar. "Apskatīt kalendāru" stays: the
  URL is the Stripe redirect target, removing the button closes nothing —
  the free-seat hole is closed on the Cal.com side (owner action, below).
- **`proof` per course renders under the buy button only when non-empty.**
  `course-sessions.njk` is one include for three instructors, so a literal
  proof line there would render under the wrong name. Meta carries the
  certifications line; SEO and Google Ads are empty until there is
  something true to say.


**What the pass changed on the pages (all rendered from data, nothing
typed):** "Pieteikties iepazīšanās zvanam" on `/` and `/portfolio/`;
`/pakalpojumi/` closes on two doors (free call, cyan; paid consultation,
ghost, with the prices); the `/sazinies/` card says the paid formats and
"Šī nav iepazīšanās saruna"; the four portfolio cases carry ids
(`#brew-company`, `#cetras-zoles`, `#instant-change`, `#excel-know-how`)
and the hero chips plus a "Skatīt rezultātus" line under each marquee link
to them; `/facebook-reklama/` proves at the buyer's budget (Četras Zoles as
one dated outcome in a `.stats--row`, NOT a second `.panel`), prices the
60-min consultation, describes "Kas notiek pēc zvana" with "parasti" and no
numbers, and promises ONE report (CAC/ROAS-first, conditional on tracking)
in all four places; course pages say "Rezervēt vietu" only while a
`bookUrl` exists, carry "Rīgas laiks" and the language once in the price
card, and the Meta page answers the budget and the two-courses questions
the Google page already did; `/tiktok-kursi/` no longer shows a course
price; the hub is a flat "150 € + PVN par kursu" with the catalog tiles
rendering price, instructor and cadence from data; the consultation page
names the two fixed lengths plus the bundle everywhere (no "30-60 min"),
promises a list "ko pats pierakstīsi", and its instructor card carries the
Meta badges and the lecturing sentence verbatim from `/sazinies/`; 38 blog
closers quote a price through `{% offer %}`.

**The ladder is published (7 Sep 2026).** `src/_includes/ladder.njk` is the
three rungs in one place — Dari pats (course, price and hours from
`courseSessions.json`) → the hub; Izlem kopā ar mums (consultation, price
from `booking.json`) → `/marketinga-konsultacijas/`; Nodod mums (managed
Meta ads from 500 €/mēn, video and automation priced by scope) →
`/sazinies/`. It closes `/pakalpojumi/` in place of the old cta-band and
sits above the application form on the course hub. **Exactly ONE
`.arrow-link` per cell, as a direct child**, so `.cell:has(> .arrow-link)`
makes each card clickable and still points at one URL; the block carries
no button and therefore no cyan, so it is safe on a page that already has
a primary CTA. The 500 €/mēn figure is the page's own public line
(`/facebook-reklama/` hero and FAQ), not a new claim.

**Meta ad management terms are public (owner, 7 Sep 2026):** *"meta ads is
recurring with 3 months commitment; they dont pay if we dont provide
results (they still pay adspend)"*. `/facebook-reklama/` now states it in
two places — the section 02 lead and two FAQs: the service is monthly with
a **three-month initial period**, and **if the result agreed BEFORE the
start is not reached, the management fee is not paid**; the ad budget is a
separate expense Meta charges straight from the client's own account and
is owed either way. The price itself stays "atkarīga no darba apjoma".
**The phrase "par kuru vienojāmies pirms sākuma" is load-bearing** — it is
what makes the promise enforceable in one direction only, so do not
shorten it to a bare "ja nav rezultātu, nemaksā". **What counts as the
result, and who decides it, is still undefined** — agree it in writing per
client at the proposal stage, or the clause is a dispute waiting to
happen. The team-discount promise was removed the same day: nothing
anywhere now says "atlaides kolektīviem" (no percentage or threshold
existed), only "komandām sagatavojam atsevišķu piedāvājumu".

**Owner-gated — NOT done, do not guess (plan §4, 6 Sep 2026):**
1. Confirm 500 €/mēn is still the line you want quoted on `/pakalpojumi/`
   and the course hub, and whether the ad posts should carry it too.
2. Team pricing: a discount and threshold, or delete "Atlaides kolektīviem"
   (hub, meta description, catalog tile). Closed corporate sessions yes/no.
3. Brew Company: 75 000 € per month (prose, and the `/facebook-reklama/`
   stat label) or the total (the portfolio tiles only add up as a total:
   75 000 × 13,36 ≈ the 1M+ revenue tile)? STILL UNANSWERED and still the
   one live claim that reads two ways — do not "fix" it by arithmetic, ask.
   Year of each portfolio case is also still missing. Excel Know How was
   1174 € in the stat and 1175 € in the prose; the stat was aligned to the
   prose (the older, original WordPress text) on 7 Sep — reverse it if the
   stat was right. The Lumi horizontal Feed cuts are claimed in the prose
   as delivered but were never uploaded, so only the section heading was
   changed to stop promising a format the gallery does not contain.
4. Do Meta and SEO participants get materials and a checklist (only the
   Google page claims it)? Attendance confirmation? The hub's "Q&A sesijas
   un diskusiju grupas" claim was DELETED on 7 Sep — nobody runs them; the
   blurb now routes to the paid consultation instead.
5. Group-failure conversion rule and who delivers post-course sessions for
   the Google and SEO courses (the "Pēc nodarbības" block, §3 D, not built).
6. Consultation: cancellation window checked against the 14-day withdrawal
   right; written recap yes/no (page now promises none); Google Meet +
   Latvian chip; bundle expiry/transferability; Cal.com booking questions
   ("Mājaslapa", "Kas šobrīd nestrādā?") — step 02 copy waits for them.
7. Meta service: fee model, setup fee, term, notice, proposal turnaround,
   time to launch, report day (§3 F). Nothing with placeholders goes live.
8. More Timber quote on `/facebook-reklama/` only if it was a Meta lead-gen
   engagement. Četras Zoles IS now named on the Meta course page (the
   portfolio already publishes it) — veto if unwanted.
9. Kristaps: LinkedIn, certification, basis for "vairāk nekā 10 miljonus
   eiro". Matīss: a nameable client behind "2–10 reizes".
10. Account actions: Stripe adjustable quantity (1–12) on the three course
    links; Cal.com — booking questions, minimum notice 3 days, course and
    consultation events hidden from the public profile (the public calendar
    link books a seat WITHOUT paying — that hole is closed on the Cal.com
    side, not by removing the button); whether the Cal.com plan has
    Workflows; the webinar thank-you page's redirect target (its button
    still goes to the blog).
11. Who delivers a TikTok consultation — until then the button says
    "Individuāla konsultācija".

**Nunjucks trap hit three times in one pass:** `selectattr("id", "equalto",
"60")` silently ignores the test and returns every item with a truthy `id`,
so `| first` is always the first option. Look up by index, loop with an
`{% if %}`, or use `rejectattr("sessions")`; on pages the `{% offer "60" %}`
shortcode is the simplest.

## Two artwork languages, settled 5 Sep 2026

After a long exploration the owner settled on two — and only two — treatments.
Everything else was reverted, so do not re-litigate this.

**1. Blog infographics: CUT-PAPER COLLAGE on PURE WHITE.** Every element is
a flat piece of cut paper — crisp edges, slight offsets where pieces overlap,
subtle paper grain — in navy, cyan, pale grey. Big navy numerals, one emblem per
item, and the emblem must plainly read as its own subject (a form panel, an
envelope, a bar chart). **Nothing in the margins**: no decorative shapes at the
left or right edges, no confetti, no background pattern. `PAPER_SUFFIX` encodes
this; each slot prompt describes its own emblems. All six in-article
infographics are drawn this way.

**The ground must be exactly `#ffffff`** — these sit flush on a white article
page, and a cream rectangle pasted onto white is the whole problem the owner
reported. gpt-image-2 keeps a warm cast on some of them however firmly the
prompt asks, and re-rolling returns byte-identical files, so `npm run whiten`
(`tools/whiten-paper.mjs`) fixes it deterministically: it measures the ground
from the four corners and repaints only pixels at or above that luminance with
a low channel spread, leaving every navy, cyan and pale-grey cut-out and its
paper texture untouched. It REFUSES to write when the match covers under 15% or
over 92% of the image, which is what caught a too-tight saturation cutoff —
that threshold is now derived from the ground's own warmth. Cut no shape from
white or off-white paper; it would vanish. Run it after regenerating any
`style: "paper"` slot.

`.infographic` takes its background from `--canvas`, not `--card`, so the
figure matches the page ground on both surfaces.

**On phones the text version leads (5 Sep 2026).** These collages bake their
labels into a 1536px-wide image. In the 602px article column that reads at
~16px, but at 375px the image renders at 333px, so labels land at ~9px and the
notes at ~6.5px — unreadable, and most blog traffic is a phone. Measured, not
guessed. `main.js` therefore sets `open` on every `.infographic-text` under
700px, so the words are visible and the picture supports them instead of
carrying them. Desktop is unchanged (the disclosure still collapses), and with
JS off nothing changes at all — the `<details>` still works as a toggle.
**Do not solve this by shrinking the type in the prompts**: fewer, larger
items per image is the real fix if one ever has to be redrawn.

**2. Course and LP header images: the ORIGINAL house style, subject made
explicit.** Flat colour blocking on `#020d1c`, cyan used sparingly, generous
negative space, asymmetric, cropped by an edge — unchanged. What changed is that
the picture must now SHOW ITS SUBJECT: a viewer should be able to tell what the
page sells from the artwork alone. The old blanket ban on user-interface
elements is lifted, because a phone frame, a search field or a results list is
usually the clearest way to say what a page is about.

**Only four images use treatment 2** — `meta-reklamas-motivs` (a feed post in a
phone), `google-ads-motivs` (paid placement above organic results),
`seo-mekletaja-motivs` (a result climbing the rankings) and
`konsultacijas-saruna` (two profiles either side of one cyan square). Owner,
5 Sep 2026: *"dont change anything in the current dark background pages and blog
thumbnails, i like them as they are. Apply the new UI-related style only to
course and LP headers where appropriate."* Every other motif and all 31 blog
covers keep the artwork they already have, and their manifest prompts were
reverted to the text that produced those files — so `npm run images --force`
reproduces what is on disk instead of silently redrawing pages that were
deliberately left alone.

**Ten blog covers were repointed on 10 Sep 2026** — that part of the 5 Sep note
no longer holds for them. Owner, seeing the abstract set on the blog index:
*"change and remake these images to something that's more similar to the topic
they are describing; and re-make the animations from the new pictures."* The
covers for `remarketings`, `konversiju-uzskaite`, `kas-ir-seo`,
`google-reklamas-agentura`, `google-reklama-2025`, `maksligais-intelekts`,
`reklamas-agenturas`, `digitalais-marketings`, `google-ads-pirma-kampana` and
`instagram-reklama` were 19-Aug artwork — a loop, a split circle, a cog, a
funnel — that said nothing about the article underneath. Their prompts now name
the actual subject (a results list, a page button feeding a bar chart, a
campaign tree, a bid auction, a feed advert) in the subject-explicit language
STYLE_SUFFIX has asked for since 5 Sep, and every one was re-traced so the post
header animates the new picture. **Everything else on the blog still keeps the
artwork it has** — the 5 Sep instruction stands for the other 31 covers and for
every page motif.

Two things this pass had to fix by hand, both worth knowing before writing a
prompt in this style: asking for an "auction" got a literal wooden gavel and a
results panel full of interior detail (naming the shapes to EXCLUDE fixed it),
and asking for a post image inside a phone got a large pure-white square — the
light-slab artifact `.img--card` was deleted for. Say "no white anywhere in the
picture" when a large fill is unavoidable.

**What was tried and rejected**, so nobody repeats it: a precision-schematic
hairline redraw of every motif (*"too much of everything in there"*), three
rounds of thin-line white infographics (*"I honestly hate the white infographic
drawings"*), and six alternative design languages — Swiss brutalist, editorial
serif, isometric, riso halftone, data-viz, neon, clay, glassmorphism, Bauhaus,
blueprint. Two lessons worth keeping: banning icons outright makes the model
draw the same meaningless scribble in every column, and three small equal
drawings in a row on a field of white cannot be made to look good at any level
of polish — something has to be oversized or cropped.

## No background decoration on the dark infographics (5 Sep 2026)

`DARK_INFO_SUFFIX` used to ask for a faint construction layer behind the
content: long rules, dashed guides, registration squares and tick scales in
`#16283f`, running off all four edges. Owner: *"whats up with that extra
subtle linework in the edges... we agreed not to use that"* - the same
decision already made about the hero (*"no grids or anything"*). The suffix
now states the dark navy is empty and forbids construction layers, grids,
dashed guides, registration marks and tick scales anywhere in the frame.
Depth comes from the weight of the drawings alone. All five dark-info
images were regenerated.

**Equal drawings on one baseline beat a clever cross-column diagram.**
`info-meta-kampanas-uzbuve` asked for a single hierarchy tree spanning the
three columns. The model gave column 01 a small box with a dangling line and
half a column of dead space while column 03 got a detailed mock, so the three
drawings were different sizes and the picture read as unfinished. Owner:
*"fix this image, its quite ugly"*. It is now three frames of identical size
on a shared baseline, with nothing connecting them. Use that shape unless a
diagram genuinely needs to flow between columns.

## Latvian polish through the OpenAI API (5 Sep 2026)

Owner: *"please consider using a later OpenAI model for writing via API;
their Latvian is actually quite good, so let's test it on one article."*

`node tools/lv-polish.mjs <slug> [--model=gpt-5.5] [--write]` sends a post's
body to an OpenAI text model with a Latvian editing brief (fix calques,
English sentence shapes, American marketing jargon and grammar; change no
facts, structure, links, shortcodes or length; "Tu", short sentences, no em
dashes). Without `--write` it writes `<slug>.polished.md` for a diff.

**It is a second pass, not a writer.** What it reliably catches on this
site's drafts: wrong cases (`tikai fakti` -> `tikai faktus`), agreement
(`no lieliem datu apjomiem` -> `no liela datu apjoma un uz tā pamata`),
outright typos (`salieekam`, `nediraini`), and anglicisms the owner has
objected to (it replaces the noun `kreatīvs` with `reklāmas materiāls`
throughout). What it costs: it flattens a couple of idioms per article into
plainer phrasing, so **read the diff before applying**.

Three guards, each added because the model broke something:
- it verifies heading count, the link list and the `{% infographic %}`
  blocks, and **exits 2 without writing** if any changed;
- typographic quotes are normalised back to straight ones (the site uses
  straight quotes everywhere);
- **raw HTML lines are restored verbatim** - it rewrote an en dash inside a
  YouTube embed's `title` attribute.

Model ids on this key are the `gpt-5.x` / `gpt-6-astra` family; `gpt-5.5` is
what these runs used. `gpt-5` is NOT a valid id, despite being the tool's
old default.

**`npm run lv:review` is the companion that only REPORTS** (`tools/lv-review.mjs`;
takes slugs, paths, `--posts` or `--pages`). It exists because lv-polish
rewrites wholesale and therefore never tells you what it *left alone* — over
one session the owner caught three constructions it had passed over
("Esi pārāk tuvu savam biznesam", "ar sveša cilvēka acīm", "svešs skatiens"),
all calques that read fine to a non-native writer. lv-review quotes the
offending sentence, says why, suggests a fix, changes nothing, and **drops any
finding whose quote is not literally in the file** (the model paraphrases and
would otherwise invent). It also reads `src/pages`, which lv-polish cannot —
and the worst of those three offenders was on a page.

**Precision: roughly one finding in three is worth acting on.** Measured, not
guessed — every finding on one article was judged by hand: 5 of 14 were real.
A full run reports ~650 findings over 41 posts, which is not 650 errors; the
model over-flags on long prose. **Use it to find PATTERNS that repeat across
files, not as a to-do list.** Two such patterns were real and were fixed
sitewide: "X puse" (14 instances) and the reflexive "optimizēties/optimizējas
uz" (a system does not optimise *itself* onto a goal). The plain active
"optimizē uz konversijām" is normal industry Latvian and stays.

**It cannot tell voice from error.** On `/video-reklama/` it flagged the improv
performers' own comedic bios — *"esmu improvēzijs gan Latvijā, gan citā vietā
Latvijā"* is a joke, not a mistake. Never apply its findings to quoted people,
testimonials or verbatim client copy. It is reliable on OUR prose only.

**The calque it found most of: "X puse" for the English "the X side (of it)".**
Fourteen instances across the blog — "kampaņas puse", "budžeta puse",
"mājaslapas pusi", "meklētāja pusi", "plānošanas puse" — nearly all in the
same closing formula "bet X puse rakstā Y". All rewritten to natural forms
("bet par budžetu lasi rakstā Y"), which also broke up a template that was
repeating across a dozen articles. **Keep**: `servera puses notikumi` (the
accepted term for server-side events), `juridiskā puse` (genuinely idiomatic),
and `pusi lauku` / `uz pusi` (literally "half").

## The 2026/2027 blog rewrite pass (in progress)

Owner: *"go through each blog article and re-write it for 2026/2027 current
trends... deep linking between the relevant blog posts, and also outbound
links to affiliates or actually good tools where appropriate. Leave those
that are still relevant today without much changes. End posts with good
CTAs."* Length target 900-1,100 Latvian words (Latvian runs ~40% shorter
than English, so that is 1,200-1,400 English words - do not pad to hit a
literal 1,000 floor).

**Link priority, owner's own:** the Meta course and the agency services
first, the general digital marketing course second, other lecturers' courses
only where the topic genuinely belongs to them.

**The Meta cluster shares one editorial line**, so the five posts agree
rather than contradicting each other: the algorithm now picks the audience,
so the work moved to (a) the signal - pixel PLUS Conversions API, (b) three
to five genuinely different creatives per ad set, (c) leaving the campaign
alone long enough to leave the learning phase. Stacked interest audiences and
tight lookalikes are called out as harmful in a market this small; the 10%
lookalike advice for Latvia is the owner's own and stays.

**All 33 posts have been through this pass (5 Sep 2026).** Recent ones
(`marketinga-automatizacija-ar-ko-sakt`, written 21 Aug 2026) were left
alone; the rest were either rewritten or corrected.

**Factual errors found in the existing copy and fixed** - worth listing,
because they were live for years:
- `cik-maksa-reklama-facebook` published a budget formula that MULTIPLIED
  by the conversion rate instead of dividing (100 x 0,50 x 5% = 2,50, not
  the 1000 EUR it claimed). It now works backwards: customers -> clicks ->
  budget.
- `marketinga-macibas` stated a Facebook ad cannot run on any other
  platform. One Meta ad runs across Facebook, Instagram, Reels, Messenger
  and partner sites.
- `seo-optimizacija-tavam-biznesam` credited Google's algorithm with scoring
  transition words and passive voice. Those are Yoast plugin criteria. It
  also taught keyword density (1-2,5%), an obsolete myth.
- `7-digitala-marketinga-riki` recommended Google Optimize, shut down by
  Google in 2023.
- `epasta_marketings` treated open rate as a metric to steer by; it has not
  been reliable since Apple began pre-loading images.
- `tiktok-reklamas-klientu-piesaistisanai` closed by selling the TikTok
  course, retired in Sep 2026.
- `kas-ir-seo` told the reader to see a "Digitālais mārketings" article and
  did not link it; `instagram-reels-marketingam` had no CTA at all.
- Stale third-party statistics were dropped rather than carried forward (a
  Wolfgang Digital 2020 report, 2023/2028 AI market sizes).

**The one editorial line the whole blog now shares**, so posts stop
contradicting each other: execution got cheap (a draft is a prompt away),
algorithms took over audience selection, and some search answers never
reach a website - so value moved from making to choosing. In the ad posts
that means signal (pixel PLUS Conversions API), three to five genuinely
different creatives, and leaving a campaign alone long enough to leave the
learning phase. In the SEO and content posts it means general explainers
lose clicks and what earns the visit is what a model cannot invent.

**Length.** Latvian posts land 580-2,250 words, most 650-1,200. Several
decision-shaped posts are deliberately short; padding them was rejected in
favour of adding sections that were genuinely missing (what it costs in
time and money, what to measure, what the tools actually cost).

**Five new posts written 5 Sep 2026**, chosen by gap analysis rather than
keyword volume: each one was already being linked toward by the rewritten
cluster and had nowhere to land.

| slug | why it exists |
| --- | --- |
| `/konversiju-uzskaite/` | 16 of 33 posts said tracking decides results; none explained it |
| `/google-ads-pirma-kampana/` | the site sells a Google Ads course and had no practical campaign post |
| `/google-uznemuma-profils/` | local search, the channel the trades examples in other posts need |
| `/majaslapa-kas-pardod/` | posts say "fix the destination first" and had nowhere to send readers |
| `/reklamas-video-ar-telefonu/` | posts repeatedly say "film three vertical videos" and never said how |
| `/remarketings/` | mentioned across the ad cluster, never explained; the standard advice is now backwards |
| `/atslegvardu-izpete/` | both SEO posts and the Google Ads post send readers here |
| `/b2b-marketings/` | several posts tell narrow-B2B readers to do something else and had nowhere to send them |

Three more were added the same day (eight in total, 41 posts). Two carry
findings worth keeping:
- **Retargeting has inverted.** The version every guide leads with (pixel,
  follow the site visitor around the web) is now the WEAKEST of the four
  options: third-party cookies are blocked by default in Safari and Firefox,
  iOS opt-in is a minority, and Meta's cookie-based match rate has fallen
  materially. Uploaded first-party lists and in-platform engagement
  audiences (video viewers, message senders) are the strongest, because no
  browser can block them. `/remarketings/` ranks all four accordingly.
- **Keyword tools under-report this market.** A large share of valuable
  Latvian queries show as "0 searches a month" because the volume sits under
  the tool's threshold. Never discard a query the tool cannot see if
  customers actually ask it.

Facts in these were **researched, not recalled** (Meta's one-click CAPI from
spring 2026 and the 1-10 Event Match Quality score; Google retiring
standalone Display into Demand Gen in July 2026 and AI Max absorbing DSA;
Google Business Profile carrying the largest share of local ranking
signals). Re-check them before reusing; this is the fastest-moving material
on the site.

**Owner directions that shaped them (5 Sep 2026):**
- *"tracking also does not really decide the cost, just shows it"* — correct,
  and an overclaim of mine had spread to three posts. The honest line, now
  used everywhere: tracking makes the real cost visible and gives the
  algorithm something to learn from; **decisions** lower the cost.
- *"use smart copywriting and persuasion to move and inform people why
  professional services like mine move the needle"* — each new post closes
  with a section making that case from the article's own logic (tracking
  breaks silently and nobody invoices you for it; you cannot read your own
  page with a stranger's eyes), then three routed options: learn it, get it
  audited, or hand it over. **Persuasion through specificity, never through
  invented numbers** — the only figures used are the owner's own from
  `/sazinies/` and the course pages.

**Every post now has at least two inbound links from other posts.** New
posts arrive as orphans; wire them in deliberately or they stay that way.

**No affiliate links have been invented.** Outbound links point at the
vendors themselves (ChatGPT, Claude, Canva, CapCut, MailerLite, Meta's own
tools). Send real affiliate ids for a one-pass swap.

## Images must carry content (4 Sep 2026)

Owner: *"I thought we agreed not to use the full-size sections with just one
image without text… when I asked to add images, add it via OpenAI API and
oftentimes with text where it makes sense."*

**A full-width `.media--band` holding one decorative picture and nothing else
is not allowed.** Five of them were removed (`/marketinga-konsultacijas/`,
`/digitala-marketinga-kursi/`, and the three course pages) and their
text-free artwork deleted from the manifest. An image either sits beside copy
in a `.row.cols-2` / `.cell-media`, or it carries its own content as an
infographic.

- **`"style": "dark-info"`** in `imagery.json` is the third generator style:
  the PAPER_SUFFIX permission to render exact Latvian strings, but on the house
  dark canvas. Use it for infographics on marketing pages; `paper` stays for
  in-article ones on white, and the default text-free style for covers and
  motifs.

**All three styles were rewritten on 4 Sep 2026 into the site's own ledger
language** (owner: *"currently look very basic… make them cooler and more
aligned with the website"*). The shared vocabulary is now: left-aligned
headline ending in a cyan full stop, indexed columns (`01` in cyan plus a short
cyan rule, exactly the `.eyebrow` device), hairline separators instead of boxed
cards, square corners only, cyan rationed to under 5% of the frame, and depth
from line weight rather than fill. Motifs read as precision schematics cropped
by the frame, not as flat shape compositions.

**Two corrections came from the owner while tuning it, both worth keeping:**
1. *"why are they simple lines; make them relevant to the subject."* Banning
   icons outright made the model draw the same meaningless scribble in every
   column. Every slot prompt now describes **its own diagram per item** — a
   funnel, a struck-out keyword row, a ranked list — and the style brief
   requires the drawings to differ from each other.
2. *"Icons and people are okay as long as they fit the overall style,
   especially when making the subject more clear."* So recognisable icons and
   simple human figures ARE allowed, drafted in the same thin geometric line
   work. They must never be soft rounded clip art, and never a portrait-like
   face standing in for a real team member — that rule is unchanged.
- **`.infographic` background is `var(--card)`, not `#fff`.** Hard-coding white
  punched a light slab into the dark canvas — the artifact `.img--card` was
  deleted for. The token resolves to white inside `.paper` and `#00152c`
  outside it, so one component serves both surfaces. Pass
  `class: "infographic--page"` outside articles.
- Generate these at `--quality=high` and **proof-read every one**. The first
  Google Ads render drew the literal word "vārds" inside an icon because the
  prompt said "a crossed-out word" — describe icons as shapes and state that
  they contain no letters.
- Don't add an infographic that restates the cells next to it. The
  consultations page lost its band and got nothing back, because section 01
  already answers "is this for me" in three cells.

## Whole-card links (5 Sep 2026)

Owner: *"make the whole cards in pakalpojumi and kursi clickable, urls not just
the links at the bottom of the cards"* — and the main page.

Done as the **stretched-link pattern in CSS only**: the card keeps ONE real
anchor, the existing "Uzzini vairāk", and that link's `::after` is absolutely
positioned over the whole card. No nested anchors, no JavaScript, no markup
change, and screen readers and search engines still see a single properly
labelled link rather than a div with a click handler.

Cards are selected with `:has()`, so nothing in the HTML moved; where `:has()`
is unsupported the bottom link simply keeps working. **This is only safe because
no card in these grids points at two different URLs** — that was verified before
writing the rule, and it is the thing to re-check before adding a second link
inside a cell. Text inside a stretched card is no longer selectable; that is the
accepted trade and not worth a JS workaround here.

`tools/_stretch-check.mjs` is not kept in the repo, but the check that matters
is: for every `.cell`/`.course-tile` with an `.arrow-link`, scroll it to centre
and confirm `document.elementFromPoint` at its middle resolves to that card's
own href. 15/15 pass across `/`, `/pakalpojumi/` and `/digitala-marketinga-kursi/`.

## Motion on inner pages (4 Sep 2026)

Owner: *"add cooler images and subtle animations to the course pages."* Done
by extending what already exists, not by adding a library:

- `main.js`'s reveal target list gained `.course-card, .instructor-card, .faq,
  .tick-list li` — the stagger is per parent, so tick items cascade inside
  their own list. `.tick-list li.reveal` uses a 6px rise instead of 12px,
  because at list density the larger shift reads as jitter.
- `.page-hero` children rise in on load through a **CSS-only** `hero-rise`
  keyframe with `backwards` fill. No observer, so a page can never be left
  with an invisible headline if the script fails. It applies to every inner
  page, not just courses — one hero treatment, not two.
- `.cell-media img` scales to 1.045 on hover/focus-within. `.cell-media`
  already clips, so this stays a flat crop change: no shadow, no glow.
- All of it sits inside `@media (prefers-reduced-motion: no-preference)`.

Three new artwork slots: `google-ads-motivs` (bid columns over a query field),
`google-ads-konversijas-band` (thinning click lanes ending in one solid mark),
`seo-satura-struktura-band` (site architecture tree), `meta-kreativu-testi-band`
(9-up creative grid, one tile wins). **The Meta grid needed a second pass** —
the first render came back with a lighter background and a gradient-filled
tile. The prompt now states the background colour as edge-to-edge uniform and
forbids gradients, fades and partial opacity explicitly. Proof-read generated
artwork against the house style; the model drifts on "flat".

## Lead magnet: the automated page check (8 Sep 2026)

Owner asked for a lead magnet, "free ad or automation audit", as a popup.
Built as an **automated on-page check**, deliberately not as a free audit.

**Why the naming matters.** The copy rules forbid advertising free advice, to
protect the paid consultation. A machine-generated report is not advice, so it
does not breach that rule - but only while it stays machine-generated. It
reports ONLY what one HTTP fetch of the visitor's page can prove and routes
every interpretation to `/marketinga-konsultacijas/`. **Do not add judgement,
scores, recommendations or anything a human would have to stand behind**, or
it becomes the free consulting the rule exists to prevent.

- **n8n workflow `PxXdIWi34gIyEfMz`** (`POST /webhook/audits`) fetches the URL
  and returns nine checks as JSON: GA4, Meta pixel, Google Ads tag, title
  length, description length, H1 count, viewport, structured data, og:image.
- **Consent-gated tracking is reported as "could not verify", never as
  missing.** Tags that load after a cookie banner are absent from the served
  HTML, so a flat "no GA4" would be wrong on every well-built site -
  marketingaskola.lv included. A detected consent manager downgrades those
  three checks. Verified: the site scores 8 ok / 1 unknown / 0 failures on
  itself, and 6 failures on a bare page.
- **The e-mail never reaches n8n.** The browser sends the URL to the webhook
  and the address straight to MailerLite, so no personal data enters n8n's
  logs and a MailerLite outage cannot cost the visitor their report.
- **CORS is pinned to `https://marketingaskola.lv`** in the respond node.
  n8n answers the preflight itself (verified: 204 with the right headers), so
  a JSON POST works from the site and from nowhere else. It therefore CANNOT
  be tested from `localhost` - the local failure path is the expected result.

**The popup never opens immediately.** Google treats an interstitial covering
content on arrival as a mobile ranking problem, and it is rude. Twenty seconds
of arming, then exit intent on desktop or 55% scroll on phones; once per
visitor, 60 days after a dismissal; **never while the cookie banner is still
open**, because two overlays on a first visit is how people leave. Suppressed
on `/sazinies/`, `/privatuma-politika/`, `/marketinga-konsultacijas/` and any
`noindex` page. `src/js/leadmagnet.js`, `.lm*` in the stylesheet.

**On phones it is a BOTTOM SHEET, not a full-screen panel (9 Sep 2026).**
Owner: *"maybe don't make the popup full screen on mobile"*. The `max-width:
560px` rule used to set `place-items: stretch` and `min-height: 100%`, so the
panel covered the article edge to edge. That is an interstitial, which is the
exact pattern the 20-second delay and the scroll gate exist to avoid, so the
markup was undoing the timing work. It now aligns to the bottom
(`place-items: end stretch`) and caps at `88svh` with its own `overflow-y`.
**`svh`, not `vh`** - `vh` on a phone measures the viewport without the
browser chrome, so 88vh still pushed the submit button under Chrome's toolbar;
a plain `88vh` line stays above it as the fallback. Measured with the result
state, which is the tallest the sheet ever gets: at 360x640 it scrolls inside
itself and the CTA stays reachable, and 77px of the page still shows above it.

**The copy leads with the stake, not the disclaimer.** The first version
opened on "Bezmaksas pārbaude" with an abstract headline and carried the
same caveat twice, once in the body ("To veic robots, nevis cilvēks") and
again in the fine print. Owner: *"this doesn't sound very exciting"*. It now
names what is actually checked (nine points, listed) and why it matters, using
the site's own true line: measurement breaks quietly, the ads keep spending
and the data stops arriving. **Specificity is what makes this exciting, not
adjectives** - and it stays inside the rule above, because naming the nine
machine-checkable points is not advice. One caveat remains, in the fine print
only.

**Owner action, and the lead magnet is worth little without it: MailerLite
double opt-in is still ON.** Every address collected here lands `unconfirmed`
until the person clicks a confirmation e-mail, which means they cannot be
emailed in campaigns and group automations generally will not fire. That is
correct for a newsletter and wrong for a lead magnet.

## Service page heroes are LIGHT — SUPERSEDED, see below (9 Sep 2026)

Owner: *"hero section is also too dark now; both before and next to generated
images. I think some contrast / lightness is needed here too to ease the
browsing."* The artwork had not fixed it, because the artwork is drawn on
`#020d1c` too - header dark, hero dark, picture dark, next section dark, with
no tonal step anywhere near the top of the page.

The six service heroes now carry `.paper` alongside `.page-hero`, so the page
reads white hero → dark → dark → white process section → dark → dark → band.
Two light zones, well separated, which is rhythm rather than stripes.

**The dark artwork on a light hero is the point, not a problem.** `.hero-media`
keeps an explicit `#020d1c` fill rather than `var(--canvas)`, so on white the
picture reads as a framed screen - a deliberate object - instead of a hole
punched in the page.

**Only service pages.** The homepage hero carries the drifting-dot SVG layer
that is built for a dark ground, and a blog post's dark hero is what separates
it from the white article beneath it. Course page heroes are still dark and
could go either way.

### The selector trap this exposed, and it will bite again

`.paper .page-hero .chip a { color: var(--link) }` did **nothing** here, and
the hero shipped a cyan chip link on white at **2.07:1** - the exact
combination the paper rules exist to ban.

The reason: `.paper .page-hero` is a DESCENDANT selector, and on these heroes
both classes sit on the SAME element. Every `.paper X` rule where X is a
descendant (`.paper .btn`, `.paper .panel`) keeps working; only the ones
naming `.page-hero` broke, silently, with no warning anywhere.

**Any `.paper .page-hero ...` rule needs its `.page-hero.paper ...` twin.**
Both forms are now written out, with a comment saying why.

Contrast measured on all six after the fix: h1 17.41:1, body 9.58:1, chip
label 5.20:1, chip link 6.88:1. Nothing under 4.5.

## The dark infographics are HTML + SVG now, not pictures (9 Sep 2026)

Owner: *"can you make the same style as for the pakalpojumi headers also for
these dark-infographics? same visual style; add animation and same background
as page, no frame?"*

All five `style: "dark-info"` rasters are gone, replaced by
`src/_includes/figures/*.njk`: **real HTML text plus one inline SVG diagram per
column**, no frame, page ground, animated with the same `--i` stagger as the
hero motifs.

**This fixes a documented defect rather than restyling one.** Those images had
Latvian baked into pixels, which meant: unreadable at ~9px on a phone (the
reason `main.js` force-opens the text version under 700px), a misspelling risk
no spellcheck could catch, invisible to search, and a re-render needed for a
one-word change. All four problems are gone because the words are now text.

**The hours come from `courseSessions`.** `kursi-tris-kanali` renders
`{{ km.hours }} stundas` rather than a drawn "3 stundas", so the figure cannot
drift from the price card the way a picture silently could.

`.figcols` layout notes, both found by measuring:

- **Every column carries the same `--figpad`.** Dropping it on the first column
  made that column's content box wider, so its SVG rendered 31px taller and its
  diagram and footer sat out of line. The grid is pulled left by the same
  amount instead, so column one still lines up with the heading.
- **Title and description both reserve two lines.** On a narrow column - the
  course pages put this beside a sticky sidebar - one title wraps and the
  others do not, which was another 33px of misalignment.

Verified across all five pages at 1360 / 900 / 390px: footer spread 0-5px, no
horizontal overflow.

**Pre-existing and untouched:** every page overflows 2px at 1024px from a
hidden `ul.dropdown` in the nav. Not caused by this work; confirmed on pages
without a figure.

**Rebuilt once, after a rejection worth recording.** The first version drew a
detailed thin-outline diagram per column. Owner: *"I dont like these at all...
they are not same style as the ones in the pakalpojumu header... make the
elements lighter; also for these maybe just create separate icon for each
thing being described."*

Two concrete faults. The hero motifs are **solid filled shapes**; those
diagrams were **2px strokes with `fill: none`**, so they were a different
drawing language sitting on the same page - the check is literal, the figures
now contain **zero `stroke=` attributes and 73 fills**. And a full diagram per
column competes with the text; one icon per item lets the column read as text
with a marker instead of a picture with a caption.

Icons are 96x96 viewBox at ~72px, in `#8ba3bd` / `#f2f5f8` with a small cyan
accent, exactly the hero palette.

**The rule is not "no strokes", it is "objects are filled".** A stroke is
correct when the thing being drawn IS a line: a flow connector, a tripod leg,
a phone bezel. It is wrong when a solid object is drawn as an outline, which
is what made the first figures read as a different language. Current state,
measured per page: `facebook-reklama` 1 (bezel), `seo-pakalpojumi` 2 (tree
connectors), `video-reklama` 3 (light stand), `ai-un-automatizacijas` 5 (flow
connectors), everything else 0. All legitimate lines; do not "fix" them.

`motifs/konsultacijas.njk` was redrawn for this: its calendar was an outlined
grid at 6 strokes to 8 fills, the one stroke-heavy motif of the six. It is
filled cells now, 0 strokes and 30 fills.

**The kursi hub has no figure, deliberately.** `kursi-tris-kanali` named the
same three courses that `course-catalog.njk` lists directly beneath it with
more detail, so it was pure duplication. Owner: *"for kursi, just remove these
as its exactly the same as below."* Removed, file deleted. A literal
heading-comparison misses this, because the catalog renders course names from
`courseSessions` rather than as static markup - compare what RENDERS, not what
is written in the page source.

**Still open, same class of problem:** `konsultacija-kad` sits immediately
after section 01 on `/marketinga-konsultacijas/`, and both answer "is this for
me" in three items. The wording differs (the section is situations, the figure
is triggers) so it is not literal duplication, but this note already records
the rule from 4 Sep: *"Don't add an infographic that restates the cells next to
it. The consultations page lost its band and got nothing back, because section
01 already answers 'is this for me' in three cells."* Owner's call. The closing note gets a hairline and its own
padding, or it reads as a runaway third sentence of the description.

## Blog posts have the same two-column header (9 Sep 2026)

Owner: *"I want all the blog posts to have the same style headers as the course
pages and service pages... Don't make them full size anymore... the heading is
on the left and on the right side there's this animation."*

`post.njk` no longer renders the cover as a full-bleed `page-hero--cover`
background. It uses `page-hero--media` like everything else: chip, headline and
meta on the left, an animated motif on the right, assembling on load.

**The motif is chosen by SUBJECT, not by category.** Categories are too coarse
here - `digitalais-marketings` alone holds SEO, e-mail, keyword research and
conversion tracking. `src/_data/postMotifs.json` maps each post to one of eight
motifs (`post-meta`, `post-google`, `post-seo`, `post-strategy`, `post-ai`,
`post-video`, `post-email`, `post-web`) with `strategy` as the fallback. All 42
posts are mapped explicitly; nothing currently falls back.

**The map is keyed on the PERMALINK slug, not the filename.** Several posts
deliberately differ - `google-reklama-2025.md` serves `/google-reklama/` -
because renaming the source file would orphan its cover image. The template
derives the key from `page.url`.

**`image:` front matter is untouched and must stay.** It still drives og:image
(a real JPEG, which an inline SVG cannot be) and the blog index cards. Verified
after the change: og:image present on posts, 40 covers still on `/blogs/`. Only
the hero stopped rendering it.

## Course pages have headers too, and in-page motifs animate on scroll (9 Sep 2026)

Owner: *"make headers for courses exactly in the same style and animations as
pakalpojumi headers"*, and separately *"for images like this through the page,
blend them into the page too by dissolving them into multiple elements; and
animate them when scrolled to to appear. also remove frame and put same
background as page."*

Five course motifs, same solid-fill language and `--i` stagger as the service
ones: `kurss-meta`, `kurss-google`, `kurss-seo`, `kurss-tiktok`, `kurss-hub`.
All five course pages now use `page-hero--media`. Zero strokes across the set.

**In-page motifs use `.motif--scroll` and ride the reveal observer that already
exists** in `main.js` - the parent picks up `.in` / `.is-visible` and the parts
stagger from there. No second observer.

**The holding `opacity: 0` sits INSIDE the `prefers-reduced-motion:
no-preference` block, and must stay there.** Under `reduce` it is never
applied, so the drawing is simply present rather than invisible waiting for an
observer that will never fire. That is the failure mode this pattern invites.

## Motifs are TRACED from the original artwork, never redrawn (9 Sep 2026)

Owner, after I hand-drew replacements: *"you are not using the same images. I
asked you to repurpose existing headers - split them by pieces and animate, not
invent new. I like the old style so just use and animate it, take longer if
needed."*

So nothing under `src/_includes/motifs/` is drawn by hand. Every include is
produced by **`tools/trace-motif.mjs`** from the raster that was already on the
page: quantise to the house palette, find connected regions per colour, walk
each region's boundary, emit one `<g class="m">` per shape. The result IS the
original picture, made of parts that can animate.

`node tools/build-motifs.mjs` rebuilds the lot. **Blog posts trace their OWN
cover**, so every post keeps the picture it had.

### Four things that had to be got right, all found by measuring

- **Draw order is grey, then off-white, then cyan, largest first.** That is
  both correct z-order (a light bar sits ON its slab, and tracing the slab
  fills the hole underneath) and a natural build-up.
- **Boundaries stay rectilinear.** A curve fitter would round the very corners
  the square-geometry decision insists on.
- **RDP cannot run straight at a closed loop.** First and last point are the
  same, so distance is measured against a zero-length line and the ring
  collapses to two points - this silently emptied seven covers. Split the ring
  at its furthest vertex, simplify two open chains, rejoin.
- **Never simplify a thin shape.** A 1px grid line is entirely "within
  tolerance" and flattens to a zero-area sliver, which is how a calendar grid
  came out as broken dashes.

### The gate, and why pixel agreement alone is not one

**`tools/verify-motifs.mjs` decides what ships.** It renders each trace against
its raster and applies TWO tests, because agreement alone lies on a sparse
drawing: a cover that is 95% dark ground "matches" a trace that lost the
picture entirely. So it also compares **retained ink**. With only the first
test, 5 of 59 failed; with both, **16 did** - including `band-meta-targeting`,
which looked fine and kept 15% of its drawing.

### It is also lighter, which was not the point but is worth knowing

Gzipped, a traced motif is roughly **a sixth** of the raster it replaced, and
it costs no image request at all. Measured across six:

| | inline SVG, gzipped | raster |
| --- | --- | --- |
| six motifs | 12.7 KB | 80.9 KB |

SVG path data compresses very well and webp is already compressed, so the raw
file sizes are misleading - compare gzipped. Sixty-seven inline motifs render
across sixty-two pages with none blank and no page overflowing.

### Why the sixteen cannot be rescued, so nobody retries it

They are not slab compositions. `meta-targeting-band` is 96% dark ground with
thin anti-aliased line work; traced at full resolution with a low area
threshold it yields **248 fragments**, which is both meaningless to animate and
past the tool's own sanity guard. Lowering the threshold or raising the trace
resolution does not help, because the strokes are anti-aliased rather than
flat. This technique suits flat colour blocking and nothing else.

Current state: **43 traced, 16 keep their raster.** A rejected motif is not a
problem to fix - some of this artwork is not flat-block art and does not
survive quantisation. `post.njk` falls back to `<img>`, and three bands went
back to their rasters. A still picture that looks right beats an animated one
that does not.

## Hero motifs are inline SVG that assemble part by part (9 Sep 2026)

Owner: *"can we make them as svgs or similar, break the image into elements and
animate them so they appear one after another, finishing in the full image?"*
Done, and it retires two problems rather than adding a feature.

`src/_includes/motifs/*.njk` holds five hand-authored SVGs — `meta`, `seo`,
`ai`, `konsultacijas`, `pakalpojumi` — included INLINE, because CSS can only
reach the parts when the markup is in the document. Each drawable is a
`<g class="m" style="--i:N">`, and the delay is
`calc(0.46s + var(--i) * 0.075s)`, so a motif can carry any number of parts
without touching CSS.

**`transform-box: fill-box` is required on those groups.** Without it the scale
pivots on the SVG user-space origin and every shape flies in from the corner
instead of settling in place.

**What this removed.** No ground to match, because there is no background rect —
the canvas shows through, so `npm run ground` is no longer needed for these and
`tools/match-ground.mjs` now takes explicit paths for whatever raster motifs
remain. No ink-density target either; that rule still governs raster motifs but
an SVG's weight is set by the drawing. And 100 KB of hero rasters became 20 KB
of markup, crisp at any size.

The six raster `hero-*.webp` files and their manifest slots are deleted. Git
has them if a motif ever needs to go back to raster.

## /video-reklama/ actors: cyan rings, not grey squares (9 Sep 2026)

Owner: *"they were already cuts with cyan rings; now it's just greyed
squares."* The complaint was about the **Aktieri section**, not the hero.

`.img--actor img` carried `filter: grayscale(1)` plus `background: var(--card)`
and a border, so five transparent cutouts drawn inside a cyan ring were
rendered as grey squares in boxes — throwing away the exact thing the assets
were made with. Now: no filter, no background, no border, `object-fit:
contain`. **Never put grayscale back here.** It is the same mistake as fading
logos with opacity, which this stylesheet already forbids.

**I misread this once and should not again.** I first moved the portraits INTO
the hero and replaced the motif, which was the opposite of the ask. Owner:
*"I asked for the video page the actors images to be used BELOW, replacing
current grey actors. Take back the header image and add the animation."* The
hero uses `motifs/video.njk` like the other five service pages; the portraits
belong in the Aktieri section and nowhere else.

`.hero-media--faces` and `@keyframes face-pop` are gone with it.

## No white slabs: the band and the tick (9 Sep 2026)

Owner, after seeing both: *"I'm not entirely a fan of entirely white sections
in the middle of the articles or pages as well. Fix those, maybe with different
accents or different kinds of solutions, so we can make it more interesting
without making it completely white."*

So `.paper` is off the service pages entirely — heroes and process sections
both. Two replacements, and they are the SAME device at two scales, which is
the point:

**`.sec--band`** is the process section: `--card` ground with a hairline top
and bottom. That is exactly `.cta-band`'s treatment, already in the system.
**The hairlines do the work, not the fill** — `--card` against `--canvas` is
1.06:1 on its own, so removing the borders removes the section.

**The tick** is a 24x3px cyan mark sitting on a rule that already existed. It
now appears in three places, deliberately: the indexed eyebrows, each step
inside a band, and each in-article `h2`. One accent meaning "a new section
starts here", at three scales. When a step gets the tick, its numeral drops
the cyan square it used to carry — two cyan marks per step is one too many.

**Why the articles were not un-whited.** The white reading surface there is
the owner's own earlier decision (*"keep white background for the blog
posts"*), and the in-article infographics are white-on-white on purpose —
`.infographic` takes `--canvas` precisely because a tinted panel draws a
visible rim around a pure-white collage. So the long flat white run is broken
with an accent per section rather than with a second surface. On paper cyan is
decorative only, which a tick is; the heading stays `--heading` and links stay
`--link`.

**What this supersedes.** The white hero, tried and reverted the same day, and
the `.paper` process section, replaced here. Do not reintroduce a full-width
white block on a dark page — it has now been rejected twice, once for the hero
and once for the mid-page section.

## Hero artwork is FRAMELESS — ground-matching now only for rasters (9 Sep 2026)

Owner: *"would it look better without the frame and same background as section
background, so the images would blend in the section instead of sitting as
separate elements. and maybe we can animate them too."* Yes to both.

`.hero-media` has no border and no fill. The artwork is generated on `#020d1c`,
so with the frame gone it reads as drawn on the page rather than as a picture
placed on it.

**A frameless motif needs its ground to be EXACTLY `#020d1c`, not close.**
Measured at the rendered image edge, the six were 3-6/255 off the canvas, and
on a large flat dark field that is enough to show a faint rectangle. The model
returns a different near-miss every roll however firmly the prompt states the
hex, so arguing with it is a waste.

`npm run ground` (`tools/match-ground.mjs`) fixes it deterministically: every
pixel already within 12/255 of the canvas is snapped to exactly `#020d1c`,
which catches the ground and the thin separations between shapes and touches
nothing else. Verified: ink coverage is identical to 0.1% before and after on
all six, so no drawing was altered, and the rendered edge delta went from 3-6
to **0.0/255 on all six**. It refuses to write when the matched share falls
outside 15-95%, because that means the tolerance is wrong for the image rather
than the image being wrong. Same reasoning as `npm run whiten`, which does this
for the white paper ground. **Run it after regenerating any hero slot.**

### Motion

The figure joins the hero cascade that already existed rather than introducing
a new device: `hero-rise` at a 0.42s delay, landing after the CTA, so the hero
assembles in reading order. It rises 22px rather than the text's 14px, because
the same distance on a 460px block reads as no movement.

Then `hero-drift`, 6px over 9s, infinite. That is the drifting-dot vocabulary
the owner already approved, kept below the threshold where motion reads as an
effect. **The entrance is on the FIGURE and the drift is on the IMG**, because
two animations on one element fight over `transform`.

Both sit inside `prefers-reduced-motion: no-preference`. Verified under
`reduce`: both animation names resolve to `none` and the figure's opacity is
1 — worth checking explicitly, because `backwards` fill on a cancelled
animation is exactly how an element ends up stuck invisible.

## A dark motif needs ~35-45% ink — applies to RASTER motifs only (9 Sep 2026)

Owner: *"hero section is also too dark now; both before and next to generated
images."* Then, on the obvious fix: *"no, simply white hero doesnt work.
rething that."* Both correct. What follows is the measured answer, so nobody
argues this one by eye again.

**A white hero was tried and rejected.** It reverted the same day. The header
directly above is dark and carries white logo artwork, so a white band
starting immediately beneath it reads as two unrelated slabs rather than one
page, and it gives away the thing that makes the site look like itself.

**Stepping the background does not work either, and the numbers say why.**
Hero on `--card` and the artwork panel on `--well` give contrast ratios of
**1.06** and **1.15** against `--canvas`. That is invisible. This palette has
no usable mid-tone between near-black and white, so "make the section slightly
lighter" is not an available move here. Do not try it again.

**The darkness was the artwork being empty.** Measured as the share of pixels
above 0.20 relative luminance:

| Slot | Before | After |
| --- | --- | --- |
| `hero-video-reklama` | 38.0% | 38.0%, untouched, already right |
| `hero-pakalpojumi` | 37.7% | 37.7%, untouched, already right |
| `hero-seo-pakalpojumi` | 18.7% | 53.6% |
| `hero-meta-reklama` | 14.5% | 41.8% |
| `hero-konsultacijas` | 9.2% | 36.8% |
| `hero-ai-automatizacijas` | 8.1% | 25.2% |

**Line-and-bar subjects resist this and need different wording.** SEO and
automation are diagrams, so their mass is in strokes rather than solids, and
the first rebalanced pass moved them only to 21.0% and 20.3% while the
object-based slots hit 37-42% straight away. Saying *"a SOLID slab, a filled
rectangle, not an outline"*, with explicit sizes (*"each bar about a twelfth
of the frame height"*), is what moved them. Automation still sits at 25.2%,
which was accepted: the composition is dense where it matters and pushing
further risks the 74% overshoot again.

Four of six were 82-92% empty near-black. The two that read fine were the two
near 38%. **Target 35-45%.** Below ~20% a motif reads as a dark hole with a
small object floating in it, however good the object is.

**The overshoot is as easy to hit as the undershoot.** A prompt saying "FILL
the frame", "run right up to the edges", "cropped on more than one side"
produced **73.9%**: a close-up so tight the phone became abstract grey blocks,
and it brought back rounded corners, which the square-geometry decision
forbids. The working language is a *mid-shot*: objects drawn large but WHOLE
and readable, at most one lightly clipped by one edge, a modest dark margin
around the group, and an explicit "every corner is square".

**How to check, rather than squinting:** count pixels above 0.20 luminance
with sharp and compare against the table. `npm run images --only=<id> --force`
regenerates one slot. Existing approved motifs sit at 15-18%, which is why the
whole set has always felt dark; raise them if they are ever redrawn.

## Service heroes carry artwork now (9 Sep 2026)

Owner: *"for each service, in the hero section there should be a cool image...
just to showcase what the service actually is in that picture. With the same
kind of colors, but maybe just actual things, not people or logos."*

`.page-hero--media` puts a `.hero-grid2` two-column grid inside the hero: copy
left, `<figure class="hero-media">` right, collapsing to one column under
980px. **Source order is text first on purpose** - on a phone the image falls
below the headline and the CTA instead of pushing them off the first screen,
the same reasoning as the 3 Sep homepage hero work. Measured at 390x844: the
CTA stays above the fold and the artwork starts at 702px.

`.hero-media` takes `--canvas`, not `--card`. The artwork is generated ON
`#020d1c`, so a card-coloured box behind it draws a visible rectangle around a
picture that otherwise blends into the page.

Six new slots, all `default` style: `hero-meta-reklama`,
`hero-seo-pakalpojumi`, `hero-video-reklama`, `hero-ai-automatizacijas`,
`hero-konsultacijas`, `hero-pakalpojumi`.

**Two extra constraints in these prompts, both from the owner's wording.**
Objects only - the STYLE_SUFFIX still permits "a human silhouette", and these
slots explicitly forbid people, hands, faces and logos on top of it. And the
cyan budget is restated inside the prompt, because the model does not know it:
*"no more than about five percent of the frame, never fill a large shape with
cyan."*

**That second rule was learned by getting it wrong.** The first
`hero-meta-reklama` render put a huge solid cyan rectangle inside the phone as
the ad image, because the prompt literally asked for one. It was the
background-wash use the cyan budget exists to forbid. The fix is to make the
big shape cool grey and let cyan land only on the small call-to-action pill.
`hero-konsultacijas` failed differently on its first render: a large off-white
sheet, the light-slab artifact `.img--card` was deleted for, plus a
bottom-cropped composition. Both were regenerated with corrected prompts.
**Proof-read every one of these against the cyan budget specifically** - a
prompt that names a large cyan element will get you a large cyan element.

## Copy rules

- **Consultation policy** (owner, 21 Aug 2026 — supersedes the earlier
  blanket ban on the word "bezmaksas"):
  * A **free 20-minute introductory call** ("bezmaksas 20 min iepazīšanās
    zvans") is offered ONLY to prospects who want to work with the agency —
    i.e. people interested in services. Its CTA goes to `/sazinies/`.
  * **Advisory consultations remain PAID**: €90/h, €60/30 min, or a 5-session
    bundle at €370 (owner, 4 Sep 2026 — was €100/h). The prices live in
    `src/_data/booking.json` and the consultation page renders them from
    there, so change them once; prose on other pages is static, so grep for
    the old number too. See `/marketinga-konsultacijas/`. Never advertise free advice/strategy
    sessions, and never call a paid consultation "bezmaksas".
  * Course signup pages may keep "Piesakies bez maksas" — that means the
    *application* is free, not the course.
- **One name per rung (7 Sep 2026).** "Konsultācija" is reserved for the
  PAID product on `/marketinga-konsultacijas/`. The free 20-minute call is
  always "iepazīšanās zvans" — buttons read "Pieteikties iepazīšanās
  zvanam" and go to `/sazinies/`. Never "Pieteikties konsultācijai" on a
  link to `/sazinies/`: the same word was selling two rungs at two prices,
  and a reader who saw "bezmaksas 20 minūšu" forty lines up assumed the
  30-60 min talk was free too.
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

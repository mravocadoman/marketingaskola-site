# marketingaskola.lv — static site (migrated off WordPress)

Owner: Rihards (rihards@marketingaskola.lv). Latvian-language digital marketing
agency site, migrated from WordPress/Divi on 19 Aug 2026 by crawling the live
site and rebuilding it as an Eleventy static site. Content was copied verbatim;
the design system (Roboto/Roboto Condensed, cyan #03c3f8, navy #00152c) mirrors
the original.

## Stack and layout

- **Eleventy 3** (Nunjucks templates), no client framework, one plain CSS file.
- `src/pages/*.html` — the 19 site pages. Front matter + plain HTML sections.
  Section conventions: `.sec` (white), `.sec--dark` (navy), `.sec--hero`
  (photo + gradient, takes `style="--bg:url('...')"`) with `.row .cols-N > .col`
  grids inside. Components: `.btn`, `.blurb`, `.testimonial`, `.faq`
  (`<details>`), `.cta`, `.divider`, `.post-grid`.
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

## Known inherited issues (broken on the old WordPress site too)

These links 404 on the live WordPress site as well; they were copied as-is:
`/padzilinats-seo-kurss/`, `/digitala-marketinga-strategija-vaditajiem/`,
`/seo-pakalpojumi/`, `/improvizacija-un-izklaide/` (linked from course pages,
pakalpojumi, kas-ir-seo, reklamas-agenturas). Fix by creating the pages or
re-pointing the links — owner's call.

Two links were silently repaired during migration: `/meta-reklamas-kursi/` →
`/meta-reklamas-kurss/` (page was renamed) and
`/7-padomi-marketinga-strategijas-izstrade/` → `/marketinga-strategijas-izstrade/`
(was a 301).

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
